"use client";

import jsPDF from "jspdf";

interface FormData {
  name: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  country: string;
  academic_level: string;
  platform: string;
  purpose: string;
  usage_hours: string;
  daily_unlocks: string;
  study_hours: string;
  activity_hours: string;
  sleep_hours: string;
  stress_level: string;
}

interface PredictionResult {
  prediction: number;
  status: string;
  status_class: string;
  recommendations: string[];
  input_summary: {
    usage_hours: number;
    sleep_hours: number;
    study_hours: number;
    activity_hours: number;
  };
}

const STATUS_COLORS: Record<string, [number, number, number]> = {
  excellent: [16, 185, 129],
  good:      [249, 115, 22],
  fair:      [245, 158, 11],
  poor:      [239, 68, 68],
};

const IMPROVEMENT_TIPS: Record<string, string[]> = {
  excellent: [
    "Maintain your current healthy routine — consistency is key.",
    "Continue limiting social media to under 3 hours daily.",
    "Keep up regular physical activity (1–2 hrs/day).",
    "Stay socially connected with positive relationships.",
    "Schedule regular digital detox periods (1 day/week).",
  ],
  good: [
    "Reduce daily social media usage to under 4 hours.",
    "Aim for 7–8 hours of quality sleep every night.",
    "Add 30 minutes of exercise to your daily routine.",
    "Practice 10-minute daily mindfulness or deep breathing.",
    "Set phone-free hours during meals and study sessions.",
    "Connect with friends or join a campus wellness group.",
  ],
  fair: [
    "Immediately cut social media to under 3 hours per day.",
    "Set a strict bedtime — prioritise 8 hours of sleep.",
    "Walk or exercise for at least 45 minutes every day.",
    "Try journaling your thoughts for 10 minutes each morning.",
    "Speak with a trusted friend, teacher, or counsellor.",
    "Avoid screens 1 hour before bedtime.",
    "Consider a structured study schedule to reduce academic stress.",
  ],
  poor: [
    "Please reach out to a mental health professional immediately.",
    "Crisis Helpline (India): iCall — 9152987821",
    "Crisis Helpline (US): 988 Suicide & Crisis Lifeline — call 988",
    "Limit social media to under 1 hour per day.",
    "Sleep is critical — aim for 8–9 hours with a fixed schedule.",
    "Ask a family member or friend to support your wellness journey.",
    "Take short outdoor walks — even 15 minutes helps.",
    "Avoid caffeine and screens after 8 PM.",
    "Try guided meditation apps (Headspace, Calm).",
  ],
};

function wrapText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

export function generatePDF(form: FormData, result: PredictionResult): void {
  // Strip emojis and non-latin characters jsPDF can't render
  const clean = (s: string) =>
    s.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "").replace(/^\s+/, "").trim();

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const margin = 18;
  const contentW = W - margin * 2;
  let y = 0;

  const accent: [number, number, number] = STATUS_COLORS[result.status_class] ?? [249, 115, 22];

  // ── Header bar ─────────────────────────────────────────────────────────────
  doc.setFillColor(...accent);
  doc.rect(0, 0, W, 38, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Mental Health Assessment Report", W / 2, 13, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleString()}`, W / 2, 21, { align: "center" });

  // Name / email / phone on header
  const contactParts: string[] = [];
  if (form.name)  contactParts.push(form.name);
  if (form.email) contactParts.push(form.email);
  if (form.phone) contactParts.push(form.phone);
  if (contactParts.length > 0) {
    doc.text(contactParts.join("   |   "), W / 2, 28, { align: "center" });
  }
  doc.text("For educational purposes only — not a substitute for professional advice.", W / 2, 35, { align: "center" });

  y = 46;

  // ── Score box ──────────────────────────────────────────────────────────────
  doc.setFillColor(255, 247, 237);
  doc.roundedRect(margin, y, contentW, 28, 4, 4, "F");
  doc.setTextColor(...accent);
  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.text(result.prediction.toFixed(1), margin + 22, y + 19, { align: "center" });
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text("/ 10", margin + 32, y + 19);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...accent);
  doc.text(result.status, margin + 60, y + 13);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);

  const scoreDesc: Record<string, string> = {
    excellent: "Your mental wellness is in great shape. Keep it up!",
    good:      "Good overall wellness with room to improve.",
    fair:      "Moderate stress signals detected. Action recommended.",
    poor:      "Significant mental health concerns. Please seek support.",
  };
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(scoreDesc[result.status_class] ?? "", margin + 60, y + 21);

  y += 36;

  // ── Section helper ──────────────────────────────────────────────────────────
  const sectionTitle = (title: string) => {
    doc.setFillColor(...accent);
    doc.rect(margin, y, contentW, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin + 3, y + 5.5);
    y += 12;
    doc.setTextColor(40, 40, 40);
  };

  // ── Personal Details ───────────────────────────────────────────────────────
  sectionTitle("PERSONAL DETAILS");
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  const details: [string, string][] = [
    ["Name",           form.name  || "—"],
    ["Email",          form.email || "—"],
    ["Phone",          form.phone || "—"],
    ["Age",            form.age],
    ["Gender",         form.gender],
    ["Country",        form.country],
    ["Academic Level", form.academic_level],
  ];

  details.forEach(([label, value], i) => {
    const col = i % 2 === 0 ? margin : margin + contentW / 2;
    const row = y + Math.floor(i / 2) * 7;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    doc.text(`${label}:`, col, row);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    doc.text(value, col + 36, row);
  });

  y += Math.ceil(details.length / 2) * 7 + 4;

  // ── Lifestyle Summary ──────────────────────────────────────────────────────
  sectionTitle("LIFESTYLE SUMMARY");

  const lifestyle = [
    ["Most Used Platform",    form.platform],
    ["Primary Purpose",       form.purpose],
    ["Avg Daily Usage",       `${form.usage_hours} hours`],
    ["Daily Phone Unlocks",   form.daily_unlocks],
    ["Study Hours / Day",     `${form.study_hours} hours`],
    ["Physical Activity",     `${form.activity_hours} hours/day`],
    ["Sleep Hours / Night",   `${form.sleep_hours} hours`],
    ["Stress Level",          form.stress_level],
  ];

  lifestyle.forEach(([label, value], i) => {
    const col = i % 2 === 0 ? margin : margin + contentW / 2;
    const row = y + Math.floor(i / 2) * 7;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    doc.text(`${label}:`, col, row);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    doc.text(value, col + 40, row);
  });

  y += Math.ceil(lifestyle.length / 2) * 7 + 6;

  // ── Model Recommendations ──────────────────────────────────────────────────
  sectionTitle("RECOMMENDATIONS FROM AI MODEL");
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  result.recommendations.forEach((rec) => {
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFillColor(...accent);
    doc.circle(margin + 2, y - 1.5, 1.5, "F");
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    y = wrapText(doc, clean(rec), margin + 7, y, contentW - 7, 6);
    y += 3;
  });

  y += 4;

  // ── Improvement Tips ──────────────────────────────────────────────────────
  if (y > 240) { doc.addPage(); y = 20; }
  sectionTitle("HOW TO IMPROVE YOUR MENTAL HEALTH");
  doc.setFontSize(10);

  const tips = IMPROVEMENT_TIPS[result.status_class] ?? IMPROVEMENT_TIPS.fair;
  tips.forEach((tip, i) => {
    if (y > 265) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...accent);
    doc.text(`${i + 1}.`, margin + 1, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    y = wrapText(doc, clean(tip), margin + 8, y, contentW - 8, 6);
    y += 3;
  });

  // ── Resources ─────────────────────────────────────────────────────────────
  y += 4;
  if (y > 255) { doc.addPage(); y = 20; }
  sectionTitle("MENTAL HEALTH RESOURCES");
  doc.setFontSize(9);

  const resources = [
    "iCall (India): 9152987821 | Mon–Sat 8am–10pm",
    "AASRA (India): 9820466627 | 24/7",
    "988 Suicide & Crisis Lifeline (US): Call or text 988",
    "Crisis Text Line (US): Text HOME to 741741",
    "Vandrevala Foundation (India): 1860-2662-345 | 24/7",
  ];

  resources.forEach((r) => {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text(`• ${r}`, margin + 3, y);
    y += 6;
  });

  // ── Footer ────────────────────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 285, W, 12, "F");
    doc.setFontSize(7.5);
    doc.setTextColor(150, 150, 150);
    doc.text("Mental Health Predictor — AI-powered, for educational use only.", margin, 291);
    doc.text(`Page ${p} of ${pageCount}`, W - margin, 291, { align: "right" });
  }

  doc.save(`Mental_Health_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}
