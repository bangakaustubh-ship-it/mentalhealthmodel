import { GradientBackgrounds } from "@/components/ui/gradient-backgrounds";
import { PredictionForm } from "@/components/ui/prediction-form";
import { Brain } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-white">
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <GradientBackgrounds variant="orange" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-orange-100/60 backdrop-blur-sm text-orange-900 text-sm font-medium px-4 py-2 rounded-full mb-8 border border-orange-200/50">
            <Brain className="w-4 h-4" />
            AI-Powered Wellness Analysis
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Understand Your<br />
            <span className="text-orange-500">Mental Wellness</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Get a personalised mental health score based on your social media usage,
            sleep, study habits, and more — powered by ML trained on 5,000+ students.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#predictor"
              className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Brain className="w-5 h-5" />
              Start Assessment
            </a>
            <a
              href="#about"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/70 hover:bg-white text-gray-700 font-semibold rounded-full text-lg transition-all border border-orange-200 hover:shadow-md"
            >
              Learn More
            </a>
          </div>

        </div>
      </section>

      {/* ── PREDICTOR FORM ───────────────────────────────────────────────── */}
      <section className="bg-orange-50/40">
        <PredictionForm />
      </section>

      {/* ── ABOUT ────────────────────────────────────────────────────────── */}
      <section id="about" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">How It Works</h2>
          <p className="text-center text-gray-500 mb-14 text-lg">
            A regression model trained on real student data
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "📊",
                color: "from-orange-50",
                title: "5,000+ Data Points",
                desc: "Trained on comprehensive student data covering lifestyle, social media, and wellness factors.",
              },
              {
                icon: "🎯",
                color: "from-amber-50",
                title: "85% Accuracy",
                desc: "R² score of 0.85, MAE of 0.42 — reliable predictions you can act on.",
              },
              {
                icon: "🔒",
                color: "from-yellow-50",
                title: "Private & Local",
                desc: "All predictions run on your machine. No data is stored or sent to third parties.",
              },
            ].map((c) => (
              <div
                key={c.title}
                className={`bg-gradient-to-b ${c.color} to-white rounded-2xl p-8 shadow-sm border border-orange-100 text-center`}
              >
                <div className="text-5xl mb-4">{c.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{c.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 py-10 px-4 text-center">
        <p className="text-gray-400 mb-2 text-sm">
          ⚠️ For educational purposes only — not a substitute for professional medical advice.
        </p>
        <p className="text-gray-500 text-xs mb-4">
          If you&apos;re struggling, reach out: <span className="text-white">988 Suicide &amp; Crisis Lifeline</span> · <span className="text-white">988</span>
        </p>
        <p className="text-orange-400 text-sm">Built with ❤️ for student mental wellness</p>
      </footer>
    </div>
  );
}
