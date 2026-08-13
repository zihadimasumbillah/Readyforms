"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, GripVertical, BarChart3, Share2, ArrowRight, ShieldCheck, Zap, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-white dark:bg-black min-h-screen transition-colors duration-300">
      {/* Background Subtle Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-28 pb-32">
        <div className="container relative mx-auto px-4 text-center z-10 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Badge variant="outline" className="mb-6 px-4 py-1.5 text-xs font-mono uppercase tracking-wider border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-black dark:text-white" />
              AI-Powered Monochromatic Form Builder
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-extrabold text-5xl sm:text-6xl lg:text-7xl mb-6 tracking-tight text-black dark:text-white leading-[1.1]"
          >
            Build Modern Forms with AI
            <br className="hidden sm:block" />
            <span className="text-neutral-500 dark:text-neutral-400">
              In Seconds
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Describe your form requirement in natural prompt text. Let our enterprise AI generator construct ready-to-deploy interactive forms instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button asChild size="lg" className="px-8 text-base h-13 rounded-xl bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-bold shadow-md transition-all">
              <Link href="/templates/create">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate with AI
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-8 text-base h-13 rounded-xl border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold transition-all">
              <Link href="/templates">
                Browse Templates
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-24 bg-neutral-50 dark:bg-neutral-950/50 border-y border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-black dark:text-white mb-4 tracking-tight">
              Enterprise Grade Capabilities
            </h2>
            <p className="text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Precision engineered workflows built for maximum efficiency and high-speed data collection.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Sparkles className="h-6 w-6 text-black dark:text-white" />,
                title: "AI Generation",
                desc: "Convert text prompts into responsive multi-field dynamic forms in under 3 seconds."
              },
              {
                icon: <GripVertical className="h-6 w-6 text-black dark:text-white" />,
                title: "Drag & Reorder",
                desc: "Intuitive re-ordering and version-controlled optimistic locking mechanics."
              },
              {
                icon: <BarChart3 className="h-6 w-6 text-black dark:text-white" />,
                title: "Real-time Analytics",
                desc: "Aggregated quantitative statistics, response logs, and CSV data export capabilities."
              },
              {
                icon: <Share2 className="h-6 w-6 text-black dark:text-white" />,
                title: "Instant Publishing",
                desc: "Share public links, embed inside iframe containers, or direct submit via API endpoints."
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <Card className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:border-neutral-400 dark:hover:border-neutral-600 transition-all p-6 h-full">
                  <CardContent className="p-0">
                    <div className="h-12 w-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-bold text-black dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-white dark:bg-black">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-black dark:text-white mb-4 tracking-tight">
              Three Simple Steps
            </h2>
            <p className="text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              From natural prompt description to live published form in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Describe", desc: "Type your topic, fields, or domain specifics into our prompt generator." },
              { step: "02", title: "Generate", desc: "OpenAI constructs schema fields, validation rules, and template metadata." },
              { step: "03", title: "Collect", desc: "Publish immediately to gather responses and view automated analytical charts." }
            ].map((s, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.15 }}
                className="text-center p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40"
              >
                <div className="h-14 w-14 rounded-xl bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                  {s.step}
                </div>
                <h3 className="text-xl font-bold text-black dark:text-white mb-2">{s.title}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white dark:bg-white dark:text-black transition-colors">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6">
            Ready to experience the future of forms?
          </h2>
          <p className="text-lg opacity-80 mb-8 max-w-xl mx-auto">
            Get started today with our monochromatic, high-speed form builder system.
          </p>
          <Button asChild size="lg" className="px-8 h-13 rounded-xl bg-white text-black hover:bg-neutral-200 dark:bg-black dark:text-white dark:hover:bg-neutral-800 font-bold text-base shadow-lg">
            <Link href="/auth/register">
              Create Your Free Account
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}