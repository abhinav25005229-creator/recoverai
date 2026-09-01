function selectStrategy(
    payment,
    failureAnalysis,
    recoveryProbability,
    customerProfile
) {

    const probability =
        Number(recoveryProbability);

    const segment =
        customerProfile?.segment;

    const preferredMethod =
        customerProfile?.preferred_payment_method;


    // --------------------------------
    // High-value temporary failure
    // --------------------------------

    if (
        probability >= 0.80 &&
        failureAnalysis.category === "TEMPORARY" &&
        segment === "HIGH_VALUE_RETURNING"
    ) {

        return {

            strategy: "PRIORITY_RETRY",

            action: "RETRY_PAYMENT",

            delaySeconds: 120,

            reason:
                "High-value returning customer with temporary failure and high recovery probability."

        };

    }


    // --------------------------------
    // Preferred method available
    // --------------------------------

    if (
        probability >= 0.70 &&
        failureAnalysis.category === "TEMPORARY"
    ) {

        return {

            strategy: "PREFERRED_METHOD_RETRY",

            action: "RETRY_PAYMENT",

            delaySeconds: 180,

            reason:
                `Retry using customer's preferred method: ${preferredMethod}.`

        };

    }


    // --------------------------------
    // Card → UPI
    // --------------------------------

    if (
        probability >= 0.50 &&
        payment.payment_method === "CARD"
    ) {

        return {

            strategy: "ALTERNATE_METHOD",

            action: "SUGGEST_UPI",

            delaySeconds: 0,

            reason:
                "Moderate recovery probability; alternate payment method may improve conversion."

        };

    }


    // --------------------------------
    // Medium probability
    // --------------------------------

    if (probability >= 0.50) {

        return {

            strategy: "REMINDER",

            action: "SEND_PAYMENT_REMINDER",

            delaySeconds: 300,

            reason:
                "Moderate recovery probability; customer reminder selected."

        };

    }


    // --------------------------------
    // Low probability
    // --------------------------------

    return {

        strategy: "MANUAL_REVIEW",

        action: "ESCALATE_TO_SUPPORT",

        delaySeconds: 0,

        reason:
            "Low recovery probability; automated intervention may be ineffective."

    };

}


module.exports = selectStrategy;