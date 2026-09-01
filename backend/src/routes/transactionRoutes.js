const express = require("express");
const pool = require("../db");
const {
    getMemories
} = require("../services/memoryService");
const router = express.Router();


router.get("/:transactionId", async (req, res) => {

    try {

        const { transactionId } = req.params;


        // --------------------------------
        // Transaction + customer
        // --------------------------------

        const transactionResult =
            await pool.query(
                `
                SELECT

                    t.transaction_id,
                    t.amount,
                    t.payment_method,
                    t.status,
                    t.failure_reason,
                    t.created_at,

                    c.customer_id,
                    c.name,
                    c.age,
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
                [transactionId]
            );


        if (
            transactionResult.rows.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Transaction not found"

            });

        }


        const transaction =
            transactionResult.rows[0];


        // --------------------------------
        // AI decisions
        // --------------------------------

        const decisionsResult =
            await pool.query(
                `
                SELECT *

                FROM ai_decisions

                WHERE transaction_id = $1

                ORDER BY created_at DESC
                `,
                [transactionId]
            );


        // --------------------------------
        // Recovery attempts
        // --------------------------------

      

const attemptsResult =
    await pool.query(
        `
        SELECT *

        FROM recovery_attempts

        WHERE transaction_id = $1

        ORDER BY attempt_number ASC
        `,
        [transactionId]
    );
    const memories =
    await getMemories(
        transactionId
    );


        res.json({

            success: true,

            data: {

                transaction,

                ai_decisions:
                    decisionsResult.rows,

                recovery_attempts:
                    attemptsResult.rows

            }

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to fetch transaction"

        });

    }

});


module.exports = router;