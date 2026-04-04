import express from 'express';
import { getDrugs, checkInteractions } from '../controllers/drugController.js';

const router = express.Router();

router.get('/drugs', getDrugs);
router.post('/check-interactions', checkInteractions);

export default router;