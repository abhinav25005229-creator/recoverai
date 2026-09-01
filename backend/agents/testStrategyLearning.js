const {
    getStrategyPerformance,
    getFailureStrategyPerformance,
    getBestStrategy
} = require("../src/services/strategyLearningService");


async function main() {

    console.log("\n=== STRATEGY PERFORMANCE ===");

    const strategies =
        await getStrategyPerformance();

    console.log(
        JSON.stringify(
            strategies,
            null,
            2
        )
    );


    console.log("\n=== FAILURE STRATEGY PERFORMANCE ===");

    const failureStrategies =
        await getFailureStrategyPerformance();

    console.log(
        JSON.stringify(
            failureStrategies,
            null,
            2
        )
    );


    console.log("\n=== BEST STRATEGY ===");

    const bestStrategy =
        await getBestStrategy({

            failureReason:
                "BANK_TIMEOUT",

            customerSegment:
                "NEW_OR_LOW_ACTIVITY"

        });

    console.log(
        JSON.stringify(
            bestStrategy,
            null,
            2
        )
    );

}


main();