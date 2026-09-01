const {
    getRevenueAnalytics,
    getFailureAnalytics,
    getStrategyAnalytics
} = require("./analyticsService");


async function generateInsights() {

    const revenue =
        await getRevenueAnalytics();


    const failures =
        await getFailureAnalytics();


    const strategies =
        await getStrategyAnalytics();


    const insights = [];


    // --------------------------------
    // Highest failure category
    // --------------------------------

    if (failures.length > 0) {

        const highestFailure =
            failures[0];


        insights.push({

            type: "FAILURE_PATTERN",

            title:
                "Highest Failure Pattern",

            message:
                `${highestFailure.failureReason} is currently the most frequent failure with ${highestFailure.attempts} failed payments.`

        });

    }


    // --------------------------------
    // Best strategy
    // --------------------------------

    if (strategies.length > 0) {

        const bestStrategy =
            [...strategies]
                .sort(
                    (a, b) =>
                        b.successRate -
                        a.successRate
                )[0];


        insights.push({

            type: "STRATEGY_PERFORMANCE",

            title:
                "Best Recovery Strategy",

            message:
                `${bestStrategy.strategy} currently has the highest recovery success rate at ${bestStrategy.successRate}%.`

        });

    }


    // --------------------------------
    // Revenue at risk
    // --------------------------------

    if (
        revenue.revenueAtRisk > 0
    ) {

        insights.push({

            type: "REVENUE_RISK",

            title:
                "Revenue Exposure",

            message:
                `${formatINR(revenue.revenueAtRisk)} is currently associated with failed payment attempts.`

        });

    }


    return insights;

}


function formatINR(value) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(value);

}


module.exports =
    generateInsights;