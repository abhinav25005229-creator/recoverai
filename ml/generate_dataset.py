import random
import csv
from datetime import datetime, timedelta

NUM_TRANSACTIONS = 50000

payment_methods = [
    "UPI",
    "CARD",
    "NETBANKING",
    "WALLET"
]

failure_reasons = [
    "BANK_TIMEOUT",
    "INSUFFICIENT_FUNDS",
    "CARD_DECLINED",
    "NETWORK_ERROR",
    "OTP_FAILURE",
    "LIMIT_EXCEEDED",
    "BANK_SERVER_DOWN"
]

customers = {}

for i in range(1, 10001):
    customers[f"CUST_{i:05d}"] = {
        "age": random.randint(18, 60),
        "total": random.randint(1, 30),
        "successful": random.randint(1, 25),
        "failed": random.randint(0, 10),
        "preferred_method": random.choice(payment_methods)
    }

start_date = datetime.now() - timedelta(days=180)

file_path = "../data/payments.csv"

with open(file_path, "w", newline="") as file:

    writer = csv.writer(file)

    writer.writerow([
        "transaction_id",
        "customer_id",
        "amount",
        "payment_method",
        "status",
        "failure_reason",
        "customer_age",
        "previous_transactions",
        "successful_transactions",
        "failed_transactions",
        "preferred_method",
        "hour",
        "day_of_week"
    ])

    for i in range(1, NUM_TRANSACTIONS + 1):

        customer_id = random.choice(list(customers.keys()))
        customer = customers[customer_id]

        amount = round(random.uniform(100, 25000), 2)

        payment_method = random.choice(payment_methods)

        success_probability = 0.82

        if payment_method == customer["preferred_method"]:
            success_probability += 0.08

        status = (
            "SUCCESS"
            if random.random() < success_probability
            else "FAILED"
        )

        if status == "FAILED":
            failure_reason = random.choice(failure_reasons)
        else:
            failure_reason = ""

        transaction_time = start_date + timedelta(
            minutes=random.randint(0, 180 * 24 * 60)
        )

        writer.writerow([
            f"TXN_{i:06d}",
            customer_id,
            amount,
            payment_method,
            status,
            failure_reason,
            customer["age"],
            customer["total"],
            customer["successful"],
            customer["failed"],
            customer["preferred_method"],
            transaction_time.hour,
            transaction_time.strftime("%A")
        ])

print("Dataset generated successfully!")
print(f"Total transactions: {NUM_TRANSACTIONS}")
print(f"Saved to: {file_path}")