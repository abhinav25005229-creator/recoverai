const runExperiment =
    require("./recoveryExperiment");


const result =
    runExperiment(1000);


console.log(
    JSON.stringify(
        result,
        null,
        2
    )
);