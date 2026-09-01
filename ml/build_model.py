import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

df = pd.read_csv("../data/recovery_training.csv")

# Convert categories into numbers
df = pd.get_dummies(df, columns=[
    "payment_method",
    "failure_reason",
    "preferred_method"
])

X = df.drop([
    "transaction_id",
    "customer_id",
    "status",
    "recovered",
    "day_of_week"
], axis=1)

y = df["recovered"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

model = RandomForestClassifier(
    n_estimators=150,
    random_state=42
)

model.fit(X_train, y_train)

pred = model.predict(X_test)

acc = accuracy_score(y_test, pred)

print("Accuracy:", round(acc * 100, 2), "%")

joblib.dump(model, "recovery_model.pkl")
joblib.dump(X.columns.tolist(), "feature_names.pkl")

print("Model saved!")