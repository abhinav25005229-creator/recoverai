const analyzeCustomer =
    require("../../agents/customerIntelligenceAgent");
const express = require("express");
const axios = require("axios");

const pool = require("../db");

const analyzeFailure =
    require("../../agents/failureAnalyzer");

const selectStrategy =
    require("../../agents/strategyAgent");


const router = express.Router();


router.post("/:transactionId", async (req, res) => {

    try {

        const { transactionId } = req.params;


        // --------------------------------
        // 1. Get payment
        // --------------------------------

        const paymentResult = await pool.query(
            `
            SELECT
                t.*,
                c.age AS customer_age,
                c.total_transactions,
                c.successful_transactions,
                c.failed_transactions,
                c.preferred_payment_method
                 c.total_spend
            FROM transactions t
            JOIN customers c
            ON t.customer_id = c.customer_id
            WHERE t.transaction_id = $1
            `,
            [transactionId]
        );


        if (paymentResult.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });

        }


        const payment =
            paymentResult.rows[0];

            // --------------------------------
// Customer intelligence
// --------------------------------

const customerIntelligence =
    analyzeCustomer({

        customer_id:
            payment.customer_id,

        total_transactions:
            payment.total_transactions,

        successful_transactions:
            payment.successful_transactions,

        failed_transactions:
            payment.failed_transactions,

        preferred_payment_method:
            payment.preferred_payment_method,

        total_spend:
            payment.total_spend

    });


        // --------------------------------
        // 2. Failure analysis
        // --------------------------------

        const failureAnalysis =
            analyzeFailure(
                payment.failure_reason
            );


        // --------------------------------
        // 3. ML prediction
        // --------------------------------

        const mlResponse = await axios.post(
            "http://127.0.0.1:8000/predict",
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
                    new Date(payment.created_at).getHours()
            }
        );


        const recoveryProbability =
            mlResponse.data.recovery_probability;


        // --------------------------------
        // 4. Strategy
        // --------------------------------

        const strategy =
            selectStrategy(
                payment,
                failureAnalysis,
                recoveryProbability
            );


        // --------------------------------
        // 5. Save AI decision
        // --------------------------------

        await pool.query(
            `
            INSERT INTO ai_decisions
            (
                transaction_id,
                failure_category,
                reasoning,
                confidence,
                recommended_action
            )
            VALUES ($1, $2, $3, $4, $5)
            `,
            [
                transactionId,

                failureAnalysis.category,

                strategy.reason,

                failureAnalysis.confidence,

                strategy.action
            ]
        );


        // --------------------------------
        // 6. Return decision
        // --------------------------------

       res.json({

    success: true,

    transaction_id:
        transactionId,

    recovery_probability:
        recoveryProbability,

    customer_intelligence:
        customerIntelligence,

    failure_analysis:
        failureAnalysis,

    strategy

});

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "AI analysis failed"
        });

    }

});


module.exports = router;