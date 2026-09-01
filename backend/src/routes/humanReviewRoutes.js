const express = require("express");

const {
    getPendingReviews
} = require("../services/reviewService");

const router = express.Router();


// ==================================
// GET PENDING HUMAN REVIEWS
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

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Failed to fetch human reviews"

            });

        }

    }
);


module.exports = router;