import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Endpoint to analyze Health Metrics and return an AI prediction/insight.
 * In a real-world scenario, you would pass these metrics to a Python service
 * (using Flask/FastAPI) running your actual Machine Learning model (e.g. Scikit-learn, TensorFlow).
 */

app.post('/api/symptom-check', async (req, res) => {
    try {
        const { symptoms, userId } = req.body;

        if (!symptoms) {
            return res.status(400).json({ success: false, error: "No symptoms provided" });
        }

        // 1. FORWARD TO YOUR AI MODEL
        // Replace 'http://localhost:8000/predict' with your actual AI service URL
        // const aiResponse = await axios.post('http://localhost:8000/predict', {
        //     text: symptoms 
        // });
        // const botMessage = aiResponse.data.message;

        // --- SIMULATED CHATBOT RESPONSE (Replace with actual API call above) ---
        const botMessage = `Based on your mention of "${symptoms}", it could be related to seasonal allergies or a common cold. However, please track if you develop a fever.`;
        const suggestedSpecialist = "General Physician";

        // 2. OPTIONAL: Save the interaction to Supabase 'logs'
        if (userId) {
            await supabase
                .from('health_logs')
                .insert([{ 
                    user_id: userId, 
                    type: 'symptom_check', 
                    input: symptoms, 
                    output: botMessage 
                }]);
        }

        return res.status(200).json({
            success: true,
            reply: botMessage,
            recommendation: suggestedSpecialist,
            disclaimer: "This is an AI-generated insight and not a medical diagnosis."
        });

    } catch (error) {
        console.error("Symptom Check Error:", error);
        return res.status(500).json({ success: false, error: "AI service is currently unavailable" });
    }
});
app.post('/api/analyze-health', async (req, res) => {
    try {
        const {
            blood_glucose,
            hba1c,
            systolic_bp,
            diastolic_bp,
            ldl,
            hdl,
            triglycerides,
            haemoglobin,
            mcv
        } = req.body;

        // TODO: Connect to actual Health Model here
        // Example: const response = await axios.post('http://python-model-service/predict', req.body);
        // const prediction = response.data;

        // --- SIMULATED AI MODEL LOGIC ---
        let riskLevel = "Low";
        let insights = [];

        // Basic heuristic checks to simulate model output
        if (blood_glucose > 125 || hba1c > 6.4) {
            riskLevel = "High";
            insights.push("Blood glucose/HbA1c levels suggest potential diabetes risk. Consult a physician for a formal diagnosis.");
        } else if (blood_glucose >= 100 || hba1c >= 5.7) {
            if (riskLevel === "Low") riskLevel = "Moderate";
            insights.push("Blood glucose/HbA1c levels suggest prediabetes. Consider dietary adjustments.");
        }

        if (systolic_bp >= 140 || diastolic_bp >= 90) {
            riskLevel = "High";
            insights.push("Blood pressure is currently in the hypertensive range. Please monitor closely.");
        }

        if (ldl > 160) {
            if (riskLevel === "Low") riskLevel = "Moderate";
            insights.push("LDL cholesterol is elevated, which can increase cardiovascular risk.");
        }

        if (insights.length === 0) {
            insights.push("All provided metrics appear to be within normal ranges. Keep up the good work!");
        }

        // Return the "Model" Prediction to the Frontend
        return res.status(200).json({
            success: true,
            analysis: {
                riskLevel,
                insights,
                timestamp: new Date().toISOString()
            },
            message: "Health metrics successfully analyzed by MedIQ Model."
        });

    } catch (error) {
        console.error("Model Error:", error);
        return res.status(500).json({ success: false, error: "Failed to run health model analysis" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`MedIQ Backend Server is running on port ${PORT}`);
});
