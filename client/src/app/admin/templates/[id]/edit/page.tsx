"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { adminService } from "@/lib/api/admin-service";
import { toast } from "@/components/ui/use-toast";

export default function EditTemplatePage({ params }: { params: { id: string } }) {
  const auth = useAuth();
  const user = auth?.user;
  const logout = auth?.logout;
  
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<any>(null);
  
  const handleLogout = () => {
    if (logout) {
      logout();
      router.push('/auth/login');
    }
  };
  
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true);
        const data = await adminService.getTemplateById(params.id);
        setTemplate(data);
      } catch (error) {
        console.error("Error fetching template:", error);
        toast({
          title: "Error",
          description: "Failed to load template data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTemplate();
    } else {
      router.push('/auth/login');
    }
  }, [params.id, user, router]);

  const addNewQuestion = (type: string) => {
    // Implementation for adding a new question
    console.log(`Adding new question of type: ${type}`);
  };

  const countActiveFieldsOfType = (type: string) => {
    if (!template) return 0;
    
    let count = 0;
    if (type === 'String') {
      if (template.customString1State) count++;
      if (template.customString2State) count++;
      if (template.customString3State) count++;
      if (template.customString4State) count++;
    } else if (type === 'Text') {
      if (template.customText1State) count++;
      if (template.customText2State) count++;
      if (template.customText3State) count++;
      if (template.customText4State) count++;
    }
    return count;
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
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
        <h1 className="text-2xl font-bold">
          {loading ? "Loading..." : `Edit Template: ${template?.title}`}
        </h1>
      </div>
      
      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Card>
            <CardContent>
              <Form {...useForm()}>
                {/* Form content goes here */}
                <div className="space-y-4">
                  {/* Actual form fields will go here */}
                </div>
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
                </div>
              </div>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}