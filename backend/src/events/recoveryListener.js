const eventBus =
    require("./eventBus");


const runRecoverAI =
    require("../services/recoverAIOrchestrator");


const {
    hasProcessedEvent,
    markEventProcessed
} = require(
    "../services/idempotencyService"
);


eventBus.on(
    "payment.failed",
    async (event) => {

        try {

            const {
                eventId,
                eventType,
                payment
            } = event;


            console.log(
                `\n📨 Event received: ${eventId}`
            );


            // ----------------------------
            // Idempotency check
            // ----------------------------

            const alreadyProcessed =
                await hasProcessedEvent(
                    eventId
                );


            if (alreadyProcessed) {

                console.log(
                    "⚠️ Duplicate event ignored"
                );

                return;

            }


            // ----------------------------
            // Mark BEFORE processing
            // ----------------------------

            await markEventProcessed({

                eventId,

                eventType,

                transactionId:
                    payment.transaction_id

            });


            console.log(
                "✓ Event accepted"
            );


            // ----------------------------
            // Start RecoverAI
            // ----------------------------

            await runRecoverAI(
                payment.transaction_id
            );


        } catch (error) {

            console.error(
                "Recovery listener error:",
                error
            );

        }

    }
);