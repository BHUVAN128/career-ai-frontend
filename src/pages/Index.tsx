import { ArrowRight, Sparkles, BookOpen, BarChart3, Target, Brain, Zap, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  { icon: Brain, title: "AI-Powered Roadmaps", description: "Personalized learning paths that adapt to your skill level and pace." },
  { icon: Target, title: "Adaptive Assessments", description: "Smart quizzes that identify gaps and adjust your journey dynamically." },
  { icon: BarChart3, title: "Progress Analytics", description: "Deep insights into your growth with weekly performance reports." },
  { icon: Zap, title: "Streak Motivation", description: "Stay consistent with streak tracking and achievement badges." },
  { icon: BookOpen, title: "Multi-Format Learning", description: "Videos, docs, coding challenges, and projects — all in one place." },
  { icon: Users, title: "AI Mentor Chat", description: "Context-aware doubt resolution with your personal AI mentor." },
];

const steps = [
  { num: "01", title: "Take the Assessment", description: "Quick skill diagnosis to understand where you stand." },
  { num: "02", title: "Get Your Roadmap", description: "AI generates a personalized learning path just for you." },
  { num: "03", title: "Learn & Practice", description: "Complete steps, build projects, and grow your skills." },
  { num: "04", title: "Track & Achieve", description: "Monitor progress, earn badges, and build your portfolio." },
];

const testimonials = [
  { name: "Sarah K.", role: "Frontend Developer", quote: "Career AI helped me go from junior to mid-level in 4 months. The adaptive roadmap is genius." },
  { name: "Marcus T.", role: "Career Switcher", quote: "Coming from marketing, the structured learning path made the tech transition feel achievable." },
  { name: "Priya R.", role: "CS Student", quote: "The AI mentor understood my exact gaps. Way better than randomly picking Udemy courses." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 glass-panel rounded-none border-t-0 border-x-0 flex items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">Career AI</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Log in
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="absolute inset-0 z-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Career Growth
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
              Build Your Career with{" "}
              <span className="gradient-text">AI-Guided Precision</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Personalized roadmaps. Real practice. Real growth. Let AI analyze your skills and craft the perfect learning journey.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link to="/dashboard">
                <Button size="lg" className="h-12 px-8 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold text-base glow-primary">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="h-12 px-8 rounded-xl border-border text-foreground">
                See How It Works
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Four simple steps to accelerate your career</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="glass-panel p-6 hover-lift relative group"
              >
                <span className="text-4xl font-extrabold gradient-text opacity-30 group-hover:opacity-60 transition-opacity">
                  {step.num}
                </span>
                <h3 className="text-lg font-semibold mt-2 mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Everything You Need</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">A complete learning ecosystem built for real-world results</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="glass-panel p-6 hover-lift"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Loved by Learners</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="glass-panel p-6 space-y-4"
              >
                <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.quote}"</p>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel p-10 md:p-14 glow-primary space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ready to{" "}
              <span className="gradient-text">Level Up?</span>
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Join thousands of learners building their careers with AI-powered guidance.
            </p>
            <Link to="/dashboard">
              <Button size="lg" className="h-12 px-8 rounded-xl bg-gradient-to-r from-primary to-accent text-accent-foreground font-semibold text-base mt-2">
                Start Free Today <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">Career AI</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Career AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
