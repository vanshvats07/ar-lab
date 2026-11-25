import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { askGeminiTutor, generateLabReportAI } from './services/geminiService.js';
import {
  saveExperimentAttempt,
  getStudentAttempts,
  getTeacherDashboardData,
  exportCSV
} from './services/dbService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    project: 'AR Physics Lab by HackHounds',
    time: new Date().toISOString(),
    aiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here')
  });
});

// AI Tutor Route
app.post('/api/tutor', async (req, res) => {
  try {
    const { experiment, state, lastAction, hintLevel, language } = req.body;
    if (!experiment || !state) {
      return res.status(400).json({ error: 'Missing experiment or state in request.' });
    }

    const tutorResponse = await askGeminiTutor({
      experiment,
      state,
      lastAction,
      hintLevel: Number(hintLevel) || 1,
      language: language || 'en'
    });

    res.json(tutorResponse);
  } catch (err) {
    console.error('Tutor route error:', err);
    res.status(500).json({ error: 'Tutor service failed', details: err.message });
  }
});

// Auto Lab Report Route
app.post('/api/report', async (req, res) => {
  try {
    const { experiment, readings, mistakes, hintsUsed, timeTaken, calculatedResult } = req.body;
    if (!experiment) {
      return res.status(400).json({ error: 'Missing experiment in request.' });
    }

    const report = await generateLabReportAI({
      experiment,
      readings: readings || [],
      mistakes: mistakes || [],
      hintsUsed: Number(hintsUsed) || 0,
      timeTaken: Number(timeTaken) || 0,
      calculatedResult: calculatedResult || {}
    });

    res.json(report);
  } catch (err) {
    console.error('Report route error:', err);
    res.status(500).json({ error: 'Report service failed', details: err.message });
  }
});

// Save Experiment Attempt & Score
app.post('/api/attempts', (req, res) => {
  try {
    const attempt = req.body;
    const saved = saveExperimentAttempt(attempt);
    res.json({ success: true, attempt: saved });
  } catch (err) {
    console.error('Save attempt error:', err);
    res.status(500).json({ error: 'Failed to save attempt' });
  }
});

// Get Student Progress & Attempts History
app.get('/api/attempts/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const attempts = getStudentAttempts(studentId);
    res.json({ studentId, attempts });
  } catch (err) {
    console.error('Get student attempts error:', err);
    res.status(500).json({ error: 'Failed to retrieve attempts' });
  }
});

// Teacher Dashboard Overview
app.get('/api/teacher/dashboard', (req, res) => {
  try {
    const classCode = req.query.classCode || 'PHYS-101';
    const data = getTeacherDashboardData(classCode);
    res.json(data);
  } catch (err) {
    console.error('Teacher dashboard error:', err);
    res.status(500).json({ error: 'Failed to get teacher dashboard data' });
  }
});

// Teacher CSV Export
app.get('/api/teacher/export-csv', (req, res) => {
  try {
    const classCode = req.query.classCode || 'PHYS-101';
    const csvContent = exportCSV(classCode);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=class_${classCode}_results.csv`);
    res.send(csvContent);
  } catch (err) {
    console.error('CSV export error:', err);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AR Physics Lab Backend listening on port ${PORT}`);
});
