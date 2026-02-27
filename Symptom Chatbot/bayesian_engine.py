import numpy as np

def normalize(prob_vector):
    total = np.sum(prob_vector)
    if total == 0:
        return prob_vector
    return prob_vector / total


def bayesian_update(current_probs, symptom, disease_symptom_prob, labels, symptom_present=True):
    updated_probs = []

    for i, disease in enumerate(labels.classes_):

        epsilon = 0.005 # Preventing 100% disease prediction
        raw_likelihood = disease_symptom_prob[disease][symptom]
        # Smoothing, Laplace style
        likelihood = raw_likelihood * (1 - epsilon) + epsilon

        if not symptom_present:
            likelihood = 1 - likelihood

        posterior = likelihood * current_probs[i]
        updated_probs.append(posterior)

    updated_probs = np.array(updated_probs)
    updated_probs = normalize(updated_probs)

    return updated_probs


def check_convergence(current_probs, threshold=0.75):
    max_prob = np.max(current_probs)
    return max_prob >= threshold