import pandas as pd
import random

df = pd.read_csv("../data/payments.csv")

# Keep only failed payments
failed = df[df["status"] == "FAILED"].copy()

# Recovery probability rules
def recovery_label(row):
    score = 0

    if row["failure_reason"] == "BANK_TIMEOUT":
        score += 40

    if row["failure_reason"] == "NETWORK_ERROR":
        score += 35

    if row["payment_method"] == row["preferred_method"]:
        score += 20

    if row["successful_transactions"] >= 10:
        score += 20

    if row["amount"] < 5000:
        score += 15

    probability = min(score / 100, 0.95)

    return 1 if random.random() < probability else 0

failed["recovered"] = failed.apply(recovery_label, axis=1)

print(failed[[
    "failure_reason",
    "amount",
    "successful_transactions",
    "recovered"
]].head())

failed.to_csv("../data/recovery_training.csv", index=False)

print("Training dataset created!")