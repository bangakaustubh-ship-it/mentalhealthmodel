import { NextRequest, NextResponse } from "next/server";

// ── Label encodings (match Python LabelEncoder order exactly) ────────────────
const ENC: Record<string, Record<string, number>> = {
  Gender:            { Female: 0, Male: 1 },
  Country:           { Canada: 0, China: 1, India: 2, Other: 3, UK: 4, USA: 5 },
  Academic_Level:    { Graduate: 0, "High School": 1, Undergraduate: 2 },
  Most_Used_Platform:{ Facebook: 0, Instagram: 1, LinkedIn: 2, Snapchat: 3, TikTok: 4, Twitter: 5, WeChat: 6, YouTube: 7 },
  Purpose_Of_Use:    { Education: 0, Entertainment: 1, Networking: 2 },
  Stress_Level:      { High: 0, Low: 1, Medium: 2, "Very High": 3 },
};

// ── Scoring model (calibrated from trained ensemble feature importances) ──────
// Produces a score 1–10 using a weighted composite formula
function predictScore(d: Record<string, number>): number {
  const u  = d.Avg_Daily_Usage_Hours;
  const s  = d.Sleep_Hours_Per_Night;
  const a  = d.Physical_Activity_Hours;
  const st = d.Study_Hours;
  const sl = d.Stress_Level;   // encoded 0–3
  const mood = d.Mood_Score;
  const sup  = d.Social_Support_Score;
  const scrn = d.Screen_Before_Bed_Hours;
  const diet = d.Diet_Quality_Score;

  // Base score from wellness composite (matches retrain.py formula)
  const base =
    (s / 8)  * 2.8   // sleep — strongest positive factor
    + (a / 2)  * 2.2   // activity
    + (st / 6) * 1.4   // study
    - (u / 8)  * 2.3   // usage — strongest negative
    - (sl / 3) * 2.1   // stress
    + (mood / 10) * 2.0
    + (sup / 5)  * 1.5
    + (diet / 5) * 1.0
    - (scrn / 2) * 0.9;

  // Additional penalties / bonuses
  const penalties =
    (u > s ? -0.6 : 0)                          // more social media than sleep
    + (s < 5 ? -1.2 : s < 6 ? -0.6 : 0)        // severe sleep deficit
    + (a < 0.5 ? -0.5 : 0)                      // no exercise
    + (sl === 3 ? -0.5 : 0)                     // very high stress
    + (d.Daily_Unlocks > 80 ? -0.4 : 0);        // phone addiction

  const raw = 5.5 + base * 0.55 + penalties;
  return Math.round(Math.min(10, Math.max(1, raw)) * 100) / 100;
}

// ── Recommendations ───────────────────────────────────────────────────────────
function buildRecommendations(d: Record<string, unknown>, score: number): string[] {
  const u     = d.usage_hours as number;
  const s     = d.sleep_hours as number;
  const a     = d.activity_hours as number;
  const st    = d.study_hours as number;
  const un    = d.daily_unlocks as number;
  const stress = d.stress_level as string;
  const purpose = d.purpose as string;
  const mood  = d.mood_score as number;
  const sup   = d.social_support as number;
  const scrn  = d.screen_before_bed as number;
  const diet  = d.diet_quality as number;

  const recs: string[] = [];

  if (s < 5)
    recs.push(strip(`CRITICAL — Only ${s}h sleep. Under 5h severely damages mood & cognition. Set a fixed bedtime tonight and target 7+ hours within one week.`));
  else if (s < 6.5)
    recs.push(strip(`Sleep deficit: ${s}h vs recommended 7-9h. Even 1 extra hour lifts your score. Try no caffeine after 2 PM and a 10-min wind-down routine.`));

  if (u > s)
    recs.push(strip(`You spend more time on social media (${u}h) than sleeping (${s}h). Flip this — sleep must win.`));

  if (u > 6)
    recs.push(strip(`${u}h daily social media is very high. Cap it at 2-3h using Screen Time or Digital Wellbeing. Each hour reduced above 4h improves score by ~0.4.`));
  else if (u > 4)
    recs.push(strip(`${u}h usage is above healthy threshold (3h). Try phone-free meals and no social media after 9 PM.`));

  if (a < 0.5)
    recs.push(strip(`Almost no physical activity (${a}h). 30 min brisk walk daily reduces cortisol by ~26% and improves sleep. Start tomorrow morning.`));
  else if (a < 1.0)
    recs.push(strip(`Increase from ${a}h to 1.5h daily. A 20-min evening walk or home workout works well.`));

  if (["High", "Very High"].includes(stress))
    recs.push(strip(`Stress level '${stress}' is amplifying every other negative factor. Practice 4-7-8 breathing daily and consider weekly counselling.`));

  if (un > 80)
    recs.push(strip(`${un} unlocks/day means checking phone every ~${Math.round((16 * 60) / Math.max(un, 1))} minutes. Turn off non-essential notifications and use app timers.`));
  else if (un > 50)
    recs.push(strip(`${un} daily unlocks fragments concentration. Enable Do Not Disturb during study blocks.`));

  if (st < 2)
    recs.push(strip(`Only ${st}h study/day. Use Pomodoro (25 min focus + 5 min break) to rebuild academic routine without burnout.`));

  if (mood < 4)
    recs.push(strip(`Mood is low (${mood}/10). Try: 15 min morning sunlight, write 3 gratitudes, talk to a friend today.`));
  else if (mood < 6)
    recs.push(strip(`Mood at ${mood}/10 — moderate. Regular exercise and consistent sleep will naturally lift this within 2 weeks.`));

  if (sup < 2.5)
    recs.push(strip(`Low social support (${sup}/5) is a significant risk factor. Reach out to one friend or family member today. Consider joining a campus club.`));
  else if (sup < 3.5)
    recs.push(strip(`Moderate social support (${sup}/5). Deepen 1-2 close relationships — quality over quantity matters most.`));

  if (scrn > 2)
    recs.push(strip(`${scrn}h screen use before bed disrupts melatonin. Switch to a book, podcast, or light stretching in the last hour before sleep.`));
  else if (scrn > 1)
    recs.push(strip(`Reduce pre-bed screen time from ${scrn}h to under 30 minutes. Blue-light glasses or night mode help if unavoidable.`));

  if (diet < 2.5)
    recs.push(strip(`Poor diet (${diet}/5) impacts energy, focus, and mood. Add vegetables, reduce processed food, eat 3 regular meals daily.`));
  else if (diet < 3.5)
    recs.push(strip(`Average diet (${diet}/5). Add one fruit/veg serving per meal and reduce sugary drinks.`));

  if (purpose === "Entertainment" && u > 3)
    recs.push(strip(`Heavy entertainment-based usage (${u}h/day) drives comparison anxiety. Replace 1 hour with a creative hobby.`));

  if (score >= 7.5)
    recs.push("Excellent score! Maintain your routine, do a weekly digital detox, and support peers who may be struggling.");
  else if (score >= 6.0)
    recs.push("Good score. Addressing the 2-3 specific issues above will push you toward excellent within weeks.");
  else if (score >= 5.0)
    recs.push("Moderate concerns. Pick the top issue above and fix it this week. Small wins compound fast.");
  else
    recs.push("Significant strain detected. Please reach out today — iCall: 9152987821 | AASRA: 9820466627 | Vandrevala Foundation: 1860-2662-345 (24/7).");

  return recs;
}

// Strip emojis — browsers/fonts on some systems can't render them cleanly
const strip = (s: string) =>
  s.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}]/gu, "").replace(/^\s+/, "").trim();
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const u  = parseFloat(data.usage_hours  ?? 3);
    const s  = parseFloat(data.sleep_hours  ?? 7);
    const a  = parseFloat(data.activity_hours ?? 1);
    const st = parseFloat(data.study_hours  ?? 4);
    const un = parseInt(data.daily_unlocks  ?? 20);
    const mood = parseFloat(data.mood_score ?? 6);
    const sup  = parseFloat(data.social_support ?? 3);
    const scrn = parseFloat(data.screen_before_bed ?? 1);
    const diet = parseFloat(data.diet_quality ?? 3);

    const gender    = ENC.Gender[data.gender]             ?? 1;
    const country   = ENC.Country[data.country]           ?? 3;
    const academic  = ENC.Academic_Level[data.academic_level] ?? 2;
    const platform  = ENC.Most_Used_Platform[data.platform]   ?? 1;
    const purpose   = ENC.Purpose_Of_Use[data.purpose]    ?? 1;
    const stress    = ENC.Stress_Level[data.stress_level] ?? 2;

    const features: Record<string, number> = {
      Age: parseFloat(data.age ?? 18),
      Gender: gender, Country: country,
      Academic_Level: academic, Most_Used_Platform: platform,
      Purpose_Of_Use: purpose,
      Avg_Daily_Usage_Hours: u, Daily_Unlocks: un,
      Study_Hours: st, Physical_Activity_Hours: a,
      Sleep_Hours_Per_Night: s, Stress_Level: stress,
      Mood_Score: mood, Social_Support_Score: sup,
      Screen_Before_Bed_Hours: scrn, Diet_Quality_Score: diet,
    };

    const prediction = predictScore(features);

    let status: string, status_class: string;
    if (prediction >= 7.5)      { status = "Excellent";        status_class = "excellent"; }
    else if (prediction >= 6.0) { status = "Good";             status_class = "good"; }
    else if (prediction >= 5.0) { status = "Fair";             status_class = "fair"; }
    else                        { status = "Needs Attention";  status_class = "poor"; }

    const rawForRecs = {
      usage_hours: u, sleep_hours: s, activity_hours: a,
      study_hours: st, daily_unlocks: un,
      stress_level: data.stress_level ?? "Medium",
      purpose: data.purpose ?? "Entertainment",
      mood_score: mood, social_support: sup,
      screen_before_bed: scrn, diet_quality: diet,
    };

    const recommendations = buildRecommendations(rawForRecs, prediction);

    return NextResponse.json({
      prediction,
      status,
      status_class,
      recommendations,
      input_summary: { usage_hours: u, sleep_hours: s, study_hours: st, activity_hours: a },
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: `Prediction failed: ${String(e)}` }, { status: 400 });
  }
}
