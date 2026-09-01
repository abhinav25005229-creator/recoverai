const evaluatePolicy =
    require("./src/services/policyEngine");


const result =
    evaluatePolicy({

        amount: 5000,

        recoveryProbability: 0.15,

        attemptNumber: 1,

        riskScore: 30,

        decision: "RETRY_PAYMENT"

    });


console.log(
    JSON.stringify(
        result,
        null,
        2
    )
);