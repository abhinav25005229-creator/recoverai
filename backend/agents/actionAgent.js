const {
    simulateRecovery
} = require("./smartRecoverySimulator");


async function executeAction(
    payment,
    strategy,
    context = {}
) {

    console.log("\n==============================");
    console.log("ACTION AGENT");
    console.log("==============================");


    console.log(
        `Transaction: ${payment.transaction_id}`
    );


    console.log(
        `Action: ${strategy.action}`
    );


    const simulation =
        simulateRecovery({

            recoveryProbability:
                context.recoveryProbability,

            failureReason:
                payment.failure_reason,

            customerProfile:
                context.customerProfile,

            strategy:
                strategy.strategy ||
                strategy.action,

            attemptNumber:
                context.attemptNumber || 1

        });


    console.log(
        `Simulated success chance: ${
            Math.round(
                simulation.successChance * 100
            )
        }%`
    );


    if (simulation.success) {

        console.log(
            "✅ PAYMENT RECOVERED"
        );


        return {

            success: true,

            result: "RECOVERED",

            recoveredAmount:
                Number(payment.amount),

            successChance:
                simulation.successChance

        };

    }


    console.log(
        "❌ RECOVERY FAILED"
    );


    return {

        success: false,

        result: "FAILED",

        recoveredAmount: 0,

        successChance:
            simulation.successChance

    };

}


module.exports =
    executeAction;