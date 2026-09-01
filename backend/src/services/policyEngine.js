function evaluatePolicy({

    amount,
    recoveryProbability,
    attemptNumber,
    riskScore,
    decision

}) {

    const violations = [];


    // =================================
    // Rule 1 — Maximum attempts
    // =================================

    if (attemptNumber > 3) {

        violations.push(
            "Maximum recovery attempts exceeded"
        );

    }


    // =================================
    // Rule 2 — High-value payment
    // =================================

    if (amount >= 100000) {

        violations.push(
            "High-value transaction requires human review"
        );

    }


    // =================================
    // Rule 3 — Very low probability
    // =================================

    if (
        recoveryProbability < 0.20
    ) {

        violations.push(
            "Recovery probability too low for automatic action"
        );

    }


    // =================================
    // Rule 4 — High risk
    // =================================

    if (riskScore >= 70) {

        violations.push(
            "Risk score exceeds automatic action threshold"
        );

    }


    // =================================
    // Rule 5 — Dangerous action
    // =================================

    const allowedActions = [

        "RETRY_PAYMENT",

        "PRIORITY_RETRY",

        "PREFERRED_METHOD_RETRY",

        "SUGGEST_UPI",

        "SEND_PAYMENT_REMINDER",

        "ESCALATE_TO_SUPPORT",

        "NO_ACTION"

    ];


    if (
        !allowedActions.includes(
            decision
        )
    ) {

        violations.push(
            "Unknown or unauthorized action"
        );

    }


    return {

        approved:
            violations.length === 0,

        requiresHumanReview:
            violations.length > 0,

        violations

    };

}


module.exports =
    evaluatePolicy;