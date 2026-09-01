const analyzeFailure =
    require("./failureAnalyzer");

const selectStrategy =
    require("./strategyAgent");

const executeAction =
    require("./actionAgent");


async function recoverPayment(
    payment,
    recoveryProbability
) {

    console.log("\n================================");
    console.log("RECOVERAI AGENT STARTED");
    console.log("================================");

    console.log(
        `Transaction: ${payment.transaction_id}`
    );

    console.log(
        `Amount: ₹${payment.amount}`
    );

    console.log(
        `Failure: ${payment.failure_reason}`
    );


    // STEP 1
    const failureAnalysis =
        analyzeFailure(payment.failure_reason);

    console.log("\nFailure Analysis:");
    console.log(failureAnalysis);


    // STEP 2
    const strategy =
        selectStrategy(
            payment,
            failureAnalysis,
            recoveryProbability
        );

    console.log("\nStrategy Selected:");
    console.log(strategy);


    // STEP 3
    const actionResult =
        await executeAction(
            payment,
            strategy
        );


    // STEP 4
    return {

        transaction_id:
            payment.transaction_id,

        recovery_probability:
            recoveryProbability,

        failure_analysis:
            failureAnalysis,

        strategy,

        result:
            actionResult
    };
}


module.exports = recoverPayment;