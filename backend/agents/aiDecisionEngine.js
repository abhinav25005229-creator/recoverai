const generateStrategy =
    require("./llmStrategyAgent");

const validateDecision =
    require("./guardrails");


async function makeDecision(
    payment,
    recoveryProbability,
    attemptNumber,
    previousAttempts = []
) {

    const context = {

        transaction_id:
            payment.transaction_id,

        amount:
            Number(payment.amount),

        payment_method:
            payment.payment_method,

        failure_reason:
            payment.failure_reason,

        recovery_probability:
            recoveryProbability,

        customer: {

            age:
                payment.customer_age,

            previous_transactions:
                payment.total_transactions,

            successful_transactions:
                payment.successful_transactions,

            failed_transactions:
                payment.failed_transactions,

            preferred_method:
                payment.preferred_payment_method

        },

        previous_attempts:
            previousAttempts

    };


    // -------------------------------
    // Ask LLM
    // -------------------------------

    const decision =
        await generateStrategy(
            context
        );


    // -------------------------------
    // Guardrails
    // -------------------------------

    const validation =
        validateDecision(
            {
                ...decision
            },
            {
                ...payment,
                recovery_probability:
                    recoveryProbability
            },
            attemptNumber
        );


    // -------------------------------
    // Reject unsafe decision
    // -------------------------------

    if (!validation.approved) {

        return {

            decision:
                "SEND_PAYMENT_REMINDER",

            delay_seconds:
                300,

            confidence:
                0.50,

            reason:
                `LLM decision rejected: ${validation.reason}`,

            guardrail_triggered:
                true

        };

    }


    return {

        ...decision,

        guardrail_triggered:
            false

    };

}


module.exports = makeDecision;