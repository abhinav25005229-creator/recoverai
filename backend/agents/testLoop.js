const recoveryLoop =
    require("./recoveryLoop");


const payment = {

    transaction_id: "TXN_000002",

    amount: 4999,

    payment_method: "UPI",

    failure_reason: "BANK_TIMEOUT"

};


async function main() {

    const result =
        await recoveryLoop(
            payment,
            0.91
        );


    console.log("\n");
    console.log("FINAL RESULT");
    console.log("==============================");

    console.log(
        JSON.stringify(
            result,
            null,
            2
        )
    );

}


main();