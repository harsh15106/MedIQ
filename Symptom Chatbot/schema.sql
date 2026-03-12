-- ============================================================
-- MedIQ Phase 5: Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- TABLE: symptoms
-- Stores all diagnostic symptoms, linked to a body region and severity.
CREATE TABLE IF NOT EXISTS symptoms (
    id        SERIAL PRIMARY KEY,
    name      TEXT NOT NULL UNIQUE,   -- e.g. 'calf_pain', 'swelling'
    region    TEXT NOT NULL,          -- e.g. 'Leg/Foot', 'Abdomen', 'Chest'
    severity  INTEGER DEFAULT 3 CHECK (severity BETWEEN 1 AND 5)
);

-- TABLE: disease_symptom_map
-- Links diseases to symptoms with a clinical weight (1=weak, 5=essential).
-- is_primary=TRUE marks the symptom as a core diagnostic indicator for that disease.
CREATE TABLE IF NOT EXISTS disease_symptom_map (
    id          SERIAL PRIMARY KEY,
    disease_id  INTEGER REFERENCES diseases(id) ON DELETE CASCADE,
    symptom_id  INTEGER REFERENCES symptoms(id) ON DELETE CASCADE,
    weight      INTEGER DEFAULT 3 CHECK (weight BETWEEN 1 AND 5),
    is_primary  BOOLEAN DEFAULT FALSE,
    UNIQUE(disease_id, symptom_id)
);

-- ============================================================
-- INDEXES for fast region-based filtering
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_symptoms_region ON symptoms(region);
CREATE INDEX IF NOT EXISTS idx_diseases_target_region ON diseases(target_region);
CREATE INDEX IF NOT EXISTS idx_dsm_disease_id ON disease_symptom_map(disease_id);

-- ============================================================
-- SEED: symptoms table (initial entries)
-- Covers 9 body regions with key diagnostic symptoms
-- ============================================================

INSERT INTO symptoms (name, region, severity) VALUES
-- Head
('headache', 'Head', 4),
('dizziness', 'Head', 3),
('spinning_movements', 'Head', 4),
('loss_of_balance', 'Head', 4),
('blurred_vision', 'Head', 4),
('nausea_head', 'Head', 2),
('sensitivity_to_light', 'Head', 3),
('runny_nose', 'Head', 2),
('congestion', 'Head', 2),
('sore_throat', 'Head', 2),
('ear_pain', 'Head', 3),
('facial_swelling', 'Head', 3),

-- Neck
('neck_pain', 'Neck', 4),
('stiff_neck', 'Neck', 4),
('neck_stiffness', 'Neck', 4),
('neck_swelling', 'Neck', 3),
('difficulty_turning_neck', 'Neck', 3),
('cervical_pain', 'Neck', 4),
('neck_click', 'Neck', 2),

-- Chest
('chest_pain', 'Chest', 5),
('shortness_of_breath', 'Chest', 5),
('cough', 'Chest', 3),
('wheezing', 'Chest', 4),
('chest_tightness', 'Chest', 4),
('palpitations', 'Chest', 4),
('blood_in_sputum', 'Chest', 5),
('phlegm', 'Chest', 3),
('breathlessness', 'Chest', 4),
('acidity_chest', 'Chest', 3),
('burning_chest', 'Chest', 3),

-- Abdomen
('stomach_pain', 'Abdomen', 4),
('nausea', 'Abdomen', 3),
('vomiting', 'Abdomen', 4),
('diarrhoea', 'Abdomen', 4),
('constipation', 'Abdomen', 3),
('bloating', 'Abdomen', 3),
('loss_of_appetite', 'Abdomen', 3),
('yellowing_of_eyes', 'Abdomen', 5),
('yellowish_skin', 'Abdomen', 5),
('dark_urine', 'Abdomen', 4),
('acidity', 'Abdomen', 3),
('indigestion', 'Abdomen', 2),
('stomach_bleeding', 'Abdomen', 5),
('pain_after_eating', 'Abdomen', 3),

-- Pelvis
('burning_urination', 'Pelvis', 5),
('frequent_urination', 'Pelvis', 4),
('bladder_discomfort', 'Pelvis', 4),
('pelvic_pain', 'Pelvis', 4),
('bloody_urine', 'Pelvis', 5),
('foul_smell_urine', 'Pelvis', 3),
('rectal_pain', 'Pelvis', 4),
('anal_itching', 'Pelvis', 3),
('bloody_stool', 'Pelvis', 5),

-- Back
('lower_back_pain', 'Back', 4),
('upper_back_pain', 'Back', 3),
('back_stiffness', 'Back', 3),
('radiating_back_pain', 'Back', 4),
('pain_when_bending', 'Back', 3),
('spine_pain', 'Back', 4),

-- Arm/Hand
('arm_pain', 'Arm/Hand', 4),
('hand_pain', 'Arm/Hand', 4),
('wrist_pain', 'Arm/Hand', 3),
('finger_numbness', 'Arm/Hand', 4),
('tingling_fingers', 'Arm/Hand', 4),
('grip_weakness', 'Arm/Hand', 3),
('elbow_pain', 'Arm/Hand', 3),
('shoulder_pain', 'Arm/Hand', 3),
('joint_swelling_hand', 'Arm/Hand', 3),
('hand_stiffness', 'Arm/Hand', 3),

-- Leg/Foot
('calf_pain', 'Leg/Foot', 5),
('knee_pain', 'Leg/Foot', 4),
('thigh_pain', 'Leg/Foot', 4),
('leg_swelling', 'Leg/Foot', 4),
('painful_walking', 'Leg/Foot', 4),
('leg_cramps', 'Leg/Foot', 3),
('hip_pain', 'Leg/Foot', 4),
('foot_pain', 'Leg/Foot', 3),
('ankle_pain', 'Leg/Foot', 3),
('shin_pain', 'Leg/Foot', 3),
('visible_veins_calf', 'Leg/Foot', 4),
('redness_leg', 'Leg/Foot', 4),
('warmth_in_leg', 'Leg/Foot', 4),
('leg_weakness', 'Leg/Foot', 3),

-- Systemic
('high_fever', 'Systemic', 5),
('mild_fever', 'Systemic', 3),
('chills', 'Systemic', 4),
('fatigue', 'Systemic', 3),
('night_sweats', 'Systemic', 4),
('weight_loss', 'Systemic', 4),
('skin_rash', 'Systemic', 4),
('itching', 'Systemic', 3),
('malaise', 'Systemic', 3),
('shivering', 'Systemic', 4),
('joint_pain', 'Systemic', 3),
('muscle_pain', 'Systemic', 3),
('swollen_lymph_nodes', 'Systemic', 4),
('excessive_sweating', 'Systemic', 3)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- HELPER VIEW: diseases with symptoms
-- Useful for quick inspections
-- ============================================================
CREATE OR REPLACE VIEW disease_with_symptoms AS
SELECT 
    d.id AS disease_id,
    d.name AS disease_name,
    d.target_region,
    d.body_system,
    s.name AS symptom_name,
    s.region AS symptom_region,
    dsm.weight,
    dsm.is_primary
FROM disease_symptom_map dsm
JOIN diseases d ON d.id = dsm.disease_id
JOIN symptoms s ON s.id = dsm.symptom_id;
