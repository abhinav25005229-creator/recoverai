const validateDecision =
    require("./guardrails");

const analyzeFailure =
    require("./failureAnalyzer");

const selectStrategy =
    require("./strategyAgent");

const executeAction =
    require("./actionAgent");


async function recoveryLoop(
    payment,
    recoveryProbability,
    customerProfile
) {

    console.log("\n");
    console.log("================================");
    console.log("RECOVERAI AUTONOMOUS LOOP");
    console.log("================================");


    let currentProbability =
        recoveryProbability;


    let attempt = 1;

    const maxAttempts = 3;

    const history = [];


    while (attempt <= maxAttempts) {

        console.log(
            `\n========== ATTEMPT ${attempt} ==========`
        );


        // 1. Analyze failure

        const failureAnalysis =
            analyzeFailure(
                payment.failure_reason
            );


        // 2. Select strategy

     const strategy =
    selectStrategy(
        payment,
        failureAnalysis,
        currentProbability,
        customerProfile
    );

        console.log(
            "Strategy:",
            strategy.action
        );

        // --------------------------------
// Guardrail validation
// --------------------------------

const guardrail =
    validateDecision(
        strategy,
        payment,
        attempt
    );

console.log(
    "🛡 Guardrails:",
    guardrail.approved
        ? "PASSED"
        : "BLOCKED"
);

if (!guardrail.approved) {

    console.log(
        "⚠️ Decision blocked:",
        guardrail.reason
    );

    history.push({

        attempt,

        strategy:
            strategy.strategy,

        action:
            strategy.action,

        probability:
            currentProbability,

        result:
            "BLOCKED",

        guardrail_reason:
            guardrail.reason

    });

    attempt++;

    currentProbability =
        Math.max(
            0.05,
            currentProbability - 0.15
        );

    continue;
}

// --------------------------------
// Stop for manual escalation
// --------------------------------

if (
    strategy.action === "ESCALATE_TO_SUPPORT"
) {

    console.log(
        "🛑 Manual review required. Stopping recovery loop."
    );

    history.push({

        attempt,

        strategy:
            strategy.strategy,

        action:
            strategy.action,

        probability:
            currentProbability,

        result:
            "MANUAL_REVIEW"

    });

    return {

        status: "MANUAL_REVIEW",

        recoveredAmount: 0,

        attempts: attempt,

        history

    };

}
        // 3. Execute action

        const result =
            await executeAction(
                payment,
                strategy
            );


        history.push({

            attempt,

            strategy:
                strategy.strategy,

            action:
                strategy.action,

            probability:
                currentProbability,

            result:
                result.result

        });


        // 4. Success

        if (result.success) {

            console.log(
                "\n💰 REVENUE RECOVERED!"
            );

            return {

                status: "RECOVERED",

                recoveredAmount:
                    result.recoveredAmount,

                attempts: attempt,

                history

            };

        }


        // 5. Failure

        console.log(
            "Recovery attempt failed."
        );


        // Simulate learning from failed attempt

        currentProbability =
            Math.max(
                0.05,
                currentProbability - 0.15
            );


        attempt++;

    }


    console.log(
        "\n⚠️ MAX ATTEMPTS REACHED"
    );


    return {

        status: "NOT_RECOVERED",

        recoveredAmount: 0,

        attempts:
            maxAttempts,

        history

    };
}


module.exports = recoveryLoop;