const recoverPayment =
    require("./recoveryAgent");


const payment = {

    transaction_id: "TXN_000001",

    amount: 4999,

    payment_method: "UPI",

    failure_reason: "BANK_TIMEOUT"
};


async function main() {

    const result =
        await recoverPayment(
            payment,
            0.91
        );

    console.log("\nFINAL RESULT");
    console.log("====================");

    console.log(
        JSON.stringify(
            result,
            null,
            2
        )
    );
}


main();