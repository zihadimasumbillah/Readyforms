"use client";

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { toast } from '@/components/ui/use-toast';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Checkbox
} from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Template, Topic } from "@/types";
import { templateService } from "@/lib/api/template-service";
import { adminService } from "@/lib/api/admin-service";
import { 
  ChevronLeft, 
  GripVertical, 
  Pencil, 
  Save, 
  Settings, 
  PieChart, 
  ClipboardList,
  Info,
  Plus,
  UserCog,
  Trash,
  PlusCircle,
  MinusCircle
} from "lucide-react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Define our schema for form validation
const templateSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().optional(),
  topicId: z.string().min(1, "Topic is required"),
  isPublic: z.boolean(),
  allowedUsers: z.string().optional(),
});

interface QuestionFieldProps {
  id: string;
  label: string;
  enabled: boolean;
  question: string;
  onToggle: (enabled: boolean) => void;
  onQuestionChange: (question: string) => void;
  onDelete: () => void;
  maxFields?: number;
  currentFieldCount?: number;
}

const SortableQuestionField = ({ 
  id, 
  label, 
  enabled, 
  question, 
  onToggle, 
  onQuestionChange,
  onDelete,
  maxFields,
  currentFieldCount 
}: QuestionFieldProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 2 : 1,
  };

  const canDelete = currentFieldCount && currentFieldCount > 1;

  return (
    <div ref={setNodeRef} style={style} className="mb-4 border rounded-md p-4 bg-background">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="cursor-grab p-1">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <h4 className="font-medium">{label}</h4>
        </div>
        <div className="flex items-center gap-2">
          {canDelete && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onDelete} 
              className="h-8 w-8 p-0"
              title="Remove question"
            >
              <Trash className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
          <Checkbox 
            id={`toggle-${id}`}
            checked={enabled} 
            onCheckedChange={onToggle} 
          />
        </div>
      </div>
      
      <div className={`transition-all ${enabled ? 'opacity-100' : 'opacity-50'}`}>
        <Input 
          value={question} 
          onChange={(e) => onQuestionChange(e.target.value)}
          placeholder="Enter question text"
          disabled={!enabled}
          className="mt-2"
        />
      </div>
    </div>
  );
};

export default function EditTemplatePage({ params }: { params: { id: string } }) {
  const [template, setTemplate] = useState<Template | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questionOrder, setQuestionOrder] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('general');
  
  const { user, logout } = useAuth();
  const router = useRouter();
  const form = useForm<z.infer<typeof templateSchema>>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      title: '',
      description: '',
      topicId: '',
      isPublic: true,
      allowedUsers: '',
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleLogout = () => {
    if (logout) {
      logout();
      router.push('/auth/login');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [templateData, topicsData] = await Promise.all([
          templateService.getTemplateById(params.id),
          adminService.getAllTopics(),
        ]);

        setTemplate(templateData);
        setTopics(topicsData);

        // Set form values
        form.reset({
          title: templateData.title || '',
          description: templateData.description || '',
          topicId: templateData.topicId || '',
          isPublic: templateData.isPublic !== undefined ? templateData.isPublic : true,
          allowedUsers: templateData.allowedUsers ? templateData.allowedUsers : '',
        });

        // Set question order
        let order = [];
        try {
          order = templateData.questionOrder ? JSON.parse(templateData.questionOrder) : [];
        } catch (e) {
          console.error('Error parsing question order:', e);
          order = [];
        }

        // If order is empty, populate with all question fields
        if (!order.length) {
          const allFields = [];
          for (let i = 1; i <= 4; i++) {
            if (templateData[`customString${i}State`]) allFields.push(`customString${i}`);
            if (templateData[`customText${i}State`]) allFields.push(`customText${i}`);
            if (templateData[`customInt${i}State`]) allFields.push(`customInt${i}`);
            if (templateData[`customCheckbox${i}State`]) allFields.push(`customCheckbox${i}`);
          }
          setQuestionOrder(allFields);
        } else {
          setQuestionOrder(order);
        }
      } catch (error) {
        console.error("Error fetching template:", error);
        toast({
          title: "Error",
          description: "Failed to load template. Please try again.",
          variant: "destructive"
        });
        router.push('/admin/templates');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.isAdmin) {
      fetchData();
    } else if (user && !user.isAdmin) {
      toast({
        title: "Access denied",
        description: "You don't have permission to access this page",
        variant: "destructive"
      });
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  }, [user, params.id, router, form]);

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
      variant: "warning"
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

  const onSubmit = async (data: z.infer<typeof templateSchema>) => {
    if (!template) return;
    
    try {
      setSaving(true);
      
      // Prepare the payload
      const payload = {
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
      
      // Update the template
      const response = await templateService.updateTemplate(params.id, payload);
      
      // Update the local template with the new version
      setTemplate({
        ...template,
        ...response.template,
        version: response.version,
      });
      
      toast({
        title: "Success",
        description: "Template saved successfully",
        variant: "default"
      });
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

  if (loading || !template) {
    return (
      <DashboardLayout
        user={{
          name: user?.name || 'Admin User',
          email: user?.email || 'admin@example.com',
          isAdmin: true
        }}
        onLogout={handleLogout}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-60 mb-2" />
            <Skeleton className="h-4 w-full max-w-sm" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      user={{
        name: user?.name || 'Admin User',
        email: user?.email || 'admin@example.com',
        isAdmin: true
      }}
      onLogout={handleLogout}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/templates">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Edit Template</h1>
        </div>
        <Button 
          onClick={form.handleSubmit(onSubmit)} 
          disabled={saving}
          className="gap-2"
        >
          {saving ? (
            <>Saving</>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
      
      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            General Settings
          </TabsTrigger>
          <TabsTrigger value="questions" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Questions
          </TabsTrigger>
          <TabsTrigger value="responses" className="gap-2">
            <PieChart className="h-4 w-4" />
            Responses
          </TabsTrigger>
          <TabsTrigger value="access" className="gap-2">
            <UserCog className="h-4 w-4" />
            Access Control
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Template Settings</CardTitle>
              <CardDescription>
                Update the basic information for this template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form className="space-y-6">
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
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
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
                            Public templates are visible to all users. Private templates are only visible to you and selected users.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="questions">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Questions</CardTitle>
                  <CardDescription>
                    Configure and reorder the questions in this template
                  </CardDescription>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addNewQuestion('String')}
                    disabled={countActiveFieldsOfType('String') >= 4}
                    className="gap-1"
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
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Add Checkbox
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 rounded-md p-4 mb-4 flex items-center gap-3">
                <Info className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag and drop questions to reorder them. Toggle the checkbox to enable or disable a question.
                </p>
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
                      
                      // Parse field name to get type and index (e.g., 'customString1' -> 'String' and '1')
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
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="responses">
          <Card>
            <CardHeader>
              <CardTitle>Form Responses</CardTitle>
              <CardDescription>
                View all submissions for this template
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Button 
                variant="default" 
                onClick={() => router.push(`/admin/templates/${params.id}/responses`)}
                className="gap-2"
              >
                <ClipboardList className="h-4 w-4" />
                View All Responses
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle>Access Control</CardTitle>
              <CardDescription>
                Configure who can access this template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <div className="space-y-6">
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
                            Public templates are visible to all users. Private templates are only visible to you and selected users.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  {!form.watch("isPublic") && (
                    <FormField
                      control={form.control}
                      name="allowedUsers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Allowed Users</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter user IDs separated by commas" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Enter the IDs of users who should have access to this template, separated by commas.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </Form>
            </CardContent>
            <CardFooter className="border-t pt-6 flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button onClick={form.handleSubmit(onSubmit)} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
