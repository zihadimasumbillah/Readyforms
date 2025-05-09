"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { SortableQuestionField } from "./sortable-question-field";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Plus } from 'lucide-react';

// Define scoring criteria type
interface ScoringCriteriaItem {
  answer: string | number | boolean;
  points: number;
}

interface ScoringCriteria {
  [key: string]: ScoringCriteriaItem;
}

export interface TemplateFormProps {
  topics: Array<{ id: string, name: string }>;
  initialData?: any;
  handleSave: (data: any) => Promise<void>;
  handleCancel: () => void;
  isSubmitting?: boolean;
  onSubmit?: (data: any) => Promise<void>;
  isEditMode?: boolean;
  submitButtonLabel?: string;
}

export function TemplateForm({
  topics,
  initialData,
  handleSave,
  handleCancel,
  isSubmitting = false,
  onSubmit,
  isEditMode = false,
  submitButtonLabel = "Save Template"
}: TemplateFormProps) {
  const saveHandler = onSubmit || handleSave;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topicId: '',
    isPublic: true,
    isQuiz: false,
    showScoreImmediately: false,

    customString1State: false,
    customString1Question: '',
    customString2State: false,
    customString2Question: '',
    customString3State: false,
    customString3Question: '',
    customString4State: false,
    customString4Question: '',

    customText1State: false,
    customText1Question: '',
    customText2State: false,
    customText2Question: '',
    customText3State: false,
    customText3Question: '',
    customText4State: false,
    customText4Question: '',

    customInt1State: false,
    customInt1Question: '',
    customInt2State: false,
    customInt2Question: '',
    customInt3State: false,
    customInt3Question: '',
    customInt4State: false,
    customInt4Question: '',

    customCheckbox1State: false,
    customCheckbox1Question: '',
    customCheckbox2State: false,
    customCheckbox2Question: '',
    customCheckbox3State: false,
    customCheckbox3Question: '',
    customCheckbox4State: false,
    customCheckbox4Question: '',

    scoringCriteria: {} as ScoringCriteria,

    imageUrl: '',
  });

  const [fieldOrder, setFieldOrder] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));

    if (checked && !fieldOrder.includes(name.replace('State', ''))) {
      setFieldOrder(prev => [...prev, name.replace('State', '')]);
    }

    if (!checked) {
      setFieldOrder(prev => prev.filter(field => field !== name.replace('State', '')));
    }
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const onSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSave = {
      ...formData,
      questionOrder: fieldOrder,
    };

    await saveHandler(dataToSave);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFieldOrder(currentOrder => {
        const oldIndex = currentOrder.indexOf(active.id as string);
        const newIndex = currentOrder.indexOf(over.id as string);
        return arrayMove(currentOrder, oldIndex, newIndex);
      });
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const reader = new FileReader();

        reader.onload = () => {
          const dataUrl = reader.result as string;
          setPreviewImage(dataUrl);
          setFormData(prev => ({ ...prev, imageUrl: dataUrl }));
        };

        reader.readAsDataURL(file);
      }
    }
  });

  const removeImage = () => {
    setPreviewImage(null);
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  const getScoringCriteriaAsString = (key: string): string => {
    const criteria = formData.scoringCriteria[key];
    if (!criteria) return '';

    if (typeof criteria.answer === 'boolean') {
      return '';
    }
    return String(criteria.answer || '');
  };

  const getScoringCriteriaAsBoolean = (key: string): boolean => {
    const criteria = formData.scoringCriteria[key];
    return criteria?.answer === true;
  };

  useEffect(() => {
    if (initialData) {
      const parsedData = {
        ...initialData,
      };

      if (typeof initialData.scoringCriteria === 'string') {
        try {
          parsedData.scoringCriteria = JSON.parse(initialData.scoringCriteria);
        } catch (e) {
          console.error("Error parsing scoring criteria:", e);
          parsedData.scoringCriteria = {};
        }
      }

      setFormData(parsedData);

      if (initialData.imageUrl) {
        setPreviewImage(initialData.imageUrl);
      }

      let order: string[] = [];
      try {
        if (initialData.questionOrder) {
          if (typeof initialData.questionOrder === 'string') {
            order = JSON.parse(initialData.questionOrder);
          } else if (Array.isArray(initialData.questionOrder)) {
            order = initialData.questionOrder;
          }
        }
      } catch (e) {
        console.error("Error parsing question order:", e);
      }

      if (!order || !Array.isArray(order) || order.length === 0) {
        order = Object.keys(initialData)
          .filter(key => key.endsWith('State') && initialData[key] === true)
          .map(key => key.replace('State', ''));
      }

      setFieldOrder(order);
    }
  }, [initialData]);

  return (
    <form onSubmit={onSubmitForm} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Enter a title for your form"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              placeholder="Enter a description for your form"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Template Image (Optional)</Label>
            {previewImage ? (
              <div className="relative overflow-hidden rounded-md border border-border">
                <img
                  src={previewImage}
                  alt="Template preview"
                  className="max-h-40 w-full object-cover"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-border rounded-md p-6 hover:bg-accent/50 transition-colors cursor-pointer text-center"
              >
                <input {...getInputProps()} />
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Drag &amp; drop an image here, or click to select one</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="topicId">Topic <span className="text-red-500">*</span></Label>
            <select
              id="topicId"
              name="topicId"
              value={formData.topicId}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded-md bg-background"
            >
              <option value="">Select a topic</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="isPublic">Make this template public</Label>
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => handleSwitchChange('isPublic', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isQuiz">
                This is a quiz or assessment
                <span className="block text-xs text-muted-foreground">
                  Enable scoring for responses
                </span>
              </Label>
              <Switch
                id="isQuiz"
                checked={formData.isQuiz}
                onCheckedChange={(checked) => handleSwitchChange('isQuiz', checked)}
              />
            </div>

            {formData.isQuiz && (
              <div className="flex items-center justify-between pl-6">
                <Label htmlFor="showScoreImmediately">
                  Show score immediately
                  <span className="block text-xs text-muted-foreground">
                    Display score to users after submission
                  </span>
                </Label>
                <Switch
                  id="showScoreImmediately"
                  checked={formData.showScoreImmediately}
                  onCheckedChange={(checked) => handleSwitchChange('showScoreImmediately', checked)}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Short Text Questions</h3>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="customString1State"
                  checked={formData.customString1State}
                  onCheckedChange={(checked) =>
                    handleSwitchChange('customString1State', checked === true)}
                />
                <Label htmlFor="customString1State" className="font-normal">
                  Short Text Question 1
                </Label>
              </div>

              {formData.customString1State && (
                <div className="ml-6">
                  <Input
                    name="customString1Question"
                    value={formData.customString1Question}
                    onChange={handleInputChange}
                    placeholder="Enter your question"
                  />
                  {formData.isQuiz && (
                    <div className="mt-2">
                      <Label className="text-xs">Correct answer (for scoring)</Label>
                      <Input
                        name="customString1Answer"
                        value={getScoringCriteriaAsString('customString1Answer')}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            scoringCriteria: {
                              ...prev.scoringCriteria,
                              customString1Answer: {
                                answer: e.target.value,
                                points: 5
                              }
                            }
                          }));
                        }}
                        placeholder="Enter correct answer"
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Question Order</h3>
            <p className="text-sm text-muted-foreground">Drag and drop questions to reorder them.</p>

            {fieldOrder.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={fieldOrder} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {fieldOrder.map((fieldId) => {
                      const questionKey = `${fieldId}Question`;
                      const question = formData[questionKey as keyof typeof formData] || fieldId;
                      return (
                        <SortableQuestionField
                          key={fieldId}
                          id={fieldId}
                          question={typeof question === 'string' ? question : String(fieldId)}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="text-center p-4 border border-dashed rounded-md text-muted-foreground">
                No questions have been enabled. Enable questions above to arrange their order.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : submitButtonLabel}
        </Button>
      </div>
    </form>
  );
}

export default TemplateForm;
