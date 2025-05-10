"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { templateService, TemplateCreateData } from '@/lib/api/template-service';
import { topicService } from '@/lib/api/topic-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, Loader2, GripVertical, Plus, Eye, Save } from 'lucide-react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Topic {
  id: string;
  name: string;
}

interface QuestionField {
  id: string;
  type: 'String' | 'Text' | 'Int' | 'Checkbox';
  index: number;
  question: string;
  isActive: boolean;
  answer?: string | number | boolean;
  points?: number; 
}

function SortableQuestionField({ field, onUpdateField, onRemoveField, isQuizMode }: { 
  field: QuestionField; 
  onUpdateField: (field: QuestionField) => void;
  onRemoveField: (id: string) => void;
  isQuizMode: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const typeCapitalized = field.type.charAt(0).toUpperCase() + field.type.slice(1);

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="bg-background border rounded-md p-4 mb-3 relative"
    >
      <div className="flex items-center gap-2 mb-4">
        <div {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <Badge variant="outline" className="font-normal">
          {typeCapitalized} question
        </Badge>
        <div className="ml-auto flex items-center gap-2">
          <Switch 
            id={`active-${field.id}`} 
            checked={field.isActive}
            onCheckedChange={(checked) => onUpdateField({ ...field, isActive: checked })}
          />
          <Label htmlFor={`active-${field.id}`}>Active</Label>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onRemoveField(field.id)}
            className="h-8 w-8 p-0 ml-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor={`question-${field.id}`}>Question</Label>
          <Input 
            id={`question-${field.id}`}
            value={field.question} 
            onChange={(e) => onUpdateField({ ...field, question: e.target.value })}
            placeholder={`Enter your ${typeCapitalized.toLowerCase()} question`}
            className="mt-1"
          />
        </div>

        {isQuizMode && (
          <div className="bg-muted/50 p-3 rounded-md space-y-3 border">
            <h4 className="text-sm font-medium">Scoring options</h4>
            
            <div className="grid gap-2">
              <Label htmlFor={`answer-${field.id}`}>Correct Answer</Label>
              {field.type === 'String' || field.type === 'Text' ? (
                <Input
                  id={`answer-${field.id}`}
                  value={field.answer as string || ''}
                  onChange={(e) => onUpdateField({ ...field, answer: e.target.value })}
                  placeholder="Enter correct answer"
                />
              ) : field.type === 'Int' ? (
                <Input
                  id={`answer-${field.id}`}
                  type="number"
                  value={field.answer as number || ''}
                  onChange={(e) => onUpdateField({ ...field, answer: Number(e.target.value) })}
                  placeholder="Enter correct number"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Switch
                    id={`answer-${field.id}`}
                    checked={field.answer as boolean || false}
                    onCheckedChange={(checked) => onUpdateField({ ...field, answer: checked })}
                  />
                  <Label htmlFor={`answer-${field.id}`}>True/Yes is correct</Label>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor={`points-${field.id}`}>Points</Label>
              <Input
                id={`points-${field.id}`}
                type="number"
                min="0"
                step="1"
                value={field.points || 0}
                onChange={(e) => onUpdateField({ ...field, points: Number(e.target.value) })}
                className="mt-1"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CreateTemplatePage() {
  const router = useRouter();
  const { user } = useAuth() || {};
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [topicId, setTopicId] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [questionFields, setQuestionFields] = useState<QuestionField[]>([]);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [showScoreImmediately, setShowScoreImmediately] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [topicsLoading, setTopicsLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setTopicsLoading(true);
        const topicsData = await topicService.getAllTopics();
        setTopics(topicsData);
        if (topicsData.length > 0) {
          setTopicId(topicsData[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch topics:', error);
        toast({
          title: 'Error',
          description: 'Failed to load topics. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setTopicsLoading(false);
      }
    };

    fetchTopics();
  }, []);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/templates/create');
    }
  }, [user, router]);

  const generateId = () => `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addQuestionField = (type: 'String' | 'Text' | 'Int' | 'Checkbox') => {
    const existingFields = questionFields.filter(f => f.type === type);
    const index = existingFields.length + 1;
    
    const newField: QuestionField = {
      id: generateId(),
      type,
      index,
      question: '',
      isActive: true,
      answer: type === 'Checkbox' ? false : '',
      points: 1
    };
    
    setQuestionFields([...questionFields, newField]);
  };

  const updateQuestionField = (updatedField: QuestionField) => {
    setQuestionFields(
      questionFields.map(field => 
        field.id === updatedField.id ? updatedField : field
      )
    );
  };

  const removeQuestionField = (id: string) => {
    setQuestionFields(questionFields.filter(field => field.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setQuestionFields((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const buildTemplateData = (): TemplateCreateData => {
    const questionOrder: string[] = questionFields
      .filter(field => field.isActive)
      .map(field => `custom${field.type}${field.index}`);

    const scoringCriteria: Record<string, { answer: any; points: number }> = {};
    
    if (isQuizMode) {
      questionFields.filter(field => field.isActive).forEach(field => {
        const fieldKey = `custom${field.type}${field.index}Answer`;
        scoringCriteria[fieldKey] = {
          answer: field.answer,
          points: field.points || 0
        };
      });
    }

    const templateData: TemplateCreateData = {
      title,
      description,
      isPublic,
      topicId,
      tags,
      isQuiz: isQuizMode,
      showScoreImmediately: isQuizMode && showScoreImmediately,
      scoringCriteria: isQuizMode ? JSON.stringify(scoringCriteria) : '{}',
      questionOrder: JSON.stringify(questionOrder),
    };

    questionFields.forEach(field => {
      const stateKey = `custom${field.type}${field.index}State`;
      const questionKey = `custom${field.type}${field.index}Question`;
      
      templateData[stateKey] = field.isActive;
      templateData[questionKey] = field.question;
    });

    return templateData;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Template title is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!topicId) {
      toast({
        title: "Error",
        description: "Please select a topic",
        variant: "destructive",
      });
      return;
    }
    
    const activeFields = questionFields.filter(field => field.isActive);
    if (activeFields.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one question to your template",
        variant: "destructive",
      });
      return;
    }

    const emptyQuestions = activeFields.filter(field => !field.question.trim());
    if (emptyQuestions.length > 0) {
      toast({
        title: "Error",
        description: "All active questions must have content",
        variant: "destructive",
      });
      return;
    }
    
    if (isQuizMode) {
      const invalidQuizQuestions = activeFields.filter(field => {
        if (field.type === 'String' || field.type === 'Text') {
          return !field.answer || (field.answer as string).trim() === '';
        }
        if (field.type === 'Int') {
          return field.answer === undefined || field.answer === null;
        }
        return false;
      });
      
      if (invalidQuizQuestions.length > 0) {
        toast({
          title: "Error",
          description: "All quiz questions must have correct answers defined",
          variant: "destructive",
        });
        return;
      }
    }
    
    try {
      setLoading(true);
      const templateData = buildTemplateData();
      const response = await templateService.createTemplate(templateData);
      
      toast({
        title: "Success",
        description: "Template created successfully",
      });
      
      if (response) {
        router.push(`/templates/${response.id}`);
      } else {
        toast({
          title: "Warning",
          description: "Template was created but we couldn't get the template details.",
          variant: "default",
        });
        router.push('/templates');
      }
    } catch (error: any) {
      console.error('Failed to create template:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    const previewData = {
      title,
      description,
      isPublic,
      topicId,
      tags,
      isQuiz: isQuizMode,
      showScoreImmediately,
      questionFields: questionFields.filter(field => field.isActive),
    };
    
    localStorage.setItem('template_preview', JSON.stringify(previewData));
    window.open('/templates/preview', '_blank');
  };

  const sortedFields = [...questionFields].sort((a, b) => {
    if (a.type !== b.type) {
      return a.type.localeCompare(b.type);
    }
    return a.index - b.index;
  });

  const fieldsByType = {
    String: sortedFields.filter(field => field.type === 'String'),
    Text: sortedFields.filter(field => field.type === 'Text'),
    Int: sortedFields.filter(field => field.type === 'Int'),
    Checkbox: sortedFields.filter(field => field.type === 'Checkbox')
  };

  if (!user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Template</h1>
        <p className="text-muted-foreground">
          Create a new form template for users to fill out
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Template Details</CardTitle>
                <CardDescription>
                  Set the basic information for your template
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter template title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter template description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Select
                    value={topicId}
                    onValueChange={(value) => setTopicId(value)}
                    disabled={topicsLoading}
                  >
                    <SelectTrigger id="topic" className="w-full">
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id}>
                          {topic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      placeholder="Add tags (press Enter or comma to add)"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyPress}
                    />
                    <Button type="button" onClick={addTag} variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="px-2 py-1">
                        {tag}
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => router.push('/templates')}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveTab('questions')}
                >
                  Next: Add Questions
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Template Questions</CardTitle>
                <CardDescription>
                  Add and customize questions for your template
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="mb-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="quiz-mode"
                      checked={isQuizMode}
                      onCheckedChange={setIsQuizMode}
                    />
                    <Label htmlFor="quiz-mode">
                      Quiz Mode (allows scoring and correct answers)
                    </Label>
                  </div>
                  {isQuizMode && (
                    <div className="mt-2 flex items-center space-x-2">
                      <Switch
                        id="show-score"
                        checked={showScoreImmediately}
                        onCheckedChange={setShowScoreImmediately}
                      />
                      <Label htmlFor="show-score">
                        Show score immediately after submission
                      </Label>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    onClick={() => addQuestionField('String')}
                    variant="outline"
                    className="justify-start"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Short Answer Question
                  </Button>
                  <Button
                    type="button"
                    onClick={() => addQuestionField('Text')}
                    variant="outline"
                    className="justify-start"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Long Answer Question
                  </Button>
                  <Button
                    type="button"
                    onClick={() => addQuestionField('Int')}
                    variant="outline"
                    className="justify-start"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Number Question
                  </Button>
                  <Button
                    type="button"
                    onClick={() => addQuestionField('Checkbox')}
                    variant="outline"
                    className="justify-start"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Yes/No Question
                  </Button>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Question List</h3>
                  {questionFields.length === 0 ? (
                    <div className="text-center p-8 border border-dashed rounded-md">
                      <p className="text-muted-foreground">
                        No questions added yet. Add some questions using the buttons above.
                      </p>
                    </div>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={questionFields.map(field => field.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {sortedFields.map((field) => (
                          <SortableQuestionField
                            key={field.id}
                            field={field}
                            onUpdateField={updateQuestionField}
                            onRemoveField={removeQuestionField}
                            isQuizMode={isQuizMode}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('basic')}
                  type="button"
                >
                  Previous: Basic Info
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                >
                  Next: Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Template Settings</CardTitle>
                <CardDescription>
                  Configure visibility and other settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="public"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                  <Label htmlFor="public">
                    Public Template (visible to all users)
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isPublic
                    ? "Anyone can view and use this template."
                    : "Only you can view and use this template."}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('questions')}
                  type="button"
                >
                  Previous: Questions
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                >
                  Next: Preview
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Template Preview</CardTitle>
                <CardDescription>
                  Review your template before creating
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md">
                    <div>
                      <p className="text-sm text-muted-foreground">Title</p>
                      <p className="font-medium">{title || 'No title'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Topic</p>
                      <p className="font-medium">
                        {topics.find(t => t.id === topicId)?.name || 'No topic selected'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Visibility</p>
                      <p className="font-medium">
                        {isPublic ? 'Public' : 'Private'}
                      </p>
                    </div>
                    <div className="col-span-3">
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p>
                        {description || 'No description provided'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Questions</h3>
                  {questionFields.filter(field => field.isActive).length > 0 ? (
                    <div className="space-y-3">
                      {sortedFields
                        .filter(field => field.isActive)
                        .map((field, index) => (
                          <div 
                            key={field.id}
                            className="p-4 border rounded-md"
                          >
                            <div className="flex justify-between mb-2">
                              <Badge variant="outline">
                                {field.type} question
                              </Badge>
                              {isQuizMode && (
                                <Badge>
                                  Worth {field.points || 0} points
                                </Badge>
                              )}
                            </div>
                            <p className="font-medium">
                              {index + 1}. {field.question || 'Untitled question'}
                            </p>
                            {isQuizMode && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Correct answer: {
                                  field.type === 'Checkbox' 
                                    ? (field.answer ? 'Yes' : 'No')
                                    : field.answer?.toString() || 'Not set'
                                }
                              </p>
                            )}
                          </div>
                        ))
                      }
                    </div>
                  ) : (
                    <div className="text-center p-8 border border-dashed rounded-md">
                      <p className="text-muted-foreground">
                        No active questions in this template.
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.length > 0 ? (
                      tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No tags added</p>
                    )}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('settings')}
                    type="button"
                    className="flex-1 md:flex-none"
                  >
                    Previous: Settings
                  </Button>
                  <Button
                    variant="secondary"
                    type="button"
                    className="flex-1 md:flex-none"
                    onClick={handlePreview}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Full Preview
                  </Button>
                </div>
                <Button
                  type="submit"
                  className="flex-1 md:flex-none"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Template
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}