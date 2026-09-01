import pandas as pd
import joblib
import os


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = joblib.load(
    os.path.join(BASE_DIR, "recovery_model.pkl")
)

features = joblib.load(
    os.path.join(BASE_DIR, "feature_names.pkl")
)


def predict_recovery(payment):

    row = {
        "amount": payment["amount"],
        "customer_age": payment["customer_age"],
        "previous_transactions": payment["previous_transactions"],
        "successful_transactions": payment["successful_transactions"],
        "failed_transactions": payment["failed_transactions"],
        "hour": payment["hour"]
    }

    # Payment method
    for method in [
        "UPI",
        "CARD",
        "NETBANKING",
        "WALLET"
    ]:
        row[f"payment_method_{method}"] = (
            1 if payment["payment_method"] == method else 0
        )

    # Failure reason
    for reason in [
        "BANK_TIMEOUT",
        "NETWORK_ERROR",
        "CARD_DECLINED",
        "LIMIT_EXCEEDED",
        "INSUFFICIENT_FUNDS",
        "OTP_FAILURE",
        "BANK_SERVER_DOWN"
    ]:
        row[f"failure_reason_{reason}"] = (
            1 if payment["failure_reason"] == reason else 0
        )

    # Preferred method
    for method in [
        "UPI",
        "CARD",
        "NETBANKING",
        "WALLET"
    ]:
        row[f"preferred_method_{method}"] = (
            1 if payment["preferred_method"] == method else 0
        )

    df = pd.DataFrame([row])

    for feature in features:

        if feature not in df.columns:
            df[feature] = 0

    df = df[features]

    probability = model.predict_proba(df)[0][1]

    return float(probability)