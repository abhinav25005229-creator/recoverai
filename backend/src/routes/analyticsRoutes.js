const express = require("express");
const generateInsights =
    require("../services/insightService");
const {
    getRevenueAnalytics,
    getFailureAnalytics,
    getStrategyAnalytics,
    getDailyRecovery
} = require("../services/analyticsService");


const router = express.Router();


/* =====================================
   Revenue
===================================== */

router.get(
    "/revenue",
    async (req, res) => {

        try {

            const data =
                await getRevenueAnalytics();


            res.json({

                success: true,

                data

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Failed to fetch revenue analytics"

            });

        }

    }
);


/* =====================================
   Failure
===================================== */

router.get(
    "/failures",
    async (req, res) => {

        try {

            const data =
                await getFailureAnalytics();


            res.json({

                success: true,

                data

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Failed to fetch failure analytics"

            });

        }

    }
);


/* =====================================
   Strategy
===================================== */

router.get(
    "/strategies",
    async (req, res) => {

        try {

            const data =
                await getStrategyAnalytics();


            res.json({

                success: true,

                data

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Failed to fetch strategy analytics"

            });

        }

    }
);


/* =====================================
   Daily
===================================== */

router.get(
    "/daily",
    async (req, res) => {

        try {

            const data =
                await getDailyRecovery();


            res.json({

                success: true,

                data

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Failed to fetch daily analytics"

            });

        }

    }
);
router.get(
    "/insights",
    async (req, res) => {

        try {

            const insights =
                await generateInsights();


            res.json({

                success: true,

                data: insights

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Failed to generate insights"

            });

        }

    }
);

module.exports = router;