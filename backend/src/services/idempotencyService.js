const pool = require("../db");


async function hasProcessedEvent(
    eventId
) {

    const result =
        await pool.query(
            `
            SELECT event_id

            FROM processed_events

            WHERE event_id = $1
            `,
            [eventId]
        );


    return result.rows.length > 0;

}


/* =================================
   Mark event processed
================================= */

async function markEventProcessed({

    eventId,
    eventType,
    transactionId

}) {

    await pool.query(
        `
        INSERT INTO processed_events
        (
            event_id,
            event_type,
            transaction_id
        )

        VALUES ($1,$2,$3)

        ON CONFLICT (event_id)
        DO NOTHING
        `,
        [

            eventId,

            eventType,

            transactionId

        ]
    );

}


module.exports = {

    hasProcessedEvent,

    markEventProcessed

};