const eventBus =
    require("./eventBus");


function generateEventId(
    transactionId
) {

    return `PAYMENT_FAILED_${transactionId}`;

}


function paymentFailed(
    payment
) {

    const eventId =
        generateEventId(
            payment.transaction_id
        );


    console.log(
        `\n🔔 Payment failed event: ${eventId}`
    );


    eventBus.emit(
        "payment.failed",
        {

            eventId,

            eventType:
                "payment.failed",

            payment

        }
    );

}


function paymentSucceeded(
    payment
) {

    const eventId =
        `PAYMENT_SUCCESS_${payment.transaction_id}`;


    eventBus.emit(
        "payment.succeeded",
        {

            eventId,

            eventType:
                "payment.succeeded",

            payment

        }
    );

}


module.exports = {

    paymentFailed,

    paymentSucceeded

};