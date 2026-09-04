const {
    paymentFailed,
    paymentSucceeded
} = require("../events/paymentEvents");

const express = require("express");
const pool = require("../db");

const router = express.Router();


// Create a payment
router.post("/", async (req, res) => {

    try {

        const {
            transaction_id,
            customer_id,
            amount,
            payment_method,
            status,
            failure_reason
        } = req.body;


        const result = await pool.query(
            `
            INSERT INTO transactions
            (
                transaction_id,
                customer_id,
                amount,
                payment_method,
                status,
                failure_reason
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
            `,
            [
                transaction_id,
                customer_id,
                amount,
                payment_method,
                status,
                failure_reason || null
            ]
        );


        // Payment saved
        const payment = result.rows[0];


        // 🔥 Trigger RecoverAI automatically
        if (payment.status === "FAILED") {

            paymentFailed(payment);

        }


        res.status(201).json({

            success: true,

            message:
                "Payment stored successfully",

            payment

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to store payment"

        });

    }

});

// Get all payments
router.get("/", async (req, res) => {

    try {

        const result = await pool.query(
            "SELECT * FROM transactions ORDER BY created_at DESC"
        );

        res.json({
            success: true,
            payments: result.rows
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch payments"
        });

    }

});
// ========================================
// Simulate Failed Payment
// ========================================

router.post(
    "/simulate",
    async (req, res) => {

        try {

            // Get a random customer
            const customerResult =
                await pool.query(
                    `
                    SELECT customer_id
                    FROM customers
                    ORDER BY RANDOM()
                    LIMIT 1
                    `
                );


            if (
                customerResult.rows.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "No customers found"

                });

            }


            const customerId =
                customerResult.rows[0]
                    .customer_id;


            // Random payment amount
           // High-value payment for Human Review testing
const amount = 150000;

            // Unique transaction ID
            const transactionId =
                `SIM_${Date.now()}`;


            const paymentMethods = [
                "UPI",
                "CARD",
                "NETBANKING"
            ];


            const failureReasons = [
                "BANK_TIMEOUT",
                "INSUFFICIENT_FUNDS",
                "PAYMENT_GATEWAY_ERROR",
                "NETWORK_ERROR"
            ];


            const paymentMethod =
                paymentMethods[
                    Math.floor(
                        Math.random() *
                        paymentMethods.length
                    )
                ];


            const failureReason =
                failureReasons[
                    Math.floor(
                        Math.random() *
                        failureReasons.length
                    )
                ];


            // Save failed transaction
            const result =
                await pool.query(
                    `
                    INSERT INTO transactions
                    (
                        transaction_id,
                        customer_id,
                        amount,
                        payment_method,
                        status,
                        failure_reason
                    )
                    VALUES
                    ($1,$2,$3,$4,$5,$6)
                    RETURNING *
                    `,
                    [
                        transactionId,
                        customerId,
                        amount,
                        paymentMethod,
                        "FAILED",
                        failureReason
                    ]
                );


            // Trigger RecoverAI
            const payment =
                result.rows[0];

            paymentFailed(payment);


            res.json({

                success: true,

                message:
                    "Payment simulation started",

                data:
                    payment

            });


        } catch (error) {

            console.error(
                "Simulation error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to simulate payment"

            });

        }

    }
);
// Analyze a payment using ML
router.post("/analyze/:transactionId", async (req, res) => {
    try {
        const { transactionId } = req.params;

        // Get transaction + customer information
const result = await pool.query(
    `
    SELECT
        t.transaction_id,
        t.customer_id,
        t.amount,
        t.payment_method,
        t.status,
        t.failure_reason,
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
    [transactionId]
);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        const payment = result.rows[0];



        // Prepare data for ML model
        const mlData = {
            amount: Number(payment.amount),
            customer_age: payment.customer_age,
            previous_transactions: payment.total_transactions,
            successful_transactions: payment.successful_transactions,
            failed_transactions: payment.failed_transactions,
            hour: new Date().getHours(),
            payment_method: payment.payment_method,
            failure_reason: payment.failure_reason,
            preferred_method: payment.preferred_payment_method
        };

        // Call ML server
        const mlResponse = await fetch(
    `${process.env.ML_SERVICE_URL}/predict`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(mlData)
            }
        );

        const prediction = await mlResponse.json();

        if (!mlResponse.ok || !prediction.success) {
            return res.status(500).json({
                success: false,
                message: "ML prediction failed",
                details: prediction
            });
        }

        const probability = prediction.recovery_probability;

        // Simple failure analysis
        let category = "PERMANENT";
        let retryRecommended = false;

        if (
            payment.failure_reason === "BANK_TIMEOUT" ||
            payment.failure_reason === "NETWORK_ERROR" ||
            payment.failure_reason === "BANK_SERVER_DOWN"
        ) {
            category = "TEMPORARY";
            retryRecommended = probability >= 0.5;
        }

        // Simple strategy
        let strategy = "NO_RETRY";
        let action = "DO_NOT_RETRY";
        let delaySeconds = 0;
        let reason = "Low recovery probability or permanent failure.";

        if (retryRecommended) {
            strategy = "RETRY";
            action = "RETRY_PAYMENT";
            delaySeconds = 120;
            reason = "High recovery probability and temporary failure detected.";
        }

        res.json({
            success: true,
            transaction_id: transactionId,
            recovery_probability: probability,

            failure_analysis: {
                category,
                confidence: probability,
                retryRecommended
            },

            strategy: {
                strategy,
                action,
                delaySeconds,
                reason
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to analyze payment"
        });
    }
});

module.exports = router;