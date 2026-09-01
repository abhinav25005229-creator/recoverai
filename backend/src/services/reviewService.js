const pool = require("../db");


// =================================
// Create Human Review
// =================================

async function createReview({
    transactionId,
    riskScore,
    reason,
    recommendedAction
}) {

    const result =
        await pool.query(
            `
            INSERT INTO human_reviews
            (
                transaction_id,
                risk_score,
                reason,
                recommended_action
            )

            VALUES ($1, $2, $3, $4)

            RETURNING *
            `,
            [
                transactionId,
                riskScore,
                reason,
                recommendedAction
            ]
        );


    return result.rows[0];

}


// =================================
// Get Pending Reviews
// =================================

async function getPendingReviews() {

    const result =
        await pool.query(
            `
            SELECT

                hr.*,

                t.amount,
                t.payment_method,
                t.failure_reason,
                t.status

            FROM human_reviews hr

            JOIN transactions t
            ON hr.transaction_id =
               t.transaction_id

            WHERE hr.status = 'PENDING'

            ORDER BY
                hr.created_at DESC
            `
        );


    return result.rows;

}
async function getReviewById(reviewId) {

    const result = await pool.query(
        `
        SELECT
            hr.*,
            t.amount,
            t.customer_id,
            t.payment_method,
            t.failure_reason,
            t.status
        FROM human_reviews hr
        JOIN transactions t
        ON hr.transaction_id = t.transaction_id
        WHERE hr.review_id = $1
        `,
        [reviewId]
    );

    return result.rows[0] || null;
}

// =================================
// Resolve Review
// =================================

async function resolveReview({
    reviewId,
    reviewerAction,
    reviewerNote
}) {

    const result =
        await pool.query(
            `
            UPDATE human_reviews

            SET

                status = 'RESOLVED',

                reviewer_action = $1,

                reviewer_note = $2,

                resolved_at =
                    CURRENT_TIMESTAMP

            WHERE review_id = $3

            RETURNING *
            `,
            [
                reviewerAction,
                reviewerNote,
                reviewId
            ]
        );


    return result.rows[0];

}


// =================================
// Export
// =================================

module.exports = {

    createReview,

    getPendingReviews,

    resolveReview

};
module.exports = {
    createReview,
    getPendingReviews,
    resolveReview,
    getReviewById
};