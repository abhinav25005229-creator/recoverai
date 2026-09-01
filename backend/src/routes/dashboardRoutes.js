const express = require("express");

const {

    getDashboardStats,

    getRecentDecisions,

    getRecoveryActivity

} = require("../services/dashboardService");


const router = express.Router();


// --------------------------------
// Dashboard statistics
// --------------------------------

router.get(
    "/stats",
    async (req, res) => {

        try {

            const stats =
                await getDashboardStats();


            res.json({

                success: true,

                data: stats

            });


        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Failed to fetch dashboard stats"

            });

        }

    }
);


// --------------------------------
// Recent AI decisions
// --------------------------------

router.get(
    "/decisions",
    async (req, res) => {

        try {

            const decisions =
                await getRecentDecisions();


            res.json({

                success: true,

                data: decisions

            });


        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Failed to fetch AI decisions"

            });

        }

    }
);


// --------------------------------
// Recovery activity
// --------------------------------

router.get(
    "/activity",
    async (req, res) => {

        try {

            const activity =
                await getRecoveryActivity();


            res.json({

                success: true,

                data: activity

            });


        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Failed to fetch activity"

            });

        }

    }
);


module.exports = router;