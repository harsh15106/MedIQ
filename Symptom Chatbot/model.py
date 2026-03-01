from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib as jb
from all_symptoms import x_train, x_test, y_train, y_test, labels

model = XGBClassifier(
    objective="multi:softprob",
    num_class=len(labels.classes_),
    eval_metric="mlogloss",
    max_depth=5,                # Increased depth carefully
    learning_rate=0.05,         # Slower learning rate
    n_estimators=400,           # More trees
    subsample=0.8,              # Train on 80% of data per tree to prevent overfitting
    colsample_bytree=0.8,       # Train on 80% of features per tree
    gamma=0.1,                  # Relaxed min loss reduction
    reg_alpha=0.1,              # L1 regularization
    reg_lambda=1.0              # L2 regularization
)

model.fit(x_train, y_train)

y_pred = model.predict(x_test)
print("Accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:\n", classification_report(y_test, y_pred, target_names=labels.classes_))

jb.dump(model, "disease_prediction_model.pkl")
jb.dump(labels, "label_encoder.pkl")

print("Model saved.")