"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  GripVertical, 
  BarChart3, 
  Share2, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Terminal,
  Zap,
  Lock,
  Layers,
  FileCheck,
  Send
} from "lucide-react";

export default function Home() {
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const samplePrompts = [
    {
      label: "Tech Feedback",
      prompt: "Create a 4-question software feedback form with rating and feature request text box.",
      fields: [
        { type: "Rating", text: "How would you rate the overall performance?" },
        { type: "Text", text: "What feature would you like to see next?" },
        { type: "Checkbox", text: "Would you recommend ReadyForms to a colleague?" }
      ]
    },
    {
      label: "Event Registration",
      prompt: "Event sign-up form asking for participant name, dietary preference, and workshop choices.",
      fields: [
        { type: "Short Text", text: "Full Name & Organization" },
        { type: "Choice", text: "Select your primary workshop session" },
        { type: "Checkbox", text: "Do you require dietary accommodations?" }
      ]
    },
    {
      label: "Customer Survey",
      prompt: "Customer satisfaction survey with net promoter score and service review questions.",
      fields: [
        { type: "Number", text: "On a scale of 1-10, how satisfied are you?" },
        { type: "Text", text: "What can we improve about our support?" },
        { type: "Checkbox", text: "May we contact you regarding your review?" }
      ]
    }
  ];

  const currentSample = samplePrompts[activePromptIndex];

  return (
    <div className="bg-white dark:bg-black text-black dark:text-white min-h-screen transition-colors duration-300 overflow-x-hidden">
      {/* Background Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2"
            >
              <Badge variant="outline" className="px-4 py-1.5 text-xs font-mono uppercase tracking-wider border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-full shadow-sm">
                <Sparkles className="h-3.5 w-3.5 mr-1.5 text-black dark:text-white animate-pulse" />
                Next-Gen AI Form Engineering
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-extrabold text-5xl sm:text-7xl lg:text-8xl tracking-tight text-black dark:text-white leading-[1.05]"
            >
              Build Enterprise Forms <br />
              <span className="text-neutral-500 dark:text-neutral-400 font-serif italic">In Seconds with AI.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed"
            >
              Transform plain text prompts into full-featured interactive forms with smart field types, role-based private access, and real-time response analytics.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Button asChild size="lg" className="w-full sm:w-auto px-8 h-13 rounded-xl bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-bold shadow-lg transition-all">
                <Link href="/templates/create">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create Form with AI
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto px-8 h-13 rounded-xl border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold transition-all">
                <Link href="/templates">
                  Explore Templates
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Interactive Live AI Simulator Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 max-w-4xl mx-auto"
          >
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-neutral-400 dark:bg-neutral-600" />
                  <div className="h-3 w-3 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                  <div className="h-3 w-3 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                  <span className="ml-2 font-mono text-xs font-semibold text-neutral-500">AI Prompt Simulator</span>
                </div>
                <div className="flex gap-2">
                  {samplePrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePromptIndex(idx)}
                      className={`px-3 py-1 text-xs rounded-lg font-mono transition-all ${
                        activePromptIndex === idx
                          ? "bg-black text-white dark:bg-white dark:text-black font-bold"
                          : "bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Input Box */}
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 mb-6 font-mono text-xs text-neutral-800 dark:text-neutral-200">
                <Terminal className="h-4 w-4 shrink-0 text-neutral-500" />
                <span className="flex-1 truncate">{currentSample.prompt}</span>
                <Badge className="bg-black text-white dark:bg-white dark:text-black text-[10px] uppercase font-bold shrink-0">
                  AI Ready
                </Badge>
              </div>

              {/* Generated Fields Preview */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePromptIndex}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  {currentSample.fields.map((field, fIdx) => (
                    <div
                      key={fIdx}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/30"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-[10px] font-mono uppercase border-neutral-300 dark:border-neutral-700">
                          {field.type}
                        </Badge>
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{field.text}</span>
                      </div>
                      <CheckCircle2 className="h-4 w-4 text-neutral-400 dark:text-neutral-600" />
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Section Grid */}
      <section className="py-24 bg-neutral-50 dark:bg-neutral-950 border-y border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-black dark:text-white tracking-tight mb-4">
              Designed for Speed & Security
            </h2>
            <p className="text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Everything you need to create, restrict, and analyze form submissions in one unified platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Sparkles className="h-6 w-6 text-black dark:text-white" />,
                title: "AI Prompt Engine",
                desc: "Describe your questions in natural text and let AI generate structure, choices, and validation rules instantly."
              },
              {
                icon: <Lock className="h-6 w-6 text-black dark:text-white" />,
                title: "Email Restricted Privacy",
                desc: "Create private forms and grant response permissions strictly to authorized email addresses."
              },
              {
                icon: <BarChart3 className="h-6 w-6 text-black dark:text-white" />,
                title: "Real-time Analytics",
                desc: "Monitor response submissions dynamically with automated aggregated charts and CSV export."
              },
              {
                icon: <GripVertical className="h-6 w-6 text-black dark:text-white" />,
                title: "Drag & Reorder",
                desc: "Easily adjust question priority with smooth drag-and-drop reordering controls."
              },
              {
                icon: <Layers className="h-6 w-6 text-black dark:text-white" />,
                title: "Quiz & Scoring Mode",
                desc: "Enable automatic scoring, correct answer checking, and immediate score breakdowns."
              },
              {
                icon: <ShieldCheck className="h-6 w-6 text-black dark:text-white" />,
                title: "Optimistic Locking",
                desc: "Built-in version concurrency guard prevents overwriting data during simultaneous editing."
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
              >
                <Card className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:border-neutral-400 dark:hover:border-neutral-600 transition-all p-6 h-full">
                  <CardContent className="p-0 space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-bold text-black dark:text-white">{item.title}</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-20 bg-white dark:bg-black">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 bg-neutral-50/50 dark:bg-neutral-900/40">
            {[
              { num: "100%", label: "Monochromatic Theme" },
              { num: "3s", label: "AI Generation Time" },
              { num: "45/45", label: "Passed API Tests" },
              { num: "99.9%", label: "System Uptime" }
            ].map((stat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-black dark:text-white font-mono">{stat.num}</div>
                <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-24 bg-black text-white dark:bg-white dark:text-black transition-colors">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
            Start Building Smarter Forms Today.
          </h2>
          <p className="text-lg opacity-80 mb-8 max-w-xl mx-auto leading-relaxed">
            Create public or private forms with email restrictions in seconds.
          </p>
          <Button asChild size="lg" className="px-8 h-13 rounded-xl bg-white text-black hover:bg-neutral-200 dark:bg-black dark:text-white dark:hover:bg-neutral-800 font-bold text-base shadow-xl">
            <Link href="/auth/register">
              Get Started for Free
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}