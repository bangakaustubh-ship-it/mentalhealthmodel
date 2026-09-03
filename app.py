from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
from datetime import datetime

app = Flask(__name__)
CORS(app)
app.config['JSON_SORT_KEYS'] = False

# ── Load model bundle ─────────────────────────────────────────────────────────
model = None
encoders = {}
feature_cols = []

try:
    with open('Mental_Health_Model.pkl', 'rb') as f:
        bundle = pickle.load(f)
    model        = bundle['model']
    encoders     = bundle['encoders']
    feature_cols = bundle['feature_cols']
    print(f"Model loaded. Metrics: {bundle.get('metrics', {})}")
except Exception as e:
    print(f"Error loading model: {e}")


# ── Specific recommendation engine ───────────────────────────────────────────
def build_specific_recommendations(raw: dict, score: float) -> list[str]:
    recs = []
    u     = raw['usage_hours']
    s     = raw['sleep_hours']
    a     = raw['activity_hours']
    st    = raw['study_hours']
    un    = raw['daily_unlocks']
    stress = raw['stress_level']
    purpose = raw['purpose']
    mood  = raw.get('mood_score', 6)
    sup   = raw.get('social_support', 3)
    scrn  = raw.get('screen_before_bed', 1)
    diet  = raw.get('diet_quality', 3)

    # Sleep
    if s < 5:
        recs.append(f"🚨 CRITICAL — Only {s}h sleep. Under 5h severely damages mood & cognition. Set a fixed bedtime tonight and target 7+ hours within one week.")
    elif s < 6.5:
        recs.append(f"😴 Sleep deficit: {s}h vs recommended 7–9h. Even 1 extra hour can lift your score. Try no caffeine after 2 PM and a 10-minute wind-down routine.")

    # Screen vs sleep
    if u > s:
        recs.append(f"📱 You spend more time on social media ({u}h) than sleeping ({s}h). Flip this — sleep must win.")

    # Usage
    if u > 6:
        recs.append(f"📵 {u}h daily social media is very high. Use Screen Time / Digital Wellbeing to cap it at 2–3h. Each hour reduced above 4h improves score by ~0.4 points.")
    elif u > 4:
        recs.append(f"⏱️ {u}h usage is above healthy threshold (3h). Try phone-free meals and no social media after 9 PM.")

    # Activity
    if a < 0.5:
        recs.append(f"🏃 Almost no physical activity ({a}h). 30 min brisk walk daily reduces cortisol by ~26% and improves sleep quality. Start tomorrow morning.")
    elif a < 1.0:
        recs.append(f"💪 Increase from {a}h to 1.5h daily activity. A 20-minute evening walk or home workout routine works well.")

    # Stress
    if stress in ['High', 'Very High']:
        recs.append(f"🧘 Stress level '{stress}' is amplifying every other negative factor. Practice 4-7-8 breathing daily and consider weekly counselling sessions.")

    # Phone unlocks
    if un > 80:
        recs.append(f"🔔 {un} unlocks/day = checking phone every ~{round(16*60/max(un,1))} minutes. Turn off non-essential notifications and use app timers.")
    elif un > 50:
        recs.append(f"📲 {un} daily unlocks fragments concentration. Enable 'Do Not Disturb' during study blocks.")

    # Study
    if st < 2:
        recs.append(f"📚 Only {st}h study/day. Use Pomodoro (25 min focus + 5 min break) to rebuild academic routine without burnout.")

    # Mood
    if mood < 4:
        recs.append(f"😔 Your current mood is low ({mood}/10). Try 3 things: get sunlight for 15 min in the morning, write down 3 things you're grateful for, and talk to a friend today.")
    elif mood < 6:
        recs.append(f"😐 Mood at {mood}/10 — moderate. Regular exercise and consistent sleep will naturally elevate this within 2 weeks.")

    # Social support
    if sup < 2.5:
        recs.append(f"🤝 Low social support ({sup}/5) is a significant risk factor. Reach out to one friend or family member today. Consider joining a campus club or support group.")
    elif sup < 3.5:
        recs.append(f"👥 Moderate social support ({sup}/5). Try to deepen 1–2 close relationships — quality over quantity matters more for mental health.")

    # Screen before bed
    if scrn > 2:
        recs.append(f"🌙 {scrn}h of screen use before bed disrupts melatonin production and reduces sleep quality. Switch to a book, podcast, or light stretching in the last hour before sleep.")
    elif scrn > 1:
        recs.append(f"📺 Reduce pre-bed screen time from {scrn}h to under 30 minutes. Blue-light glasses or night mode help if unavoidable.")

    # Diet
    if diet < 2.5:
        recs.append(f"🥗 Poor diet quality ({diet}/5) directly impacts energy, focus, and mood via the gut-brain axis. Add vegetables, reduce processed food, and eat 3 regular meals daily.")
    elif diet < 3.5:
        recs.append(f"🍎 Average diet ({diet}/5). Small upgrades make a big difference — try adding one fruit/veg serving per meal and reducing sugary drinks.")

    # Entertainment-heavy usage
    if purpose == 'Entertainment' and u > 3:
        recs.append(f"🎭 Heavy entertainment-based usage ({u}h/day) is linked to passive consumption and comparison anxiety. Replace 1 hour with a creative hobby.")

    # Score-level closing advice
    if score >= 7.5:
        recs.append("✅ Excellent score! Maintain your routine, do a weekly digital detox, and support peers who may be struggling.")
    elif score >= 6.0:
        recs.append("👍 Good score. Addressing the 2–3 specific issues above will push you toward excellent within weeks.")
    elif score >= 5.0:
        recs.append("⚠️ Moderate concerns. Pick the top issue above and fix it this week. Small wins compound fast.")
    else:
        recs.append("🆘 Significant strain detected. Please reach out today — iCall: 9152987821 | AASRA: 9820466627 | Vandrevala Foundation: 1860-2662-345 (24/7).")

    return recs


# ── Preprocessing ─────────────────────────────────────────────────────────────
def preprocess_input(data: dict) -> dict:
    row = {
        'Age':                    float(data['age']),
        'Gender':                 data.get('gender', 'Male'),
        'Country':                data.get('country', 'Other'),
        'Academic_Level':         data.get('academic_level', 'Undergraduate'),
        'Most_Used_Platform':     data.get('platform', 'Instagram'),
        'Purpose_Of_Use':         data.get('purpose', 'Entertainment'),
        'Avg_Daily_Usage_Hours':  float(data['usage_hours']),
        'Daily_Unlocks':          int(data['daily_unlocks']),
        'Study_Hours':            float(data['study_hours']),
        'Physical_Activity_Hours': float(data['activity_hours']),
        'Sleep_Hours_Per_Night':  float(data['sleep_hours']),
        'Stress_Level':           data.get('stress_level', 'Medium'),
        # 4 new inputs
        'Mood_Score':             float(data.get('mood_score', 6)),
        'Social_Support_Score':   float(data.get('social_support', 3)),
        'Screen_Before_Bed_Hours': float(data.get('screen_before_bed', 1)),
        'Diet_Quality_Score':     float(data.get('diet_quality', 3)),
    }

    # Label-encode categoricals
    for col in ['Gender', 'Country', 'Academic_Level', 'Most_Used_Platform',
                'Purpose_Of_Use', 'Stress_Level']:
        le = encoders.get(col)
        if le:
            val = row[col]
            row[col] = int(le.transform([val])[0]) if val in le.classes_ else 0

    # Engineered features — names match the loaded model's feature_cols exactly
    eps = 0.1
    u  = row['Avg_Daily_Usage_Hours']
    s  = row['Sleep_Hours_Per_Night']
    st = row['Study_Hours']
    a  = row['Physical_Activity_Hours']
    sl = row['Stress_Level']
    un = row['Daily_Unlocks']

    row['usage_to_sleep_ratio']   = min(10, u / (s + eps))
    row['study_to_usage_ratio']   = min(10, st / (u + eps))
    row['active_hours_total']     = min(20, st + a)
    row['screen_sleep_balance']   = max(-10, min(10, s - u))
    row['unlocks_per_usage_hour'] = min(200, un / (u + eps))
    row['stress_x_usage']         = min(100, sl * u)
    row['stress_x_sleep_deficit'] = min(30, sl * max(0, 8 - s))
    row['activity_x_sleep']       = min(100, a * s)
    row['sleep_squared']          = min(100, s ** 2)
    row['usage_squared']          = min(100, u ** 2)

    return row


# ── Routes ────────────────────────────────────────────────────────────────────
@app.route('/')
def home():
    return jsonify({'status': 'Mental Health Predictor API', 'model_loaded': model is not None})


@app.route('/predict', methods=['POST'])
def predict():
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded.'}), 500

        data = request.json
        processed = preprocess_input(data)
        feature_df = pd.DataFrame([processed])[feature_cols]

        raw_pred = float(model.predict(feature_df)[0])
        prediction = round(float(np.clip(raw_pred, 1.0, 10.0)), 2)

        # Status
        if prediction >= 7.5:
            status, status_class = "Excellent", "excellent"
        elif prediction >= 6.0:
            status, status_class = "Good", "good"
        elif prediction >= 5.0:
            status, status_class = "Fair", "fair"
        else:
            status, status_class = "Needs Attention", "poor"

        # Build specific recommendations from raw user values
        raw_for_recs = {
            'usage_hours':       float(data['usage_hours']),
            'sleep_hours':       float(data['sleep_hours']),
            'activity_hours':    float(data['activity_hours']),
            'study_hours':       float(data['study_hours']),
            'daily_unlocks':     int(data['daily_unlocks']),
            'stress_level':      data.get('stress_level', 'Medium'),
            'purpose':           data.get('purpose', 'Entertainment'),
            'mood_score':        float(data.get('mood_score', 6)),
            'social_support':    float(data.get('social_support', 3)),
            'screen_before_bed': float(data.get('screen_before_bed', 1)),
            'diet_quality':      float(data.get('diet_quality', 3)),
        }
        recommendations = build_specific_recommendations(raw_for_recs, prediction)

        return jsonify({
            'prediction':   prediction,
            'status':       status,
            'status_class': status_class,
            'recommendations': recommendations,
            'input_summary': {
                'usage_hours':    raw_for_recs['usage_hours'],
                'sleep_hours':    raw_for_recs['sleep_hours'],
                'study_hours':    raw_for_recs['study_hours'],
                'activity_hours': raw_for_recs['activity_hours'],
            }
        })

    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 400


@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'metrics': bundle.get('metrics', {}) if model else {},
        'timestamp': datetime.now().isoformat()
    })


@app.route('/api/stats')
def get_stats():
    metrics = bundle.get('metrics', {}) if model else {}
    return jsonify({
        'model_type':   'Stacking Ensemble (XGBoost + LightGBM + GBM + RF → Ridge)',
        'features':     len(feature_cols),
        'dataset_size': '5000 students',
        'metrics':      metrics,
    })


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
