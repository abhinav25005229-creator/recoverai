const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


async function generateStrategy(context) {

    const probability =
        Number(context.recovery_probability || 0);

    const failureReason =
        context.transaction?.failure_reason;


    // ==========================================
    // FALLBACK STRATEGY
    // Used when LLM is unavailable
    // ==========================================

   function fallbackStrategy() {

    const attemptedStrategies =
        context.previous_attempts || [];


    const attempted =
        attemptedStrategies.map(
            attempt => attempt.strategy
        );


    // --------------------------------
    // 1. Good probability + temporary failure
    // --------------------------------

    if (
        probability >= 0.50 &&
        (
            failureReason === "BANK_TIMEOUT" ||
            failureReason === "NETWORK_ERROR" ||
            failureReason === "BANK_SERVER_DOWN"
        ) &&
        !attempted.includes("RETRY_PAYMENT")
    ) {

        return {
            decision: "RETRY_PAYMENT",
            delay_seconds: 120,
            confidence: 0.80,
            reason:
                "Temporary failure with sufficient recovery probability."
        };

    }


    // --------------------------------
    // 2. Preferred method alternative
    // --------------------------------

    if (
        !attempted.includes("SUGGEST_UPI")
    ) {

        return {
            decision: "SUGGEST_UPI",
            delay_seconds: 60,
            confidence: 0.75,
            reason:
                "Previous strategy was already attempted; suggesting an alternative payment method."
        };

    }


    // --------------------------------
    // 3. Payment reminder
    // --------------------------------

    if (
        probability >= 0.30 &&
        !attempted.includes(
            "SEND_PAYMENT_REMINDER"
        )
    ) {

        return {
            decision:
                "SEND_PAYMENT_REMINDER",

            delay_seconds: 300,

            confidence: 0.70,

            reason:
                "Recovery probability is moderate and the reminder strategy has not been attempted."
        };

    }


    // --------------------------------
    // 4. Final safe fallback
    // --------------------------------

    return {

        decision:
            "ESCALATE_TO_SUPPORT",

        delay_seconds: 0,

        confidence: 0.60,

        reason:
            "Available recovery strategies were already attempted; manual support review is recommended."

    };

}


    // ==========================================
    // OpenAI Strategy
    // ==========================================

    try {

        const prompt = `
You are RecoverAI, an AI payment recovery decision engine.

Your job is to recommend the safest and most effective
recovery strategy for a failed payment.

IMPORTANT:
- Never invent transaction information.
- Never expose sensitive payment information.
- Do not recommend unlimited retries.
- Consider customer history.
- Consider failure reason.
- Consider recovery probability.
- Prefer the least aggressive effective action.
IMPORTANT MEMORY RULES:
- Review previous attempts and agent memory.
- Do not blindly repeat a strategy that already failed.
- Prefer a different recovery strategy after repeated failures.
- Never exceed allowed retry limits.
- If previous actions were unsuccessful, explain why the next strategy is different.
Available actions:
1. RETRY_PAYMENT
2. SUGGEST_UPI
3. SEND_PAYMENT_REMINDER
4. ESCALATE_TO_SUPPORT
5. NO_ACTION

Payment Context:
${JSON.stringify(context, null, 2)}

Return ONLY valid JSON:

{
    "decision": "RETRY_PAYMENT",
    "delay_seconds": 120,
    "confidence": 0.92,
    "reason": "short explanation"
}
`;


        const response =
            await client.responses.create({

                model: "gpt-5-mini",

                input: prompt

            });


        const text =
            response.output_text;


        return JSON.parse(text);


    } catch (error) {

        console.log(
            "⚠️ LLM unavailable. Using fallback strategy."
        );

        console.log(
            "Reason:",
            error.message
        );


        return fallbackStrategy();

    }

}


module.exports =
    generateStrategy;