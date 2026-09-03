"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Brain, User, Smartphone, Heart, Loader2, CheckCircle, AlertCircle, Activity, Moon, BookOpen, Zap, FileDown } from "lucide-react";
import { generatePDF } from "@/components/ui/pdf-report";

interface FormData {
  // contact
  name: string;
  email: string;
  phone: string;
  // assessment — original 12
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
  // 4 new inputs
  mood_score: string;
  social_support: string;
  screen_before_bed: string;
  diet_quality: string;
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

const statusColors: Record<string, { bg: string; text: string; ring: string }> = {
  excellent: { bg: "bg-emerald-100", text: "text-emerald-800", ring: "stroke-emerald-500" },
  good:      { bg: "bg-orange-100",  text: "text-orange-800",  ring: "stroke-orange-500" },
  fair:      { bg: "bg-amber-100",   text: "text-amber-800",   ring: "stroke-amber-500" },
  poor:      { bg: "bg-red-100",     text: "text-red-800",     ring: "stroke-red-500" },
};

export function PredictionForm() {
  const [form, setForm] = useState<FormData>({
    name: "", email: "", phone: "",
    age: "18", gender: "Male", country: "India",
    academic_level: "Undergraduate", platform: "Instagram",
    purpose: "Entertainment", usage_hours: "3", daily_unlocks: "20",
    study_hours: "4", activity_hours: "1", sleep_hours: "7",
    stress_level: "Medium",
    mood_score: "6", social_support: "3",
    screen_before_bed: "1", diet_quality: "3",
  });

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to get prediction. Make sure the Flask server is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  const circumference = 2 * Math.PI * 45;
  const progressOffset = result
    ? circumference - (result.prediction / 10) * circumference
    : circumference;

  const colors = result ? (statusColors[result.status_class] ?? statusColors.poor) : null;

  return (
    <div id="predictor" className="w-full max-w-6xl mx-auto px-4 py-20">
      {/* Section header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-3">Mental Health Assessment</h2>
        <p className="text-gray-500 text-lg">Fill in your details to receive a personalised analysis</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Contact Info — local only, not sent to server */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100 mb-6">
          <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <User className="w-5 h-5 text-orange-500" /> Your Details
            <span className="ml-auto text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              Only used in your PDF — never stored
            </span>
          </h3>
          <p className="text-xs text-gray-400 mb-5">This information stays on your device and appears only in the downloaded report.</p>
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="Full Name" name="name" type="text" value={form.name} onChange={handleChange} required={false} />
            <Field label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} required={false} />
            <Field label="Phone Number" name="phone" type="tel" value={form.phone} onChange={handleChange} required={false} />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Personal Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100">
            <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
              <User className="w-5 h-5 text-orange-500" /> Personal Information
            </h3>
            <Field label="Age" name="age" type="number" min={10} max={35} value={form.age} onChange={handleChange} />
            <Select label="Gender" name="gender" value={form.gender} onChange={handleChange}
              options={["Male", "Female"]} />
            <Select label="Country" name="country" value={form.country} onChange={handleChange}
              options={["USA", "Canada", "UK", "India", "China", "Other"]} />
            <Select label="Academic Level" name="academic_level" value={form.academic_level} onChange={handleChange}
              options={["High School", "Undergraduate", "Graduate"]} />
          </div>

          {/* Social Media */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100">
            <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-amber-500" /> Social Media Usage
            </h3>
            <Select label="Most Used Platform" name="platform" value={form.platform} onChange={handleChange}
              options={["Facebook", "Instagram", "Twitter", "LinkedIn", "Snapchat", "TikTok", "YouTube", "WeChat"]} />
            <Select label="Primary Purpose" name="purpose" value={form.purpose} onChange={handleChange}
              options={["Education", "Entertainment", "Networking"]} />
            <Field label="Avg. Daily Usage (hrs)" name="usage_hours" type="number" min={0} max={24} step={0.5} value={form.usage_hours} onChange={handleChange} />
            <Field label="Daily Phone Unlocks" name="daily_unlocks" type="number" min={0} max={200} value={form.daily_unlocks} onChange={handleChange} />
          </div>

          {/* Lifestyle */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100">
            <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" /> Lifestyle &amp; Wellness
            </h3>
            <Field label="Study Hours / Day" name="study_hours" type="number" min={0} max={24} step={0.5} value={form.study_hours} onChange={handleChange} />
            <Field label="Physical Activity (hrs/day)" name="activity_hours" type="number" min={0} max={24} step={0.5} value={form.activity_hours} onChange={handleChange} />
            <Field label="Sleep Hours / Night" name="sleep_hours" type="number" min={0} max={24} step={0.5} value={form.sleep_hours} onChange={handleChange} />
            <Select label="Stress Level" name="stress_level" value={form.stress_level} onChange={handleChange}
              options={["Low", "Medium", "High", "Very High"]} />
          </div>

          {/* Wellbeing — 4 new inputs */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100 md:col-span-3">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" /> Wellbeing Indicators
              <span className="ml-2 text-xs font-normal text-gray-400 bg-amber-50 px-2 py-0.5 rounded-full">New — improves accuracy</span>
            </h3>
            <p className="text-xs text-gray-400 mb-5">These 4 factors significantly boost prediction accuracy.</p>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Mood <span className="text-gray-400">(1–10)</span>
                </label>
                <input type="range" name="mood_score" min={1} max={10} step={0.5}
                  value={form.mood_score} onChange={handleChange}
                  className="w-full accent-orange-500" />
                <div className="text-center font-bold text-orange-500 mt-1">{form.mood_score} / 10</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Social Support <span className="text-gray-400">(1–5)</span>
                </label>
                <input type="range" name="social_support" min={1} max={5} step={0.5}
                  value={form.social_support} onChange={handleChange}
                  className="w-full accent-orange-500" />
                <div className="text-center font-bold text-orange-500 mt-1">
                  {form.social_support} / 5
                  <div className="text-xs text-gray-400 font-normal">
                    {Number(form.social_support) >= 4 ? "Strong support" : Number(form.social_support) >= 2.5 ? "Moderate" : "Low support"}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Screen Before Bed <span className="text-gray-400">(hrs)</span>
                </label>
                <input type="range" name="screen_before_bed" min={0} max={4} step={0.5}
                  value={form.screen_before_bed} onChange={handleChange}
                  className="w-full accent-orange-500" />
                <div className="text-center font-bold text-orange-500 mt-1">
                  {form.screen_before_bed}h
                  <div className="text-xs text-gray-400 font-normal">
                    {Number(form.screen_before_bed) === 0 ? "Excellent" : Number(form.screen_before_bed) <= 1 ? "Acceptable" : "Too much"}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diet Quality <span className="text-gray-400">(1–5)</span>
                </label>
                <input type="range" name="diet_quality" min={1} max={5} step={0.5}
                  value={form.diet_quality} onChange={handleChange}
                  className="w-full accent-orange-500" />
                <div className="text-center font-bold text-orange-500 mt-1">
                  {form.diet_quality} / 5
                  <div className="text-xs text-gray-400 font-normal">
                    {Number(form.diet_quality) >= 4 ? "Healthy diet" : Number(form.diet_quality) >= 2.5 ? "Average" : "Poor diet"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg transition-all shadow-md hover:shadow-lg disabled:opacity-70"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Analysing…</>
          ) : (
            <><Brain className="w-5 h-5" /> Analyse Mental Health</>
          )}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="mt-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && colors && (
        <div className="mt-10 bg-white rounded-3xl shadow-lg border border-orange-100 p-8">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Your Mental Health Report</h3>

          {/* Score circle + badge */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" className="stroke-gray-200" strokeWidth="8" fill="none" />
                <circle
                  cx="50" cy="50" r="45"
                  className={colors.ring}
                  strokeWidth="8" fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={progressOffset}
                  style={{ transition: "stroke-dashoffset 1s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-gray-900">{result.prediction.toFixed(1)}</span>
                <span className="text-gray-400 text-sm">/ 10</span>
              </div>
            </div>
            <span className={cn("px-6 py-2 rounded-full font-semibold text-lg", colors.bg, colors.text)}>
              {result.status}
            </span>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 bg-orange-50 rounded-2xl p-5">
            <Stat icon={<Smartphone className="w-5 h-5 text-amber-500" />} label="Screen Time" value={`${result.input_summary.usage_hours}h`} />
            <Stat icon={<Moon className="w-5 h-5 text-orange-400" />} label="Sleep" value={`${result.input_summary.sleep_hours}h`} />
            <Stat icon={<BookOpen className="w-5 h-5 text-orange-500" />} label="Study" value={`${result.input_summary.study_hours}h`} />
            <Stat icon={<Activity className="w-5 h-5 text-emerald-500" />} label="Activity" value={`${result.input_summary.activity_hours}h`} />
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" /> Recommendations
            </h4>
            <ul className="space-y-3">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm leading-relaxed font-['Inter',sans-serif] tracking-normal">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Download PDF */}
          <button
            onClick={() => generatePDF(form, result)}
            className="mt-8 w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white font-semibold text-lg transition-all shadow-md hover:shadow-lg"
          >
            <FileDown className="w-5 h-5" />
            Download Full Report (PDF)
          </button>
        </div>
      )}
    </div>
  );
}

// ── helper components ───────────────────────────────────────────────────────
function Field({ label, name, type, min, max, step, value, onChange, required = true }: {
  label: string; name: string; type: string;
  min?: number; max?: number; step?: number;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        min={min} max={max} step={step}
        required={required}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
      />
    </div>
  );
}

function Select({ label, name, value, options, onChange }: {
  label: string; name: string; value: string;
  options: string[]; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        name={name} value={value} onChange={onChange} required
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition bg-white text-gray-800"
      >
        {options.map((o) =>
          o === "" ? (
            <option key="_blank" value="" disabled hidden></option>
          ) : (
            <option key={o} value={o}>{o}</option>
          )
        )}
      </select>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      {icon}
      <span className="text-xs text-gray-500">{label}</span>
      <span className="font-semibold text-gray-800">{value}</span>
    </div>
  );
}
