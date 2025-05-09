"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save } from 'lucide-react';

interface QuestionField {
  id: string;
  type: 'String' | 'Text' | 'Int' | 'Checkbox';
  index: number;
  question: string;
  isActive: boolean;
  answer?: string | number | boolean;
  points?: number;
}

interface PreviewData {
  title: string;
  description: string;
  isPublic: boolean;
  topicId: string;
  tags: string[];
  isQuiz: boolean;
  showScoreImmediately: boolean;
  questionFields: QuestionField[];
}

const defaultPreviewData: PreviewData = {
  title: "Example Template",
  description: "This is a preview template for demonstration purposes",
  isPublic: true,
  topicId: "",
  tags: ["preview", "example"],
  isQuiz: true,
  showScoreImmediately: true,
  questionFields: [
    {
      id: "field_default_1",
      type: "String",
      index: 1,
      question: "What is the capital of France?",
      isActive: true,
      answer: "Paris",
      points: 5
    },
    {
      id: "field_default_2",
      type: "Int",
      index: 1,
      question: "What is 5 + 7?",
      isActive: true,
      answer: 12,
      points: 3
    },
    {
      id: "field_default_3",
      type: "Checkbox",
      index: 1,
      question: "Is water wet?",
      isActive: true,
      answer: true,
      points: 2
    }
  ]
};

export default function TemplatePreviewPage() {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState({ earned: 0, total: 0 });

  useEffect(() => {
    try {
      const storedData = localStorage.getItem('template_preview');
      if (storedData) {
        setPreviewData(JSON.parse(storedData));
      } else {
        // Use default data if nothing in local storage
        setPreviewData(defaultPreviewData);
      }
    } catch (error) {
      console.error('Error loading preview data:', error);
      // Fallback to default data
      setPreviewData(defaultPreviewData);
    }
  }, []);

  const handleInputChange = (fieldId: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const calculateScore = () => {
    if (!previewData?.isQuiz) return;

    let earnedPoints = 0;
    let totalPoints = 0;

    previewData.questionFields.forEach(field => {
      if (!field.isActive) return;
      
      const fieldId = `custom${field.type}${field.index}`;
      const userValue = formValues[fieldId];
      totalPoints += field.points || 0;

      if (field.type === 'String' || field.type === 'Text') {
        // Case insensitive string comparison for text-based answers
        if (userValue && userValue.toLowerCase() === (field.answer as string).toLowerCase()) {
          earnedPoints += field.points || 0;
        }
      } else if (field.type === 'Int') {
        // Exact match for numbers
        if (Number(userValue) === field.answer) {
          earnedPoints += field.points || 0;
        }
      } else if (field.type === 'Checkbox') {
        // Boolean match for checkbox
        if (userValue === field.answer) {
          earnedPoints += field.points || 0;
        }
      }
    });

    setScore({ earned: earnedPoints, total: totalPoints });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    
    if (previewData?.isQuiz) {
      calculateScore();
    }
  };

  const handleReset = () => {
    setFormValues({});
    setSubmitted(false);
  };

  if (!previewData) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Loading Preview</h2>
          <p className="text-muted-foreground">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Preview Template</h1>
        <Button variant="outline" onClick={() => window.close()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Close Preview
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{previewData.title}</CardTitle>
              <CardDescription>{previewData.description}</CardDescription>
            </div>
            {previewData.isQuiz && (
              <Badge variant="outline" className="ml-2">
                Quiz
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {previewData.tags.map((tag, index) => (
              <Badge key={index} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {previewData.questionFields
              .filter(field => field.isActive)
              .map((field, index) => {
                const fieldId = `custom${field.type}${field.index}`;
                
                return (
                  <div key={field.id} className="space-y-2 p-3 border rounded-md">
                    <Label htmlFor={fieldId} className="font-medium text-base">
                      {index + 1}. {field.question}
                      {previewData.isQuiz && <span className="ml-1 text-sm text-muted-foreground">({field.points} points)</span>}
                    </Label>

                    {field.type === 'String' && (
                      <Input
                        id={fieldId}
                        value={formValues[fieldId] || ''}
                        onChange={(e) => handleInputChange(fieldId, e.target.value)}
                        disabled={submitted}
                        className="max-w-lg"
                      />
                    )}

                    {field.type === 'Text' && (
                      <Textarea
                        id={fieldId}
                        value={formValues[fieldId] || ''}
                        onChange={(e) => handleInputChange(fieldId, e.target.value)}
                        disabled={submitted}
                        rows={3}
                      />
                    )}

                    {field.type === 'Int' && (
                      <Input
                        id={fieldId}
                        type="number"
                        value={formValues[fieldId] || ''}
                        onChange={(e) => handleInputChange(fieldId, Number(e.target.value))}
                        disabled={submitted}
                        className="max-w-xs"
                      />
                    )}

                    {field.type === 'Checkbox' && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={fieldId}
                          checked={formValues[fieldId] || false}
                          onCheckedChange={(checked) => 
                            handleInputChange(fieldId, Boolean(checked))
                          }
                          disabled={submitted}
                        />
                        <label
                          htmlFor={fieldId}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Yes
                        </label>
                      </div>
                    )}

                    {/* Show correct answer if submitted and showScoreImmediately is true */}
                    {submitted && previewData.isQuiz && previewData.showScoreImmediately && (
                      <div className="mt-2 text-sm">
                        <p className={
                          field.type === 'String' || field.type === 'Text'
                            ? formValues[fieldId]?.toLowerCase() === (field.answer as string)?.toLowerCase() ? 'text-green-600' : 'text-red-600' 
                            : formValues[fieldId] === field.answer ? 'text-green-600' : 'text-red-600'
                        }>
                          {field.type === 'String' || field.type === 'Text' 
                            ? formValues[fieldId]?.toLowerCase() === (field.answer as string)?.toLowerCase() ? 'Correct!' : `Incorrect. The correct answer is: ${field.answer}`
                            : field.type === 'Int'
                              ? formValues[fieldId] === field.answer ? 'Correct!' : `Incorrect. The correct answer is: ${field.answer}`
                              : formValues[fieldId] === field.answer ? 'Correct!' : `Incorrect. The correct answer is: ${field.answer ? 'Yes' : 'No'}`
                          }
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

            <div className="pt-4 flex justify-end gap-4">
              {submitted ? (
                <>
                  {previewData.isQuiz && (
                    <div className="mr-auto p-4 bg-muted rounded-md">
                      <p className="font-medium">
                        Your score: {score.earned} out of {score.total} points 
                        ({score.total > 0 ? Math.round((score.earned / score.total) * 100) : 0}%)
                      </p>
                    </div>
                  )}
                  <Button type="button" variant="outline" onClick={handleReset}>
                    Try Again
                  </Button>
                </>
              ) : (
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Submit
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
