const pool = require("../db");


async function saveMemory({

    transactionId,
    agent,
    memoryType,
    content

}) {

    const result =
        await pool.query(
            `
            INSERT INTO agent_memory
            (
                transaction_id,
                agent,
                memory_type,
                content
            )

            VALUES ($1,$2,$3,$4)

            RETURNING *
            `,
            [

                transactionId,

                agent,

                memoryType,

                JSON.stringify(content)

            ]
        );


    return result.rows[0];

}


/* =================================
   Get memories
================================= */

async function getMemories(
    transactionId
) {

    const result =
        await pool.query(
            `
            SELECT *

            FROM agent_memory

            WHERE transaction_id = $1

            ORDER BY created_at ASC
            `,
            [transactionId]
        );


    return result.rows;

}


/* =================================
   Get latest memory by agent
================================= */

async function getLatestMemory(
    transactionId,
    agent
) {

    const result =
        await pool.query(
            `
            SELECT *

            FROM agent_memory

            WHERE transaction_id = $1

            AND agent = $2

            ORDER BY created_at DESC

            LIMIT 1
            `,
            [
                transactionId,
                agent
            ]
        );


    return result.rows[0] || null;

}


module.exports = {

    saveMemory,

    getMemories,

    getLatestMemory

};