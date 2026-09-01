require("dotenv").config();
const {
    saveMemory,
    getMemories
} =require("../src/services/memoryService");


async function main() {

    await saveMemory({

        transactionId:
            "TXN_MEMORY_TEST",

        agent:
            "ML_MODEL",

        memoryType:
            "PREDICTION",

        content: {

            recoveryProbability:
                0.91

        }

    });


    const memories =
        await getMemories(
            "TXN_MEMORY_TEST"
        );


    console.log(
        JSON.stringify(
            memories,
            null,
            2
        )
    );

}


main();