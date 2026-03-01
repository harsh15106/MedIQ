import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';  
import multer from 'multer';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer();

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Endpoint to analyze Health Metrics and return an AI prediction/insight.
 * In a real-world scenario, you would pass these metrics to a Python service
 * (using Flask/FastAPI) running your actual Machine Learning model (e.g. Scikit-learn, TensorFlow).
 */

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
// Add this helper to handle JSON vs File logic
app.post('/api/analyze-health', upload.single('file'), async (req, res) => {
    console.log(req.body)
    try {
        let response;
        const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

        if (req.file) {
            // SCENARIO A: File Upload (PDF/Image)
            const FormData = require('form-data');
            const form = new FormData();
            form.append('file', req.file.buffer, {
                filename: req.file.originalname,
                contentType: req.file.mimetype,
            });

            response = await axios.post(`${ML_SERVICE_URL}/predict-from-report`, form, {
                headers: form.getHeaders()
            });
        } else {
            // SCENARIO B: Manual Input
            // Ensure req.body is not empty. If React sends JSON, 
            // ensure your frontend headers match or use a fallback.
            console.log("Processing manual metrics:", req.body);
            
            response = await axios.post(`${ML_SERVICE_URL}/predict`, req.body);
        }

        res.json({ 
            success: true, 
            analysis: response.data 
        });

    } catch (error) {
        console.error("ML Service Error:", error.message);
        res.status(500).json({ 
            success: false, 
            error: "The AI Model service is currently unreachable." 
        });
    }
});

/*{app.post('/api/symptom-check', async (req, res) => {
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
});}*/

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Node server running on http://localhost:${PORT}`);
});
/*{app.post('/api/analyze-health', async (req, res) => {
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
});}*/

// In your Express index.js
//require('dotenv').config();

