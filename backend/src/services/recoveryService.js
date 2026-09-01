const analyzeCustomer =
    require("../../agents/customerIntelligenceAgent");

const pool =
    require("../db");

const recoveryLoop =
    require("../../agents/recoveryLoop");


async function runRecovery(
    payment,
    recoveryProbability,
    customerProfile
) {

    // --------------------------------
    // Get latest transaction + customer
    // --------------------------------

    const result =
        await pool.query(
            `
            SELECT
                t.*,
                c.age AS customer_age,
                c.total_transactions,
                c.successful_transactions,
                c.failed_transactions,
                c.preferred_payment_method,
                c.total_spend
            FROM transactions t

            JOIN customers c
            ON t.customer_id = c.customer_id

            WHERE t.transaction_id = $1
            `,
            [
                payment.transaction_id
            ]
        );


    if (result.rows.length === 0) {

        throw new Error(
            "Transaction not found"
        );

    }


    const transaction =
        result.rows[0];


    // --------------------------------
    // Customer Intelligence
    // --------------------------------

    const profile =
        customerProfile ||
        analyzeCustomer({

            customer_id:
                transaction.customer_id,

            total_transactions:
                transaction.total_transactions,

            successful_transactions:
                transaction.successful_transactions,

            failed_transactions:
                transaction.failed_transactions,

            preferred_payment_method:
                transaction.preferred_payment_method,

            total_spend:
                transaction.total_spend

        });


    // --------------------------------
    // Run AI Recovery Loop
    // --------------------------------

    const recoveryResult =
        await recoveryLoop(
            transaction,
            recoveryProbability,
            profile
        );


    // --------------------------------
    // Save every recovery attempt
    // --------------------------------

    for (
        const attempt
        of recoveryResult.history
    ) {

        await pool.query(
            `
            INSERT INTO recovery_attempts
            (
                transaction_id,
                strategy,
                action,
                result,
                recovery_probability,
                attempt_number,
                failure_reason,
                metadata
            )
            VALUES
            ($1,$2,$3,$4,$5,$6,$7,$8)
            `,
            [

                transaction.transaction_id,

                attempt.strategy,

                attempt.action,

                attempt.result,

                attempt.probability,

                attempt.attempt,

                transaction.failure_reason,

                JSON.stringify(attempt)

            ]
        );

    }


    return recoveryResult;

}


module.exports =
    runRecovery;