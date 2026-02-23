"use client";

import React, { useState } from "react";
import { Sparkles, Wand2, Loader2, Check, RefreshCw, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { aiService, GeneratedFormData, GeneratedQuestion } from "@/lib/api/ai-service";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";

interface AIFormGeneratorProps {
  onApply: (data: GeneratedFormData) => void;
}

const QUICK_SUGGESTIONS = [
  "Customer Feedback",
  "Job Application",
  "Event Registration",
  "Quiz",
];

export function AIFormGenerator({ onApply }: AIFormGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState<GeneratedFormData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();
  const isLoggedIn = !!auth?.user;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setGeneratedData(null);
    try {
      const data = await aiService.generateForm(prompt.trim());
      setGeneratedData(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to generate form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    await handleGenerate();
  };

  const handleApply = () => {
    if (generatedData) {
      onApply(generatedData);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const handleQuestionEdit = (index: number, field: keyof GeneratedQuestion, value: string | boolean) => {
    if (!generatedData) return;
    const updated = { ...generatedData };
    updated.questions = [...updated.questions];
    updated.questions[index] = { ...updated.questions[index], [field]: value };
    setGeneratedData(updated);
  };

  const typeLabel = (type: string) => {
    switch (type) {
      case "string": return "Short Text";
      case "text": return "Long Text";
      case "int": return "Number";
      case "checkbox": return "Checkbox";
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Form Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe the form you want to create... e.g., 'A customer satisfaction survey with rating questions and a feedback section'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
          />

          <div className="flex flex-wrap gap-2">
            {QUICK_SUGGESTIONS.map((suggestion) => (
              <Badge
                key={suggestion}
                variant="secondary"
                className="cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>

          {isLoggedIn ? (
            <Button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate with AI
                </>
              )}
            </Button>
          ) : (
            <Button asChild className="w-full" variant="outline">
              <Link href="/auth/login?redirect=/templates/create">
                <LogIn className="mr-2 h-4 w-4" />
                Log in to use AI Generation
              </Link>
            </Button>
          )}

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {generatedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Preview
              </span>
              <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Regenerate
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={generatedData.title}
                onChange={(e) => setGeneratedData({ ...generatedData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={generatedData.description}
                onChange={(e) => setGeneratedData({ ...generatedData, description: e.target.value })}
              />
            </div>

            {generatedData.isQuiz && (
              <Badge variant="secondary">Quiz Mode</Badge>
            )}

            <div className="space-y-3">
              <label className="text-sm font-medium">Questions ({generatedData.questions.length})</label>
              {generatedData.questions.map((q, i) => (
                <div key={i} className="flex items-start gap-3 rounded-md border p-3">
                  <Badge variant="outline" className="mt-1 shrink-0">
                    {typeLabel(q.type)}
                  </Badge>
                  <Input
                    value={q.question}
                    onChange={(e) => handleQuestionEdit(i, "question", e.target.value)}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>

            <Button onClick={handleApply} className="w-full">
              <Check className="mr-2 h-4 w-4" />
              Apply to Form
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AIFormGenerator;
