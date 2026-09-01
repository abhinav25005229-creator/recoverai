function analyzeCustomer(customer) {

    const totalTransactions =
        Number(customer.total_transactions || 0);

    const successfulTransactions =
        Number(customer.successful_transactions || 0);

    const failedTransactions =
        Number(customer.failed_transactions || 0);

    const totalSpend =
        Number(customer.total_spend || 0);


    // --------------------------------
    // Success rate
    // --------------------------------

    let successRate = 0;

    if (totalTransactions > 0) {

        successRate =
            successfulTransactions /
            totalTransactions;

    }


    // --------------------------------
    // Customer segment
    // --------------------------------

    let segment;


    if (
        totalSpend >= 50000 &&
        successRate >= 0.75
    ) {

        segment = "HIGH_VALUE_RETURNING";

    } else if (
        totalTransactions >= 10 &&
        successRate >= 0.60
    ) {

        segment = "REGULAR_CUSTOMER";

    } else if (
        failedTransactions >= 5
    ) {

        segment = "HIGH_FAILURE_CUSTOMER";

    } else {

        segment = "NEW_OR_LOW_ACTIVITY";

    }


    // --------------------------------
    // Recovery profile
    // --------------------------------

    let recoveryProfile;


    if (successRate >= 0.80) {

        recoveryProfile = "HIGH";

    } else if (successRate >= 0.50) {

        recoveryProfile = "MEDIUM";

    } else {

        recoveryProfile = "LOW";

    }


    // --------------------------------
    // Customer insights
    // --------------------------------

    const insights = [];


    if (
        customer.preferred_payment_method
    ) {

        insights.push(
            `Preferred payment method is ${customer.preferred_payment_method}`
        );

    }


    if (successRate >= 0.80) {

        insights.push(
            "Customer has a strong payment success history"
        );

    }


    if (failedTransactions >= 5) {

        insights.push(
            "Customer has experienced frequent payment failures"
        );

    }


    if (totalSpend >= 50000) {

        insights.push(
            "Customer has high historical spending"
        );

    }


    return {

        customer_id:
            customer.customer_id,

        segment,

        success_rate:
            Number(
                (successRate * 100).toFixed(2)
            ),

        recovery_profile:
            recoveryProfile,

        preferred_payment_method:
            customer.preferred_payment_method,

        total_spend:
            totalSpend,

        insights

    };

}


module.exports = analyzeCustomer;