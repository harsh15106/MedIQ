// generateReport.js
// MedIQ — PDF Report Generator using jsPDF
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const BRAND_COLOR = [47, 164, 164]; // Teal
const DARK_TEXT = [30, 41, 59];      // Slate-800
const MUTED_TEXT = [100, 116, 139];  // Slate-500

function addHeader(doc, title) {
  // Brand bar
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, 0, 220, 28, 'F');

  // Logo text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('MedIQ', 14, 18);

  // Subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('AI-Powered Health Intelligence', 50, 18);

  // Title
  doc.setTextColor(...DARK_TEXT);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 42);

  // Timestamp
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MUTED_TEXT);
  const now = new Date();
  doc.text(`Generated: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`, 14, 50);

  return 58; // Y position after header
}

function addDisclaimer(doc, y) {
  doc.setFillColor(245, 245, 250);
  doc.roundedRect(14, y, 182, 16, 2, 2, 'F');
  doc.setFontSize(7);
  doc.setTextColor(...MUTED_TEXT);
  doc.text(
    '⚠ Disclaimer: This report is AI-generated and intended for informational purposes only. It does',
    18, y + 6
  );
  doc.text(
    'not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.',
    18, y + 11
  );
  return y + 22;
}

/**
 * Generate a safe PDF triage report from the chatbot.
 * @param {Object} data
 * @param {string}   data.triage_level    - "emergency" | "urgent" | "non-urgent"
 * @param {string}   data.status          - Assessment summary
 * @param {string[]} data.symptoms        - Detected symptoms (human-readable)
 * @param {string[]} data.possible_causes - Broad non-diagnostic possible causes
 * @param {string}   data.advice          - Safe recommendation
 * @param {string}   data.disclaimer      - Medical disclaimer
 * @param {string}   [data.patientName]   - Optional patient name
 */
export function generateChatbotReport(data) {
  const doc = new jsPDF();
  let y = addHeader(doc, 'Symptom Triage Report');

  // Patient Info Box
  if (data.patientName) {
    doc.setFillColor(240, 249, 255);
    doc.roundedRect(14, y, 182, 12, 2, 2, 'F');
    doc.setFontSize(10);
    doc.setTextColor(...DARK_TEXT);
    doc.setFont('helvetica', 'bold');
    doc.text(`Patient: ${data.patientName}`, 18, y + 8);
    y += 18;
  }

  // Triage Level Banner
  const triage = (data.triage_level || 'non-urgent').toLowerCase();
  const triageColors = {
    emergency: { bg: [254, 242, 242], border: [220, 38, 38], text: [220, 38, 38], label: 'EMERGENCY' },
    urgent: { bg: [255, 251, 235], border: [245, 158, 11], text: [180, 100, 0], label: 'URGENT' },
    'non-urgent': { bg: [236, 253, 245], border: [16, 185, 129], text: [5, 150, 105], label: 'NON-URGENT' },
  };
  const tc = triageColors[triage] ?? triageColors['non-urgent'];

  doc.setFillColor(...tc.bg);
  doc.roundedRect(14, y, 182, 18, 3, 3, 'F');
  doc.setDrawColor(...tc.border);
  doc.roundedRect(14, y, 182, 18, 3, 3, 'S');
  doc.setFontSize(9);
  doc.setTextColor(...tc.text);
  doc.setFont('helvetica', 'bold');
  doc.text('TRIAGE LEVEL', 18, y + 7);
  doc.setFontSize(13);
  doc.text(`${tc.label}`, 18, y + 15);
  y += 26;

  // Assessment
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK_TEXT);
  doc.text('Assessment', 14, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MUTED_TEXT);
  const assessLines = doc.splitTextToSize(data.status || 'Data not available', 178);
  for (const line of assessLines) {
    doc.text(line, 14, y);
    y += 5;
  }
  y += 4;

  // Detected Symptoms Table
  const symptoms = Array.isArray(data.symptoms) && data.symptoms.length > 0
    ? data.symptoms
    : ['Data not available'];

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK_TEXT);
  doc.text('Detected Symptoms', 14, y);
  y += 4;

  doc.autoTable({
    startY: y,
    head: [['#', 'Symptom']],
    body: symptoms.map((s, i) => [i + 1, s.replace(/\b\w/g, l => l.toUpperCase())]),
    theme: 'grid',
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold'
    },
    bodyStyles: { fontSize: 9, textColor: DARK_TEXT },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
    columnStyles: { 0: { cellWidth: 12 } }
  });
  y = doc.lastAutoTable.finalY + 8;

  // Possible Causes Table
  const causes = Array.isArray(data.possible_causes) && data.possible_causes.length > 0
    ? data.possible_causes
    : ['Data not available'];

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK_TEXT);
  doc.text('Possible Causes (Not a Diagnosis)', 14, y);
  y += 4;

  doc.autoTable({
    startY: y,
    head: [['#', 'Possible Cause']],
    body: causes.map((c, i) => [i + 1, c.replace(/\b\w/g, l => l.toUpperCase())]),
    theme: 'grid',
    headStyles: {
      fillColor: BRAND_COLOR,
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold'
    },
    bodyStyles: { fontSize: 9, textColor: DARK_TEXT },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
    columnStyles: { 0: { cellWidth: 12 } }
  });
  y = doc.lastAutoTable.finalY + 8;

  // Recommendation
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK_TEXT);
  doc.text('Recommendation', 14, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MUTED_TEXT);
  const adviceLines = doc.splitTextToSize(data.advice || 'Please consult a healthcare professional.', 178);
  for (const line of adviceLines) {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.text(line, 14, y);
    y += 5;
  }
  y += 6;

  // Disclaimer
  if (y > 250) { doc.addPage(); y = 20; }
  addDisclaimer(doc, y);

  doc.save(`MedIQ_Triage_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}


/**
 * Generate a PDF report from health record analysis.
 * @param {Object} data
 * @param {Object} data.analysis - Model insights object
 * @param {Object} data.metrics - Health metric values
 * @param {string} data.patientName - Patient name (optional)
 */
export function generateHealthAnalysisReport(data) {
  const doc = new jsPDF();
  let y = addHeader(doc, 'Health Analysis Report');

  const analysis = data.analysis || {};

  // Patient Info
  if (data.patientName) {
    doc.setFillColor(240, 249, 255);
    doc.roundedRect(14, y, 182, 12, 2, 2, 'F');
    doc.setFontSize(10);
    doc.setTextColor(...DARK_TEXT);
    doc.setFont('helvetica', 'bold');
    doc.text(`Patient: ${data.patientName}`, 18, y + 8);
    y += 18;
  }

  // Predicted Condition
  const condition = analysis.predicted_condition || analysis.prediction || 'Unknown';
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(14, y, 88, 20, 3, 3, 'F');
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(14, y, 88, 20, 3, 3, 'S');
  doc.setFontSize(8);
  doc.setTextColor(5, 150, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('PREDICTED CONDITION', 18, y + 7);
  doc.setFontSize(12);
  doc.setTextColor(...DARK_TEXT);
  doc.text(condition, 18, y + 16);

  // Confidence
  const confidence = typeof analysis.confidence === 'number'
    ? `${(analysis.confidence * 100).toFixed(1)}%`
    : analysis.confidence || '—';
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(108, y, 88, 20, 3, 3, 'F');
  doc.setDrawColor(59, 130, 246);
  doc.roundedRect(108, y, 88, 20, 3, 3, 'S');
  doc.setFontSize(8);
  doc.setTextColor(37, 99, 235);
  doc.setFont('helvetica', 'bold');
  doc.text('MODEL CONFIDENCE', 112, y + 7);
  doc.setFontSize(12);
  doc.setTextColor(...DARK_TEXT);
  doc.text(confidence, 112, y + 16);
  y += 28;

  // Risk Category
  if (analysis.risk_category || analysis.riskLevel) {
    const risk = analysis.risk_category || analysis.riskLevel;
    const isHigh = risk.toLowerCase().includes('high');
    const color = isHigh ? [220, 38, 38] : [245, 158, 11];
    doc.setFillColor(...(isHigh ? [254, 242, 242] : [255, 251, 235]));
    doc.roundedRect(14, y, 182, 14, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setTextColor(...color);
    doc.setFont('helvetica', 'bold');
    doc.text(`Risk Category: ${risk}`, 18, y + 9);
    y += 20;
  }

  // Health Metrics Table
  if (data.metrics) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK_TEXT);
    doc.text('Submitted Health Metrics', 14, y);
    y += 4;

    const metricRows = Object.entries(data.metrics)
      .filter(([, val]) => val !== '' && val !== null && val !== undefined)
      .map(([key, val]) => [
        key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
        String(val)
      ]);

    if (metricRows.length > 0) {
      doc.autoTable({
        startY: y,
        head: [['Metric', 'Value']],
        body: metricRows,
        theme: 'grid',
        headStyles: {
          fillColor: BRAND_COLOR,
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold'
        },
        bodyStyles: { fontSize: 9, textColor: DARK_TEXT },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 14, right: 14 }
      });
      y = doc.lastAutoTable.finalY + 8;
    }
  }

  // Clinical Indicators
  if (Array.isArray(analysis.clinical_indicators) && analysis.clinical_indicators.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK_TEXT);
    doc.text('Contributing Biomarkers', 14, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MUTED_TEXT);
    analysis.clinical_indicators.forEach(item => {
      doc.text(`• ${item}`, 18, y);
      y += 5;
    });
    y += 4;
  }

  // Disclaimer
  if (y > 250) {
    doc.addPage();
    y = 20;
  }
  addDisclaimer(doc, y);

  doc.save(`MedIQ_Health_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}
