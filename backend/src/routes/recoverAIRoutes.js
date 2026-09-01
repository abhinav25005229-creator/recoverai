const express = require("express");

const runRecoverAI =
    require("../services/recoverAIOrchestrator");


const router = express.Router();


router.post(
    "/:transactionId",
    async (req, res) => {

        try {

            const result =
                await runRecoverAI(
                    req.params.transactionId
                );


            res.json({

                success: true,

                data: result

            });


        } catch (error) {

            console.error(error);


            res.status(500).json({

                success: false,

                message:
                    error.message

            });

        }

    }
);


module.exports = router;