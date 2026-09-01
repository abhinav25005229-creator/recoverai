const express = require("express");

const {
    getStrategyPerformance,
    getFailureStrategyPerformance,
    getBestStrategy
} = require("../services/strategyLearningService");


const router = express.Router();


router.get(
    "/performance",
    async (req, res) => {

        try {

            const data =
                await getStrategyPerformance();

            res.json({

                success: true,

                data

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Failed to fetch strategy performance"

            });

        }

    }
);


router.get(
    "/failure-performance",
    async (req, res) => {

        try {

            const data =
                await getFailureStrategyPerformance();

            res.json({

                success: true,

                data

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Failed to fetch failure strategy performance"

            });

        }

    }
);


module.exports = router;