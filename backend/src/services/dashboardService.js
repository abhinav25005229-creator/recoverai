const pool = require("../db");


async function getDashboardStats() {

    // --------------------------------
    // Total failed payments
    // --------------------------------

    const failedResult = await pool.query(`
        SELECT
            COUNT(*) AS failed_count,
            COALESCE(SUM(amount), 0) AS failed_amount
        FROM transactions
        WHERE status = 'FAILED'
    `);


    // --------------------------------
    // Successful payments
    // --------------------------------

    const successResult = await pool.query(`
        SELECT
            COUNT(*) AS success_count,
            COALESCE(SUM(amount), 0) AS success_amount
        FROM transactions
        WHERE status = 'SUCCESS'
    `);


    // --------------------------------
    // Recovered payments
    // --------------------------------

    const recoveredResult = await pool.query(`
        SELECT
            COUNT(DISTINCT transaction_id) AS recovered_count,
            COALESCE(
                SUM(
                    CASE
                        WHEN result = 'RECOVERED'
                        THEN (
                            SELECT amount
                            FROM transactions t
                            WHERE t.transaction_id =
                                  ra.transaction_id
                        )
                        ELSE 0
                    END
                ),
                0
            ) AS recovered_amount
        FROM recovery_attempts ra
    `);


    const failedCount =
        Number(
            failedResult.rows[0].failed_count
        );


    const failedAmount =
        Number(
            failedResult.rows[0].failed_amount
        );


    const recoveredCount =
        Number(
            recoveredResult.rows[0].recovered_count
        );


    const recoveredAmount =
        Number(
            recoveredResult.rows[0].recovered_amount
        );


    // --------------------------------
    // Recovery rate
    // --------------------------------

    const recoveryRate =
        failedCount > 0
            ? (recoveredCount / failedCount) * 100
            : 0;


    // --------------------------------
    // AI interventions
    // --------------------------------

    const aiResult = await pool.query(`
        SELECT COUNT(*) AS count
        FROM ai_decisions
    `);


    const aiInterventions =
        Number(
            aiResult.rows[0].count
        );


    return {

        failedPayments: failedCount,

        revenueAtRisk:
            failedAmount,

        recoveredPayments:
            recoveredCount,

        revenueRecovered:
            recoveredAmount,

        recoveryRate:
            Number(
                recoveryRate.toFixed(2)
            ),

        aiInterventions

    };

}


async function getRecentDecisions() {

    const result = await pool.query(`
        SELECT

            ad.decision_id,

            ad.transaction_id,

            ad.failure_category,

            ad.confidence,

            ad.recommended_action,

            ad.reasoning,

            t.amount,

            t.payment_method,

            t.failure_reason,

            t.status,

            ad.created_at

        FROM ai_decisions ad

        JOIN transactions t
        ON ad.transaction_id =
           t.transaction_id

        ORDER BY ad.created_at DESC

        LIMIT 20
    `);


    return result.rows;

}


async function getRecoveryActivity() {

    const result = await pool.query(`
        SELECT

            ra.attempt_id,

            ra.transaction_id,

            ra.strategy,

            ra.action,

            ra.result,

            ra.recovery_probability,

            ra.attempt_number,

            ra.created_at

        FROM recovery_attempts ra

        ORDER BY ra.created_at DESC

        LIMIT 20
    `);


    return result.rows;

}


module.exports = {

    getDashboardStats,

    getRecentDecisions,

    getRecoveryActivity

};