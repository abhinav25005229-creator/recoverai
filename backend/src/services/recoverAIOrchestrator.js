const pool = require("../db");

const axios = require("axios");
const {
    emitAgentEvent
} = require("./socketService");
const analyzeFailure =
    require("../../agents/failureAnalyzer");
const {
    getBestStrategy
} = require("./strategyLearningService");
const logAgentAction =
    require("./auditService");
const analyzeCustomer =
    require("../../agents/customerIntelligenceAgent");
    const canRetry =
    require("./retryPolicy");
    const {
    calculateRisk,
    classifyRisk
} = require("./riskEngine");

const evaluatePolicy =
    require("./policyEngine");
    const {
    createReview
} = require("./reviewService");
const {
    saveMemory,
    getMemories
} = require("./memoryService");
const generateStrategy =
    require("../../agents/llmStrategyAgent");

const validateDecision =
    require("../../agents/guardrails");

const executeAction =
    require("../../agents/actionAgent");


async function runRecoverAI(
    transactionId
) {

    console.log("\n");
    console.log("======================================");
    console.log("🤖 RECOVERAI ORCHESTRATOR");
    console.log("======================================");


    // ==================================
    // STEP 1 — Fetch complete context
    // ==================================

    const result = await pool.query(
        `
        SELECT

            t.transaction_id,
            t.customer_id,
            t.amount,
            t.payment_method,
            t.status,
            t.failure_reason,
            t.created_at,

            c.name,
            c.age AS customer_age,
            c.total_transactions,
            c.successful_transactions,
            c.failed_transactions,
            c.preferred_payment_method,
            c.total_spend

        FROM transactions t

        JOIN customers c
        ON t.customer_id = c.customer_id

        WHERE t.transaction_id = $1
        `,
        [transactionId]
    );


    if (result.rows.length === 0) {

        throw new Error(
            "Transaction not found"
        );

    }


    const payment =
        result.rows[0];


    console.log(
        "✓ Transaction context loaded"
    );

emitAgentEvent(
    transactionId,
    {
        agent: "SYSTEM",
        status: "completed",
        message: "Transaction context loaded"
    }
);

    // ==================================
    // STEP 2 — Customer Intelligence
    // ==================================

    const customerProfile =
        analyzeCustomer({

            customer_id:
                payment.customer_id,

            total_transactions:
                payment.total_transactions,

            successful_transactions:
                payment.successful_transactions,

            failed_transactions:
                payment.failed_transactions,

            preferred_payment_method:
                payment.preferred_payment_method,

            total_spend:
                payment.total_spend

        });
        await saveMemory({

    transactionId,

    agent:
        "CUSTOMER_INTELLIGENCE",

    memoryType:
        "CUSTOMER_PROFILE",

    content:
        customerProfile

});


    console.log(
        "✓ Customer analyzed:",
        customerProfile.segment
    );
    emitAgentEvent(
    transactionId,
    {
        agent: "CUSTOMER_INTELLIGENCE",
        status: "completed",
        message:
            `Customer classified as ${customerProfile.segment}`
    }
);
await logAgentAction({

    transactionId,

    agent:
        "Customer Intelligence Agent",

    action:
        "ANALYZE_CUSTOMER",

    input:
        payment.customer_id,

    output:
        customerProfile

});

    // ==================================
    // STEP 3 — Failure Analysis
    // ==================================

   const failureAnalysis =
    analyzeFailure(
        payment.failure_reason
    );


// ==================================
// PREVIOUS ATTEMPTS
// ==================================

const attemptsResult =
    await pool.query(
        `
        SELECT *

        FROM recovery_attempts

        WHERE transaction_id = $1

        ORDER BY attempt_number ASC
        `,
        [transactionId]
    );


const previousAttempts =
    attemptsResult.rows;


const attemptNumber =
    previousAttempts.length + 1;


// ==================================
// STEP 4 — ML Prediction
// ==================================

        let strategyRecommendation =
    await getBestStrategy({

        failureReason:
            payment.failure_reason,

        customerSegment:
            customerProfile.segment

    });

    await saveMemory({

    transactionId,

    agent:
        "STRATEGY_LEARNING",

    memoryType:
        "HISTORICAL_RECOMMENDATION",

    content:
        strategyRecommendation

});

await saveMemory({

    transactionId,

    agent:
        "FAILURE_ANALYZER",

    memoryType:
        "FAILURE_ANALYSIS",

    content:
        failureAnalysis

});

    console.log(
        "✓ Failure analyzed:",
        failureAnalysis.category
    );

    emitAgentEvent(
    transactionId,
    {
        agent: "FAILURE_ANALYZER",
        status: "completed",
        message:
            `Failure classified as ${failureAnalysis.category}`
    }
);

    await logAgentAction({

    transactionId,

    agent:
        "Failure Analysis Agent",

    action:
        "ANALYZE_FAILURE",

    input:
        payment.failure_reason,

    output:
        failureAnalysis

});


    // ==================================
    // STEP 4 — ML Prediction
    // ==================================

    const mlResponse =
        await axios.post(
            "http://127.0.0.1:8000/predict",
            {

                amount:
                    Number(payment.amount),

                customer_age:
                    payment.customer_age,

                previous_transactions:
                    payment.total_transactions,

                successful_transactions:
                    payment.successful_transactions,

                failed_transactions:
                    payment.failed_transactions,

                payment_method:
                    payment.payment_method,

                failure_reason:
                    payment.failure_reason,

                preferred_method:
                    payment.preferred_payment_method,

                hour:
                    new Date(
                        payment.created_at
                    ).getHours()

            }
        );


    const recoveryProbability =
        mlResponse.data
            .recovery_probability;
await saveMemory({

    transactionId,

    agent:
        "ML_MODEL",

    memoryType:
        "RECOVERY_PREDICTION",

    content: {

        recoveryProbability

    }

});



const riskScore =
    calculateRisk({

        amount:
            Number(payment.amount),

        recoveryProbability,

        attemptNumber,

        failureReason:
            payment.failure_reason,

        customerProfile

    });


const riskLevel =
    classifyRisk(
        riskScore
    );


console.log(
    `✓ Risk Score: ${riskScore} (${riskLevel})`
);

emitAgentEvent(
    transactionId,
    {
        agent:
            "RISK_ENGINE",

        status:
            "completed",

        message:
            `Risk score: ${riskScore} (${riskLevel})`
    }
);


    console.log(
        `✓ Recovery probability: ${
            Math.round(
                recoveryProbability * 100
            )
        }%`
    );
emitAgentEvent(
    transactionId,
    {
        agent: "ML_MODEL",
        status: "completed",
        message:
            `Recovery probability: ${Math.round(
                recoveryProbability * 100
            )}%`,
        probability:
            recoveryProbability
    }
);

await logAgentAction({

    transactionId,

    agent:
        "Recovery Prediction Model",

    action:
        "PREDICT_RECOVERY",

    input: {

        amount:
            payment.amount,

        failure_reason:
            payment.failure_reason,

        payment_method:
            payment.payment_method

    },

    output: {

        recoveryProbability

    }

});

 

    // ==================================
    // STEP 5 — Previous attempts
    // ==================================


    // ==================================
    // STEP 6 — LLM Strategy
    // ==================================
const memories =
    await getMemories(
        transactionId

    );

const context = {

    transaction: {

        transaction_id:
            payment.transaction_id,

        amount:
            Number(payment.amount),

        payment_method:
            payment.payment_method,

        failure_reason:
            payment.failure_reason

    },

    customer:
        customerProfile,

    failure_analysis:
        failureAnalysis,

    recovery_probability:
        recoveryProbability,

    previous_attempts:
        previousAttempts,

    agent_memory:
        memories,

    strategyRecommendation:
        strategyRecommendation

};

    const llmDecision =
        await generateStrategy(
            context
        );
        await saveMemory({

    transactionId,

    agent:
        "LLM_STRATEGY",

    memoryType:
        "STRATEGY_DECISION",

    content:
        llmDecision

});
        emitAgentEvent(
    transactionId,
    {
        agent: "LLM_STRATEGY",
        status: "completed",
        message:
            `Strategy selected: ${llmDecision.decision}`
    }
);


    console.log(
        "✓ LLM strategy:",
        llmDecision.decision
    );

await logAgentAction({

    transactionId,

    agent:
        "LLM Strategy Agent",

    action:
        "GENERATE_STRATEGY",

    input:
        context,

    output:
        llmDecision

});
    // ==================================
    // STEP 7 — Guardrails
    // ==================================

const validation =
    validateDecision(
        llmDecision,
        {
            ...payment,
            recovery_probability:
                recoveryProbability
        },
        previousAttempts.length + 1,
        previousAttempts
    );

    const policyResult =
    evaluatePolicy({

        amount:
            Number(payment.amount),

        recoveryProbability,

        attemptNumber,

        riskScore,

        decision:
            llmDecision.decision

    });
 



console.log(
    policyResult.approved
        ? "✓ Policy Engine: APPROVED"
        : "⚠ Policy Engine: REJECTED"
);


if (
    policyResult.requiresHumanReview
) {

    console.log(
        "⚠ Human review required:",
        policyResult.violations
    );

}
        await saveMemory({

    transactionId,

    agent:
        "GUARDRAILS",

    memoryType:
        "VALIDATION",

    content:
        validation

});

emitAgentEvent(
    transactionId,
    {
        agent: "GUARDRAILS",
        status:
            validation.approved
                ? "completed"
                : "rejected",
        message:
            validation.approved
                ? "Decision approved"
                : `Decision rejected: ${validation.reason}`
    }
);

    console.log(
        validation.approved
            ? "✓ Guardrails PASSED"
            : "⚠ Guardrails REJECTED"
    );
    await logAgentAction({

    transactionId,

    agent:
        "Guardrail Engine",

    action:
        "VALIDATE_DECISION",

    input:
        llmDecision,

    output:
        validation

});


  let finalDecision =
    llmDecision;


// ==================================
// POLICY ENGINE
// ==================================
// ==================================
// POLICY ENGINE
// ==================================

if (
    !policyResult.approved
) {

    console.log(
        "⚠️ Policy rejected action"
    );

    console.log(
        "⚠️ Policy violations:",
        policyResult.violations
    );


    // ==================================
    // CREATE HUMAN REVIEW
    // ==================================

    const review =
        await createReview({

            transactionId,

            riskScore,

            reason:
                policyResult
                    .violations
                    .join(", "),

            recommendedAction:
                llmDecision.decision

        });


    console.log(
        "👤 Human review created:",
        review.review_id
    );


    emitAgentEvent(
        transactionId,
        {

            agent:
                "HUMAN_REVIEW",

            status:
                "pending",

            message:
                "Automatic recovery blocked. Human review required."

        }
    );


    // ==================================
    // STOP AUTOMATIC RECOVERY
    // ==================================

    return {

        transaction:
            payment,

        customerProfile,

        failureAnalysis,

        recoveryProbability,

        riskScore,

        riskLevel,

        decision:
            llmDecision,

        guardrail:
            validation,

        policy:
            policyResult,

        humanReview:
            review,

        attemptNumber

    };

}

// ==================================
// GUARDRAIL REJECTION
// ==================================

if (
    !validation.approved
) {

    console.log(
        "⚠️ Guardrail reason:",
        validation.reason
    );

    finalDecision = {

        decision:
            "ESCALATE_TO_SUPPORT",

        delay_seconds:
            0,

        confidence:
            0.50,

        reason:
            `Guardrail rejected automatic action: ${validation.reason}`
    };

}


console.log(
    "✓ Final decision:",
    finalDecision.decision
);


    // ==================================
    // STEP 8 — Save AI Decision
    // ==================================

    await pool.query(
        `
        INSERT INTO ai_decisions
        (
            transaction_id,
            failure_category,
            reasoning,
            confidence,
            recovery_probability,
            recommended_action
        )

        VALUES
        ($1,$2,$3,$4,$5,$6)
        `,
        [

            transactionId,

            failureAnalysis.category,

            finalDecision.reason,

            finalDecision.confidence,

            recoveryProbability,

            finalDecision.decision

        ]
    );


    // ==================================
    // STEP 9 — Execute Action
    // ==================================
const actionResult =
    await executeAction(

        payment,

        {
            strategy:
                finalDecision.decision,

            action:
                finalDecision.decision,

            delaySeconds:
                finalDecision.delay_seconds,

            reason:
                finalDecision.reason

        },

        {

            recoveryProbability,

            customerProfile,

            attemptNumber:
                previousAttempts.length + 1

        }

    );
    const retryDecision =
    canRetry({
        attemptNumber,
        recoveryProbability,
        riskScore
    });

console.log(
    `✓ Retry Policy: ${
        retryDecision.allowed
            ? "ALLOWED"
            : "BLOCKED"
    } - ${retryDecision.reason}`
);
await saveMemory({

    transactionId,

    agent:
        "RECOVERY_CONTROLLER",

    memoryType:
        "RETRY_DECISION",

    content: {

        allowed:
            retryDecision.allowed,

        reason:
            retryDecision.reason,

        attemptNumber,

        riskScore,

        recoveryProbability

    }

});


await logAgentAction({

    transactionId,

    agent:
        "Recovery Controller",

    action:
        "EVALUATE_RETRY",

    input: {

        attemptNumber,

        riskScore,

        recoveryProbability

    },

    output:
        retryDecision

});

if (!actionResult.success) {

    if (retryDecision.allowed) {

        emitAgentEvent(
            transactionId,
            {
                agent:
                    "RECOVERY_CONTROLLER",

                status:
                    "retrying",

                message:
                    `Recovery failed. Retry allowed: ${retryDecision.reason}`
            }
        );

    } else {

        const review =
            await createReview({

                transactionId,

                riskScore,

                reason:
                    retryDecision.reason,

                recommendedAction:
                    "ESCALATE_TO_SUPPORT"

            });

        emitAgentEvent(
            transactionId,
            {
                agent:
                    "RECOVERY_CONTROLLER",

                status:
                    "human_review",

                message:
                    "Automatic recovery stopped. Human review required."
            }
        );

    }

}
emitAgentEvent(
    transactionId,
    {
        agent: "ACTION_AGENT",
        status:
            actionResult.success
                ? "completed"
                : "failed",
        message:
            actionResult.success
                ? `Payment recovered: ₹${payment.amount}`
                : "Recovery attempt failed"
    }
);

await logAgentAction({

    transactionId,

    agent:
        "Action Agent",

    action:
        finalDecision.decision,

    input: {

        amount:
            payment.amount,

        payment_method:
            payment.payment_method,

        failure_reason:
            payment.failure_reason

    },

    output:
        actionResult

});
await saveMemory({

    transactionId,

    agent:
        "ACTION_AGENT",

    memoryType:
        "ACTION_RESULT",

    content:
        actionResult

});

    // ==================================
    // STEP 10 — Save attempt
    // ==================================



    await pool.query(
        `
        INSERT INTO recovery_attempts
        (
            transaction_id,
            strategy,
            action,
            result,
            recovery_probability,
            attempt_number,
            failure_reason,
            metadata
        )

        VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8)
        `,
        [

            transactionId,

            finalDecision.decision,

            finalDecision.decision,

            actionResult.result,

            recoveryProbability,

            attemptNumber,

            payment.failure_reason,

            JSON.stringify({

                customerProfile,

                failureAnalysis,

                llmDecision,

                guardrail:
                    validation

            })

        ]
    );


    // ==================================
    // STEP 11 — Final result
    // ==================================

    emitAgentEvent(
    transactionId,
    {
        agent: "RECOVERAI",
        status:
            actionResult.success
                ? "recovered"
                : "failed",
        message:
            actionResult.success
                ? "Revenue successfully recovered 💰"
                : "Recovery attempt unsuccessful"
    }
);
    return {

        transaction: payment,

        customerProfile,

        failureAnalysis,

        recoveryProbability,

        decision: finalDecision,

        guardrail: validation,

        action: actionResult,

        attemptNumber

    };
    

}


module.exports =
    runRecoverAI;