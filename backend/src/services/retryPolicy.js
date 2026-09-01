function canRetry({
    attemptNumber,
    recoveryProbability,
    riskScore
}) {

    if (attemptNumber >= 3) {

        return {

            allowed: false,

            reason:
                "Maximum automatic attempts reached"

        };

    }


    if (
        recoveryProbability < 0.20
    ) {

        return {

            allowed: false,

            reason:
                "Recovery probability too low"

        };

    }


    if (riskScore >= 70) {

        return {

            allowed: false,

            reason:
                "Transaction risk too high"

        };

    }


    return {

        allowed: true,

        reason:
            "Retry permitted"

    };

}


module.exports =
    canRetry;