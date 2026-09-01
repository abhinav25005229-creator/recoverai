const ALLOWED_ACTIONS = [
    "RETRY_PAYMENT",
    "SUGGEST_UPI",
    "SEND_PAYMENT_REMINDER",
    "ESCALATE_TO_SUPPORT",
    "NO_ACTION"
];


function validateDecision(
    decision,
    payment,
    attemptNumber,
    previousAttempts = []
) {

    // --------------------------------
    // Get action
    // --------------------------------

    const action =
        decision.decision || decision.action;


    // --------------------------------
    // Validate action
    // --------------------------------

    if (
        !ALLOWED_ACTIONS.includes(action)
    ) {

        return {
            approved: false,
            reason: "Action not allowed"
        };

    }


    // --------------------------------
    // Maximum retries
    // --------------------------------

    if (
        action === "RETRY_PAYMENT" &&
        attemptNumber >= 3
    ) {

        return {
            approved: false,
            reason:
                "Maximum retry limit reached"
        };

    }


    // --------------------------------
    // Validate delay
    // --------------------------------

    const delay =
        Number(
            decision.delay_seconds ??
            decision.delaySeconds ??
            0
        );


    if (
        delay < 0 ||
        delay > 3600
    ) {

        return {
            approved: false,
            reason:
                "Invalid retry delay"
        };

    }


    // --------------------------------
    // Very low probability
    // --------------------------------

    if (
        action === "RETRY_PAYMENT" &&
        Number(
            payment.recovery_probability
        ) < 0.20
    ) {

        return {
            approved: false,
            reason:
                "Recovery probability too low for retry"
        };

    }


    // --------------------------------
    // Approved
    // --------------------------------
    const previousStrategies =
    previousAttempts.map(
        attempt => attempt.strategy
    );


if (
    previousStrategies.includes(
        decision.decision
    ) &&
    attemptNumber >= 2
) {

    return {

        approved: false,

        reason:
            "Strategy already attempted"

    };

}

    return {
        approved: true,
        reason:
            "Decision passed all guardrails"
    };

}


module.exports = validateDecision;