from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score
import joblib as jb
from all_symptoms import x_train, x_test, y_train, y_test, labels

model = XGBClassifier(
    objective="multi:softprob",
    num_class=len(labels.classes_),
    eval_metric="mlogloss",
    max_depth=6,
    learning_rate=0.1,
    n_estimators=200
)

model.fit(x_train, y_train)

y_pred = model.predict(x_test)
print("Accuracy:", accuracy_score(y_test, y_pred))

jb.dump(model, "disease_prediction_model.pkl")
jb.dump(labels, "label_encoder.pkl")

print("Model saved.")