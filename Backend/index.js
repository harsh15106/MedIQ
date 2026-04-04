import 'dotenv/config'; 

import express from 'express';
import cors from 'cors';

import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import multer from 'multer';
import FormData from 'form-data';
import drugRoutes from './routes/drugRoutes.js';


const app = express();
app.use(cors());
app.use(express.json());
app.use('/', drugRoutes);

const upload = multer();

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
console.log("SUPABASE_URL:", supabaseUrl);
console.log("SUPABASE_KEY:", supabaseAnonKey?.slice(0, 10));
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Endpoint to analyze Health Metrics and return an AI prediction/insight.
 * In a real-world scenario, you would pass these metrics to a Python service
 * (using Flask/FastAPI) running your actual Machine Learning model (e.g. Scikit-learn, TensorFlow).
 */

const ML_SERVICE_URL = process.env.HEALTH_MODEL_API;
// Add this helper to handle JSON vs File logic
app.post('/api/analyze-health', upload.single('file'), async (req, res) => {
    console.log(req.body)
    try {
        let response;
        const ML_SERVICE_URL = process.env.HEALTH_MODEL_API;;

        if (req.file) {
            // SCENARIO A: File Upload (PDF/Image)

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


app.post('/api/analyze-report', upload.single('file'), async (req, res) => {
    try {


        // const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

        const form = new FormData();
        form.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

        const response = await axios.post(
            `${ML_SERVICE_URL}/predict-from-report`,
            form,
            { headers: form.getHeaders() }
        );

        res.json({
            success: true,
            analysis: response.data
        });

    } catch (error) {
        console.error("Report Analysis Error:", error.message);
        res.status(500).json({
            success: false,
            error: "AI model failed to process report."
        });
    }
});


app.post('/api/analyze-report', upload.single('file'), async (req, res) => {
  try {
   

   // const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post(
      `${ML_SERVICE_URL}/predict-from-report`,
      form,
      { headers: form.getHeaders() }
    );

    res.json({
      success: true,
      analysis: response.data
    });

  } catch (error) {
    console.error("Report Analysis Error:", error.message);
    res.status(500).json({
      success: false,
      error: "AI model failed to process report."
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

// --- DAILY QUOTE AI ENDPOINT ---
app.get('/api/daily-quote', async (req, res) => {
    try {
        // Fetch all quotes from the Supabase database
        const { data: quotesData, error: quotesError } = await supabase
            .from('daily_quotes')
            .select('quote');

        if (quotesError) throw quotesError;

        if (!quotesData || quotesData.length === 0) {
            // Fallback if the table is empty or doesn't exist yet
            return res.json({
                success: true,
                quote: "Your recent hydration and activity levels indicate stable cardiovascular metrics."
            });
        }

        // Use the current day of the month to select a quote that changes everyday
        const currentDayOfMonth = new Date().getDate();
        const index = currentDayOfMonth % quotesData.length;

        return res.json({
            success: true,
            quote: quotesData[index].quote
        });

    } catch (error) {
        console.error("Daily Quote Error:", error.message);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch daily quote"
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Node server running on http://localhost:${PORT}`);
});

