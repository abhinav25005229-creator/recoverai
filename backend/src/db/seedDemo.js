require("dotenv").config();

const pool = require("../db");

async function seed() {

    console.log("🌱 Seeding demo data...");

    const customers = [

        [
            "CUST_DEMO_001",
            "Aarav Sharma",
            24,
            10,
            8,
            2,
            "CARD",
            125000
        ],

        [
            "CUST_DEMO_002",
            "Riya Singh",
            22,
            15,
            12,
            3,
            "UPI",
            85000
        ],

        [
            "CUST_DEMO_003",
            "Kabir Kumar",
            25,
            8,
            5,
            3,
            "CARD",
            42000
        ]

    ];


    for (const customer of customers) {

        await pool.query(
            `
            INSERT INTO customers
            (
                customer_id,
                name,
                age,
                total_transactions,
                successful_transactions,
                failed_transactions,
                preferred_payment_method,
                total_spend
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)

            ON CONFLICT (customer_id)
            DO NOTHING
            `,
            customer
        );

    }


    const demoTransactions = [

        [
            "DEMO_TXN_001",
            "CUST_DEMO_001",
            125000,
            "CARD",
            "FAILED",
            "BANK_TIMEOUT"
        ],

        [
            "DEMO_TXN_002",
            "CUST_DEMO_002",
            4999,
            "UPI",
            "FAILED",
            "NETWORK_ERROR"
        ],

        [
            "DEMO_TXN_003",
            "CUST_DEMO_003",
            1899,
            "CARD",
            "FAILED",
            "OTP_FAILURE"
        ],

        [
            "DEMO_TXN_004",
            "CUST_DEMO_002",
            7499,
            "UPI",
            "SUCCESS",
            null
        ]

    ];


    for (const transaction of demoTransactions) {

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
            VALUES ($1,$2,$3,$4,$5,$6)

            ON CONFLICT (transaction_id)
            DO NOTHING
            `,
            transaction
        );

    }


    console.log("✅ Demo data inserted");

    await pool.end();

}


seed().catch(error => {

    console.error("❌ Seed failed:", error);

    process.exit(1);

});