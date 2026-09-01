const express = require("express");

const {
    getPendingReviews,
    resolveReview
} = require("../services/reviewService");

const router = express.Router();

const executeHumanApproval =
    require("../services/humanApprovalService");
// ==================================
// GET PENDING REVIEWS
// ==================================

router.get(
    "/",
    async (req, res) => {

        try {

            const reviews =
                await getPendingReviews();

            res.json({

                success: true,

                data: reviews

            });

        } catch (error) {

            console.error(
                "Get reviews error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Failed to fetch reviews"

            });

        }

    }
);


// ==================================
// RESOLVE REVIEW
// ==================================
router.post(
    "/:reviewId/resolve",
    async (req, res) => {

        try {

            const {
                action,
                note
            } = req.body;


            const result =
                await executeHumanApproval({

                    reviewId:
                        req.params.reviewId,

                    action,

                    note

                });


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