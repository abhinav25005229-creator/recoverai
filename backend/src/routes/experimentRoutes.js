const express = require("express");

const runExperiment =
    require("../../agents/recoveryExperiment");


const router = express.Router();


router.get(
    "/run",
    (req, res) => {

        try {

            const count =
                Number(
                    req.query.count || 1000
                );


            if (
                count < 100 ||
                count > 10000
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Count must be between 100 and 10000"

                });

            }


            const result =
                runExperiment(
                    count
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
                    "Experiment failed"

            });

        }

    }
);


module.exports =
    router;