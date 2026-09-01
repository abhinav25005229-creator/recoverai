require("dotenv").config({
    path: "../backend/.env"
});

const generateStrategy =
    require("./llmStrategyAgent");


async function main() {

    const context = {

        transaction_id: "TXN_000001",

        amount: 4999,

        payment_method: "UPI",

        failure_reason: "BANK_TIMEOUT",

        recovery_probability: 0.91,

        customer: {

            previous_transactions: 18,

            successful_transactions: 16,

            failed_transactions: 2,

            preferred_method: "UPI"

        },

        previous_attempts: []

    };


    const decision =
        await generateStrategy(context);


    console.log(
        JSON.stringify(
            decision,
            null,
            2
        )
    );

}


main();