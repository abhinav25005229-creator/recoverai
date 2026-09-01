const pool = require("../db");


async function getStrategyPerformance() {

    const result = await pool.query(`
        SELECT

            ra.strategy,

            COUNT(*) AS total_attempts,

            COUNT(*) FILTER (
                WHERE ra.result = 'RECOVERED'
            ) AS successful_attempts,

            COALESCE(
                SUM(
                    CASE
                        WHEN ra.result = 'RECOVERED'
                        THEN t.amount
                        ELSE 0
                    END
                ),
                0
            ) AS recovered_revenue

        FROM recovery_attempts ra

        JOIN transactions t
        ON ra.transaction_id = t.transaction_id

        GROUP BY ra.strategy

        ORDER BY successful_attempts DESC
    `);


    return result.rows.map(row => {

        const total =
            Number(row.total_attempts);

        const successful =
            Number(row.successful_attempts);


        return {

            strategy:
                row.strategy,

            totalAttempts:
                total,

            successfulAttempts:
                successful,

            successRate:
                total > 0
                    ? Number(
                        (
                            successful /
                            total *
                            100
                        ).toFixed(2)
                    )
                    : 0,

            recoveredRevenue:
                Number(
                    row.recovered_revenue
                )

        };

    });

}


/* =====================================
   Failure-specific strategy performance
===================================== */

async function getFailureStrategyPerformance() {

    const result = await pool.query(`
        SELECT

            t.failure_reason,

            ra.strategy,

            COUNT(*) AS total_attempts,

            COUNT(*) FILTER (
                WHERE ra.result = 'RECOVERED'
            ) AS successful_attempts

        FROM recovery_attempts ra

        JOIN transactions t
        ON ra.transaction_id = t.transaction_id

        GROUP BY
            t.failure_reason,
            ra.strategy

        ORDER BY
            t.failure_reason,
            successful_attempts DESC
    `);


    return result.rows.map(row => {

        const total =
            Number(row.total_attempts);

        const successful =
            Number(row.successful_attempts);


        return {

            failureReason:
                row.failure_reason,

            strategy:
                row.strategy,

            totalAttempts:
                total,

            successfulAttempts:
                successful,

            successRate:
                total > 0
                    ? Number(
                        (
                            successful /
                            total *
                            100
                        ).toFixed(2)
                    )
                    : 0

        };

    });

}


/* =====================================
   Best strategy for current payment
===================================== */

async function getBestStrategy({
    failureReason,
    customerSegment
}) {

    const result = await pool.query(`
        SELECT

            ra.strategy,

            COUNT(*) AS total_attempts,

            COUNT(*) FILTER (
                WHERE ra.result = 'RECOVERED'
            ) AS successful_attempts

        FROM recovery_attempts ra

        JOIN transactions t
        ON ra.transaction_id = t.transaction_id

        JOIN customers c
        ON t.customer_id = c.customer_id

        WHERE t.failure_reason = $1

        GROUP BY ra.strategy

        HAVING COUNT(*) >= 2

        ORDER BY
            (
                COUNT(*) FILTER (
                    WHERE ra.result = 'RECOVERED'
                )::DECIMAL
                /
                COUNT(*)
            ) DESC

        LIMIT 1
    `, [
        failureReason
    ]);


    if (result.rows.length === 0) {

        return {

            strategy: null,

            confidence: 0,

            reason:
                "Not enough historical data"

        };

    }


    const row =
        result.rows[0];


    const total =
        Number(row.total_attempts);

    const successful =
        Number(row.successful_attempts);


    const rate =
        successful / total;


    return {

        strategy:
            row.strategy,

        confidence:
            Number(
                rate.toFixed(4)
            ),

        historicalAttempts:
            total,

        historicalSuccesses:
            successful,

        reason:
            `Historical ${failureReason} recovery data shows ${row.strategy} performing best.`

    };

}


module.exports = {

    getStrategyPerformance,

    getFailureStrategyPerformance,

    getBestStrategy

};