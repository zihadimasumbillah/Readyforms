"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Topic } from "@/types";
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
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { SortableQuestionField } from './sortable-question-field';
import { PlusCircle } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

// Template form schema
const templateSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string(),
  topicId: z.string().min(1, { message: "Please select a topic" }),
  isPublic: z.boolean().default(true),
  allowedUsers: z.string().optional(),
});

interface TemplateFormProps {
  topics: Topic[];
  initialValues?: any;
  onSubmit: (data: any) => Promise<void>;
  isEditMode?: boolean;
}

export function TemplateForm({ 
  topics, 
  initialValues = {}, 
  onSubmit,
  isEditMode = false
}: TemplateFormProps) {
  const [template, setTemplate] = useState<any>(initialValues);
  const [questionOrder, setQuestionOrder] = useState<string[]>(
    initialValues.questionOrder ? 
      JSON.parse(initialValues.questionOrder) : []
  );
  const [saving, setSaving] = useState(false);

  // Form setup
  const form = useForm<z.infer<typeof templateSchema>>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      title: initialValues.title || '',
      description: initialValues.description || '',
      topicId: initialValues.topicId || '',
      isPublic: initialValues.isPublic !== undefined ? initialValues.isPublic : true,
      allowedUsers: initialValues.allowedUsers || '',
    },
  });

  // DnD setup for question reordering
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setQuestionOrder((items) => {
        const oldIndex = items.indexOf(active.id.toString());
        const newIndex = items.indexOf(over.id.toString());
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const toggleQuestionField = (fieldName: string, enabled: boolean) => {
    if (!template) return;
    
    const stateKey = `${fieldName}State`;
    
    setTemplate({
      ...template,
      [stateKey]: enabled,
    });

    // If enabling a field that's not in the order, add it
    if (enabled && !questionOrder.includes(fieldName)) {
      setQuestionOrder([...questionOrder, fieldName]);
    }
  };

  const updateQuestionText = (fieldName: string, text: string) => {
    if (!template) return;
    
    const questionKey = `${fieldName}Question`;
    
    setTemplate({
      ...template,
      [questionKey]: text,
    });
  };

  const addNewQuestion = (type: 'String' | 'Text' | 'Int' | 'Checkbox') => {
    if (!template) return;
    
    // Find the next available slot (1-4) for the given type
    for (let i = 1; i <= 4; i++) {
      const fieldName = `custom${type}${i}`;
      const stateKey = `${fieldName}State`;
      
      if (!template[stateKey]) {
        // Enable this field
        toggleQuestionField(fieldName, true);
        
        // Update the question text to a default value
        const questionKey = `${fieldName}Question`;
        setTemplate({
          ...template,
          [stateKey]: true,
          [questionKey]: `New ${type} Question`,
        });
        
        // Add to the order if not already there
        if (!questionOrder.includes(fieldName)) {
          setQuestionOrder([...questionOrder, fieldName]);
        }
        
        return;
      }
    }
    
    toast({
      title: "Maximum fields reached",
      description: `You can have at most 4 ${type.toLowerCase()} questions.`,
      variant: "default"
    });
  };

  const removeQuestion = (fieldName: string) => {
    if (!template) return;
    
    // Disable the field
    const stateKey = `${fieldName}State`;
    
    setTemplate({
      ...template,
      [stateKey]: false,
    });
    
    // Remove from order
    setQuestionOrder(questionOrder.filter(item => item !== fieldName));
  };

  const countActiveFieldsOfType = (type: string): number => {
    if (!template) return 0;
    
    let count = 0;
    for (let i = 1; i <= 4; i++) {
      const stateKey = `custom${type}${i}State`;
      if (template[stateKey]) {
        count++;
      }
    }
    return count;
  };

  const handleSubmit = async (data: z.infer<typeof templateSchema>) => {
    try {
      setSaving(true);
      
      // Prepare the payload with all necessary fields
      const payload: Record<string, any> = {
        ...data,
        version: template.version,
        questionOrder: JSON.stringify(questionOrder),
      };
      
      // Add all question fields to the payload
      for (let i = 1; i <= 4; i++) {
        ['String', 'Text', 'Int', 'Checkbox'].forEach(type => {
          const fieldName = `custom${type}${i}`;
          const stateKey = `${fieldName}State`;
          const questionKey = `${fieldName}Question`;
          
          payload[stateKey] = template[stateKey] || false;
          payload[questionKey] = template[questionKey] || '';
        });
      }
      
      await onSubmit(payload);
      
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic template information */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter template title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter a description of this template" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="topicId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {topics.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id}>
                          {topic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Make this template public
                    </FormLabel>
                    <FormDescription>
                      Public templates are visible to all users. Private templates are only visible to you.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Question section */}
            <div className="bg-muted/20 border rounded-md p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium">Questions</h3>
                  <p className="text-sm text-muted-foreground">
                    Add and configure questions for your form
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addNewQuestion('String')}
                    disabled={countActiveFieldsOfType('String') >= 4}
                    className="gap-1"
                    type="button" // Explicitly set type to button to prevent form submission
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Add Text Field
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addNewQuestion('Text')}
                    disabled={countActiveFieldsOfType('Text') >= 4}
                    className="gap-1"
                    type="button" // Explicitly set type to button to prevent form submission
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Add Text Area
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addNewQuestion('Int')}
                    disabled={countActiveFieldsOfType('Int') >= 4}
                    className="gap-1"
                    type="button" // Explicitly set type to button to prevent form submission
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Add Number
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addNewQuestion('Checkbox')}
                    disabled={countActiveFieldsOfType('Checkbox') >= 4}
                    className="gap-1"
                    type="button" // Explicitly set type to button to prevent form submission
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Add Checkbox
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2 py-2">
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={questionOrder}
                    strategy={verticalListSortingStrategy}
                  >
                    {questionOrder.map(fieldName => {
                      const stateKey = `${fieldName}State`;
                      const questionKey = `${fieldName}Question`;
                      
                      // Parse field name to get type and index
                      const typeMatch = fieldName.match(/custom([A-Za-z]+)(\d)/);
                      
                      if (!typeMatch) return null;
                      
                      const [, type, index] = typeMatch;
                      let label;
                      
                      switch (type) {
                        case 'String':
                          label = `Text Field ${index}`;
                          break;
                        case 'Text':
                          label = `Text Area ${index}`;
                          break;
                        case 'Int':
                          label = `Number ${index}`;
                          break;
                        case 'Checkbox':
                          label = `Checkbox ${index}`;
                          break;
                        default:
                          label = `Question ${index}`;
                      }
                      
                      return (
                        <SortableQuestionField
                          key={fieldName}
                          id={fieldName}
                          label={label}
                          enabled={template[stateKey] || false}
                          question={template[questionKey] || ''}
                          onToggle={(enabled) => toggleQuestionField(fieldName, enabled)}
                          onQuestionChange={(text) => updateQuestionText(fieldName, text)}
                          onDelete={() => removeQuestion(fieldName)}
                          currentFieldCount={questionOrder.filter(item => item.includes(type)).length}
                          maxFields={4}
                        />
                      );
                    })}
                  </SortableContext>
                </DndContext>
                
                {questionOrder.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-lg font-medium text-muted-foreground">No questions yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add questions using the buttons above
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : isEditMode ? 'Update Template' : 'Create Template'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
