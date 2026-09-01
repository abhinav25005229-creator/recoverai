let io = null;


function initializeSocket(serverIO) {

    io = serverIO;

}


function emitAgentEvent(
    transactionId,
    event
) {

    if (!io) {

        return;

    }

    io.emit(
        "agent.activity",
        {
            transactionId,
            ...event,
            timestamp:
                new Date().toISOString()
        }
    );

}


module.exports = {
    initializeSocket,
    emitAgentEvent
};