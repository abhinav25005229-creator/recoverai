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

                transaction_id:
                    req.params.transactionId,

                data: result

            });


        } catch (error) {

            console.error(
                "RecoverAI error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "RecoverAI process failed",

                error:
                    error.message

            });

        }

    }
);


module.exports = router;