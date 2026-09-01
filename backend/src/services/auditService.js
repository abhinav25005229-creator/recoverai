const pool = require("../db");

async function logAgentAction({
    transactionId,
    agent,
    action,
    input,
    output
}) {

    await pool.query(
        `
        INSERT INTO audit_logs
        (
            transaction_id,
            agent,
            action,
            input,
            output
        )
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
            transactionId,
            agent,
            action,
            JSON.stringify(input),
            JSON.stringify(output)
        ]
    );

}

module.exports = logAgentAction;