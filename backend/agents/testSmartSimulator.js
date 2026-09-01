const {
    calculateRecoveryChance,
    simulateRecovery
} = require("./smartRecoverySimulator");


const result =
    simulateRecovery({

        recoveryProbability: 0.91,

        failureReason:
            "BANK_TIMEOUT",

        customerProfile: {

            recovery_profile: "HIGH"

        },

        strategy:
            "PRIORITY_RETRY",

        attemptNumber: 1

    });


console.log(
    JSON.stringify(
        result,
        null,
        2
    )
);