const {
    calculateRecoveryChance
} = require("./smartRecoverySimulator");


function randomChoice(array) {

    return array[
        Math.floor(
            Math.random() *
            array.length
        )
    ];

}


function generatePayment() {

    const failureReasons = [

        "BANK_TIMEOUT",

        "NETWORK_ERROR",

        "CARD_DECLINED",

        "OTP_FAILURE",

        "INSUFFICIENT_FUNDS"

    ];


    const methods = [

        "UPI",

        "CARD",

        "NETBANKING"

    ];


    return {

        amount:
            Math.floor(
                Math.random() * 9000
            ) + 500,

        paymentMethod:
            randomChoice(methods),

        failureReason:
            randomChoice(
                failureReasons
            ),

        recoveryProbability:
            Math.random(),

        customerProfile: {

            recovery_profile:
                randomChoice([
                    "HIGH",
                    "MEDIUM",
                    "LOW"
                ])

        }

    };

}


/* =================================
   Baseline
================================= */

function simulateBaseline(payment) {

    let baseChance = 0.22;


    if (
        payment.failureReason ===
        "BANK_TIMEOUT"
    ) {

        baseChance += 0.08;

    }


    if (
        payment.failureReason ===
        "NETWORK_ERROR"
    ) {

        baseChance += 0.06;

    }


    if (
        payment.failureReason ===
        "INSUFFICIENT_FUNDS"
    ) {

        baseChance -= 0.10;

    }


    baseChance =
        Math.max(
            0.02,
            Math.min(
                0.80,
                baseChance
            )
        );


    return (
        Math.random() <
        baseChance
    );

}


/* =================================
   RecoverAI
================================= */

function simulateRecoverAI(payment) {

    const strategy =
        payment.recoveryProbability >= 0.75
            ? "PRIORITY_RETRY"
            : payment.recoveryProbability >= 0.50
                ? "PREFERRED_METHOD_RETRY"
                : "SEND_PAYMENT_REMINDER";


    const chance =
        calculateRecoveryChance({

            recoveryProbability:
                payment.recoveryProbability,

            failureReason:
                payment.failureReason,

            customerProfile:
                payment.customerProfile,

            strategy,

            attemptNumber: 1

        });


    return {

        success:
            Math.random() < chance,

        strategy,

        chance

    };

}


/* =================================
   Run Experiment
================================= */

function runExperiment(
    numberOfPayments = 1000
) {

    let baselineRecovered = 0;

    let aiRecovered = 0;


    let baselineRevenue = 0;

    let aiRevenue = 0;


    for (
        let i = 0;
        i < numberOfPayments;
        i++
    ) {

        const payment =
            generatePayment();


        // ----------------------------
        // Baseline
        // ----------------------------

        if (
            simulateBaseline(
                payment
            )
        ) {

            baselineRecovered++;

            baselineRevenue +=
                payment.amount;

        }


        // ----------------------------
        // RecoverAI
        // ----------------------------

        const aiResult =
            simulateRecoverAI(
                payment
            );


        if (aiResult.success) {

            aiRecovered++;

            aiRevenue +=
                payment.amount;

        }

    }


    const baselineRate =
        baselineRecovered /
        numberOfPayments *
        100;


    const aiRate =
        aiRecovered /
        numberOfPayments *
        100;


    return {

        payments:
            numberOfPayments,

        baseline: {

            recovered:
                baselineRecovered,

            recoveryRate:
                Number(
                    baselineRate.toFixed(2)
                ),

            revenueRecovered:
                baselineRevenue

        },

        recoverAI: {

            recovered:
                aiRecovered,

            recoveryRate:
                Number(
                    aiRate.toFixed(2)
                ),

            revenueRecovered:
                aiRevenue

        },

        improvement: {

            recoveryRate:
                Number(
                    (
                        aiRate -
                        baselineRate
                    ).toFixed(2)
                ),

            revenue:
                aiRevenue -
                baselineRevenue

        }

    };

}


module.exports =
    runExperiment;