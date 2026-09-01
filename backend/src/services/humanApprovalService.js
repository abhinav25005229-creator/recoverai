const pool = require("../db");

const executeAction =
    require("../../agents/actionAgent");

const {
    saveMemory
} = require("./memoryService");

const logAgentAction =
    require("./auditService");


async function executeHumanApproval({
    reviewId,
    action,
    note
}) {

    // -----------------------------
    // Get review
    // -----------------------------
const reviewResult =
    await pool.query(
        `
        SELECT
            hr.*,
            hr.status AS review_status,
            t.transaction_id,
            t.customer_id,
            t.amount,
            t.payment_method,
            t.failure_reason,
            t.status AS transaction_status
        FROM human_reviews hr
        JOIN transactions t
        ON hr.transaction_id =
           t.transaction_id
        WHERE hr.review_id = $1
        `,
        [reviewId]
    );

console.log("🔍 HUMAN APPROVAL DEBUG");
console.log("reviewId received:", reviewId);
console.log("reviewId type:", typeof reviewId);
console.log("rows found:", reviewResult.rows.length);
console.log("review row:", reviewResult.rows[0]);


if (
    reviewResult.rows.length === 0
) {

    throw new Error(
        "Review not found"
    );

}


const review =
    reviewResult.rows[0];


    if (
           review.review_status !== "PENDING"
    ) {

        throw new Error(
            "Review already resolved"
        );

    }


    // -----------------------------
    // Reject
    // -----------------------------

    if (action === "REJECTED") {

        await pool.query(
            `
            UPDATE human_reviews

            SET
                status = 'RESOLVED',
                reviewer_action = 'REJECTED',
                reviewer_note = $1,
                resolved_at = CURRENT_TIMESTAMP

            WHERE review_id = $2
            `,
            [
                note || "Rejected by reviewer",
                reviewId
            ]
        );


        await saveMemory({

            transactionId:
                review.transaction_id,

            agent:
                "HUMAN_REVIEW",

            memoryType:
                "REVIEW_DECISION",

            content: {

                action: "REJECTED",

                note

            }

        });


        return {

            status: "REJECTED",

            transactionId:
                review.transaction_id

        };

    }


    // -----------------------------
    // Approve
    // -----------------------------

    if (action !== "APPROVED") {

        throw new Error(
            "Invalid reviewer action"
        );

    }


    const actionResult =
        await executeAction(

            {

                transaction_id:
                    review.transaction_id,

                customer_id:
                    review.customer_id,

                amount:
                    review.amount,

                payment_method:
                    review.payment_method,

                failure_reason:
                    review.failure_reason

            },

            {

                strategy:
                    review.recommended_action,

                action:
                    review.recommended_action

            },

            {

                recoveryProbability:
                    0.5,

                customerProfile:
                    {},

                attemptNumber:
                    1

            }

        );


    // -----------------------------
    // Update review
    // -----------------------------

    await pool.query(
        `
        UPDATE human_reviews

        SET
            status = 'RESOLVED',
            reviewer_action = 'APPROVED',
            reviewer_note = $1,
            resolved_at = CURRENT_TIMESTAMP

        WHERE review_id = $2
        `,
        [
            note || "Approved by reviewer",
            reviewId
        ]
    );


    // -----------------------------
    // Save memory
    // -----------------------------

    await saveMemory({

        transactionId:
            review.transaction_id,

        agent:
            "HUMAN_REVIEW",

        memoryType:
            "REVIEW_DECISION",

        content: {

            action: "APPROVED",

            note,

            result:
                actionResult.result

        }

    });


    // -----------------------------
    // Audit
    // -----------------------------

    await logAgentAction({

        transactionId:
            review.transaction_id,

        agent:
            "Human Reviewer",

        action:
            "APPROVE_RECOVERY",

        input: {

            reviewId,

            action

        },

        output:
            actionResult

    });


    return {

        status:
            "APPROVED",

        transactionId:
            review.transaction_id,

        action:
            actionResult

    };

}


module.exports =
    executeHumanApproval;