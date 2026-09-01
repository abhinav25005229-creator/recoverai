const pool = require("../db");


async function getRevenueAnalytics() {

    const result = await pool.query(`
        SELECT

            COUNT(*) FILTER (
                WHERE status = 'FAILED'
            ) AS failed_payments,

            COALESCE(
                SUM(amount) FILTER (
                    WHERE status = 'FAILED'
                ),
                0
            ) AS revenue_at_risk,

            COUNT(*) FILTER (
                WHERE status = 'SUCCESS'
            ) AS successful_payments,

            COALESCE(
                SUM(amount) FILTER (
                    WHERE status = 'SUCCESS'
                ),
                0
            ) AS successful_revenue

        FROM transactions
    `);


    const data = result.rows[0];


    return {

        failedPayments:
            Number(data.failed_payments),

        revenueAtRisk:
            Number(data.revenue_at_risk),

        successfulPayments:
            Number(data.successful_payments),

        successfulRevenue:
            Number(data.successful_revenue)

    };

}


/* =====================================
   Failure Analytics
===================================== */

async function getFailureAnalytics() {

    const result = await pool.query(`
        SELECT

            failure_reason,

            COUNT(*) AS attempts,

            COALESCE(
                SUM(amount),
                0
            ) AS revenue_at_risk

        FROM transactions

        WHERE status = 'FAILED'

        GROUP BY failure_reason

        ORDER BY attempts DESC
    `);


    return result.rows.map(row => ({

        failureReason:
            row.failure_reason,

        attempts:
            Number(row.attempts),

        revenueAtRisk:
            Number(row.revenue_at_risk)

    }));

}


/* =====================================
   Strategy Analytics
===================================== */

async function getStrategyAnalytics() {

    const result = await pool.query(`
        SELECT

            strategy,

            COUNT(*) AS total_attempts,

            COUNT(*) FILTER (
                WHERE result = 'RECOVERED'
            ) AS successful_attempts

        FROM recovery_attempts

        GROUP BY strategy

        ORDER BY total_attempts DESC
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
                    : 0

        };

    });

}


/* =====================================
   Daily Recovery
===================================== */

async function getDailyRecovery() {

    const result = await pool.query(`
        SELECT

            DATE(created_at) AS date,

            COUNT(*) AS failed_payments,

            COALESCE(
                SUM(amount),
                0
            ) AS amount

        FROM transactions

        WHERE status = 'FAILED'

        GROUP BY DATE(created_at)

        ORDER BY date ASC

        LIMIT 30
    `);


    return result.rows.map(row => ({

        date:
            row.date,

        failedPayments:
            Number(row.failed_payments),

        amount:
            Number(row.amount)

    }));

}


module.exports = {

    getRevenueAnalytics,

    getFailureAnalytics,

    getStrategyAnalytics,

    getDailyRecovery

};