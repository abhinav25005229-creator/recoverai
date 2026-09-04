const axios = require("axios");

async function getRecoveryProbability(payment) {

    const response = await axios.post(
      `${process.env.ML_SERVICE_URL}/predict`,
        {
            amount: Number(payment.amount),

            customer_age:
                payment.customer_age,

            previous_transactions:
                payment.total_transactions,

            successful_transactions:
                payment.successful_transactions,

            failed_transactions:
                payment.failed_transactions,

            payment_method:
                payment.payment_method,

            failure_reason:
                payment.failure_reason,

            preferred_method:
                payment.preferred_payment_method,

            hour:
                new Date(
                    payment.created_at
                ).getHours()
        }
    );

    return response.data.recovery_probability;
}

module.exports =
    getRecoveryProbability;