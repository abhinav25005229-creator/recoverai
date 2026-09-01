function calculateRisk({
    amount,
    recoveryProbability,
    attemptNumber,
    failureReason,
    customerProfile
}) {

    let risk = 0;


    // Transaction value

    if (amount >= 100000) {

        risk += 40;

    } else if (amount >= 50000) {

        risk += 25;

    } else if (amount >= 20000) {

        risk += 15;

    }


    // Low recovery probability

    if (recoveryProbability < 0.30) {

        risk += 30;

    } else if (recoveryProbability < 0.50) {

        risk += 15;

    }


    // Repeated attempts

    if (attemptNumber >= 3) {

        risk += 25;

    } else if (attemptNumber === 2) {

        risk += 10;

    }


    // Failure severity

    if (
        failureReason ===
        "INSUFFICIENT_FUNDS"
    ) {

        risk += 15;

    }


    if (
        failureReason ===
        "CARD_DECLINED"
    ) {

        risk += 10;

    }


    // Customer risk profile

    if (
        customerProfile?.risk_level ===
        "HIGH"
    ) {

        risk += 15;

    }


    return Math.min(
        100,
        risk
    );

}


function classifyRisk(
    riskScore
) {

    if (riskScore >= 70) {

        return "HIGH";

    }


    if (riskScore >= 40) {

        return "MEDIUM";

    }


    return "LOW";

}


module.exports = {

    calculateRisk,

    classifyRisk

};