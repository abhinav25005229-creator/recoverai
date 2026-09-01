import pandas as pd
import joblib

model = joblib.load("recovery_model.pkl")
features = joblib.load("feature_names.pkl")

sample = {
    "amount": 2999,
    "customer_age": 24,
    "previous_transactions": 18,
    "successful_transactions": 16,
    "failed_transactions": 2,
    "hour": 19,

    "payment_method_UPI": 1,
    "payment_method_CARD": 0,
    "payment_method_NETBANKING": 0,
    "payment_method_WALLET": 0,

    "failure_reason_BANK_TIMEOUT": 1,
    "failure_reason_NETWORK_ERROR": 0,
    "failure_reason_CARD_DECLINED": 0,
    "failure_reason_LIMIT_EXCEEDED": 0,
    "failure_reason_INSUFFICIENT_FUNDS": 0,
    "failure_reason_OTP_FAILURE": 0,
    "failure_reason_BANK_SERVER_DOWN": 0,

    "preferred_method_UPI": 1,
    "preferred_method_CARD": 0,
    "preferred_method_NETBANKING": 0,
    "preferred_method_WALLET": 0
}

row = pd.DataFrame([sample])

# Add missing columns
for col in features:
    if col not in row.columns:
        row[col] = 0

row = row[features]

prob = model.predict_proba(row)[0][1]

print(f"Recovery Probability: {round(prob*100,2)}%")