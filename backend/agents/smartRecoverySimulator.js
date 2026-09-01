function calculateRecoveryChance({
    recoveryProbability,
    failureReason,
    customerProfile,
    strategy,
    attemptNumber
}) {

    let chance =
        Number(recoveryProbability);


    // --------------------------------
    // Failure-specific adjustment
    // --------------------------------

    const failureAdjustment = {

        BANK_TIMEOUT: 0.08,

        NETWORK_ERROR: 0.06,

        OTP_FAILURE: 0.00,

        CARD_DECLINED: -0.15,

        INSUFFICIENT_FUNDS: -0.25

    };


    chance +=
        failureAdjustment[
            failureReason
        ] || 0;


    // --------------------------------
    // Customer behavior
    // --------------------------------

    if (
        customerProfile?.recovery_profile === "HIGH"
    ) {

        chance += 0.05;

    }


    if (
        customerProfile?.recovery_profile === "LOW"
    ) {

        chance -= 0.08;

    }


    // --------------------------------
    // Strategy effectiveness
    // --------------------------------

    const strategyAdjustment = {

        RETRY_PAYMENT: 0.05,

        PRIORITY_RETRY: 0.10,

        PREFERRED_METHOD_RETRY: 0.08,

        SUGGEST_UPI: 0.04,

        SEND_PAYMENT_REMINDER: -0.05,

        ESCALATE_TO_SUPPORT: -0.10,

        NO_ACTION: -0.20

    };


    chance +=
        strategyAdjustment[
            strategy
        ] || 0;


    // --------------------------------
    // Repeated attempts
    // --------------------------------

    if (attemptNumber === 2) {

        chance -= 0.08;

    }


    if (attemptNumber >= 3) {

        chance -= 0.15;

    }


    // --------------------------------
    // Keep probability realistic
    // --------------------------------

    chance =
        Math.max(
            0.02,
            Math.min(0.98, chance)
        );


    return Number(
        chance.toFixed(4)
    );

}


function simulateRecovery({
    recoveryProbability,
    failureReason,
    customerProfile,
    strategy,
    attemptNumber
}) {

    const successChance =
        calculateRecoveryChance({

            recoveryProbability,

            failureReason,

            customerProfile,

            strategy,

            attemptNumber

        });


    const randomValue =
        Math.random();


const success =
    randomValue < successChance;


    return {

        success,

        successChance,

        randomValue,

        result:
            success
                ? "RECOVERED"
                : "FAILED"

    };

}


module.exports = {

    calculateRecoveryChance,

    simulateRecovery

};