function analyzeFailure(failureReason) {

    const temporaryFailures = [
        "BANK_TIMEOUT",
        "NETWORK_ERROR",
        "BANK_SERVER_DOWN"
    ];

    const customerFailures = [
        "INSUFFICIENT_FUNDS",
        "OTP_FAILURE"
    ];

    const permanentFailures = [
        "CARD_DECLINED",
        "LIMIT_EXCEEDED"
    ];

    if (temporaryFailures.includes(failureReason)) {
        return {
            category: "TEMPORARY",
            confidence: 0.95,
            retryRecommended: true
        };
    }

    if (customerFailures.includes(failureReason)) {
        return {
            category: "CUSTOMER_ACTION_REQUIRED",
            confidence: 0.90,
            retryRecommended: false
        };
    }

    if (permanentFailures.includes(failureReason)) {
        return {
            category: "HIGH_RISK_FAILURE",
            confidence: 0.92,
            retryRecommended: false
        };
    }

    return {
        category: "UNKNOWN",
        confidence: 0.50,
        retryRecommended: false
    };
}

module.exports = analyzeFailure;