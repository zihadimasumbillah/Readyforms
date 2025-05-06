"use client";

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { toast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  ChevronLeft, 
  Eye, 
  DownloadIcon, 
  Filter,
  Calendar,
  RefreshCw
} from "lucide-react";
import Link from 'next/link';
import { Template } from "@/types";
import { templateService } from "@/lib/api/template-service";
import { responseService } from "@/lib/api/response-service";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface FormResponse {
  id: string;
  userId: string;
  templateId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  [key: string]: any; // For dynamic response fields
}

interface AggregateData {
  avg_custom_int1: number | null;
  avg_custom_int2: number | null;
  avg_custom_int3: number | null;
  avg_custom_int4: number | null;
  checkbox1_yes_count: number;
  checkbox2_yes_count: number;
  checkbox3_yes_count: number;
  checkbox4_yes_count: number;
  total_responses: number;
  string1_count: number;
  string2_count: number;
  string3_count: number;
  string4_count: number;
  text1_count: number;
  text2_count: number;
  text3_count: number;
  text4_count: number;
}

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function TemplateResponsesPage({ params }: { params: { id: string } }) {
  const [template, setTemplate] = useState<Template | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<FormResponse[]>([]);
  const [aggregateData, setAggregateData] = useState<AggregateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState('responses');
  
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    if (logout) {
      logout();
      router.push('/auth/login');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch template and responses in parallel
      const [templateData, responsesData, aggregateDataResult] = await Promise.all([
        templateService.getTemplateById(params.id),
        responseService.getResponsesByTemplate(params.id),
        responseService.getAggregateData(params.id),
      ]);
      
      setTemplate(templateData);
      setResponses(responsesData);
      setFilteredResponses(responsesData);
      setAggregateData(aggregateDataResult);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load template responses. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      // Check if user is admin
      if (!user.isAdmin) {
        toast({
          title: "Access denied",
          description: "You don't have permission to access this page",
          variant: "destructive"
        });
        router.push('/dashboard');
        return;
      }
      
      fetchData();
    } else {
      // Redirect to login if no user is found
      router.push('/auth/login');
    }
  }, [user, params.id, router]);

  useEffect(() => {
    if (!responses.length) return;
    
    // Filter responses based on search query
    let filtered = [...responses];
    
    if (searchQuery.trim() !== '') {
      const lowercaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(response => 
        response.user?.name?.toLowerCase().includes(lowercaseQuery) || 
        response.user?.email?.toLowerCase().includes(lowercaseQuery)
      );
    }
    
    // Sort responses
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredResponses(filtered);
  }, [searchQuery, responses, sortField, sortDirection]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const exportToCsv = () => {
    if (!template || !responses.length) return;
    
    try {
      // Prepare headers
      const headers = ['Response ID', 'User', 'Email', 'Submission Date'];
      
      // Add question columns based on the template's enabled questions
      const questionFields: string[] = [];
      
      for (let i = 1; i <= 4; i++) {
        if (template[`customString${i}State`]) {
          headers.push(template[`customString${i}Question`] || `String Question ${i}`);
          questionFields.push(`customString${i}Answer`);
        }
        
        if (template[`customText${i}State`]) {
          headers.push(template[`customText${i}Question`] || `Text Question ${i}`);
          questionFields.push(`customText${i}Answer`);
        }
        
        if (template[`customInt${i}State`]) {
          headers.push(template[`customInt${i}Question`] || `Number Question ${i}`);
          questionFields.push(`customInt${i}Answer`);
        }
        
        if (template[`customCheckbox${i}State`]) {
          headers.push(template[`customCheckbox${i}Question`] || `Checkbox Question ${i}`);
          questionFields.push(`customCheckbox${i}Answer`);
        }
      }
      
      // Prepare CSV content
      const csvContent = [
        headers.join(','),
        ...responses.map(response => {
          const row = [
            response.id,
            response.user?.name || 'Unknown',
            response.user?.email || 'No email',
            new Date(response.createdAt).toISOString()
          ];
          
          // Add answer values
          questionFields.forEach(field => {
            let value = response[field];
            
            // Format based on type
            if (value === undefined || value === null) {
              value = '';
            } else if (typeof value === 'boolean') {
              value = value ? 'Yes' : 'No';
            } else if (typeof value === 'string') {
              // Escape quotes and commas in strings
              value = `"${value.replace(/"/g, '""')}"`;
            }
            
            row.push(value);
          });
          
          return row.join(',');
        })
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${template.title.replace(/\s+/g, '_')}_responses.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export successful",
        description: "Responses have been exported to CSV",
        variant: "default"
      });
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      toast({
        title: "Export failed",
        description: "Failed to export responses. Please try again.",
        variant: "destructive"
      });
    }
  };

  const prepareCheckboxChartData = () => {
    if (!template || !aggregateData) return [];
    
    const data = [];
    
    for (let i = 1; i <= 4; i++) {
      const stateKey = `customCheckbox${i}State`;
      const questionKey = `customCheckbox${i}Question`;
      const yesKey = `checkbox${i}_yes_count`;
      
      if (template[stateKey] && aggregateData.total_responses > 0) {
        const yesCount = aggregateData[yesKey] || 0;
        const noCount = aggregateData.total_responses - yesCount;
        
        data.push({
          name: template[questionKey] || `Checkbox ${i}`,
          data: [
            { name: 'Yes', value: yesCount },
            { name: 'No', value: noCount }
          ]
        });
      }
    }
    
    return data;
  };

  const prepareNumberChartData = () => {
    if (!template || !aggregateData) return [];
    
    const numberData = [];
    
    for (let i = 1; i <= 4; i++) {
      const stateKey = `customInt${i}State`;
      const questionKey = `customInt${i}Question`;
      const avgKey = `avg_custom_int${i}`;
      
      if (template[stateKey] && aggregateData[avgKey] !== null) {
        numberData.push({
          question: template[questionKey] || `Number ${i}`,
          average: parseFloat(aggregateData[avgKey].toFixed(2))
        });
      }
    }
    
    return numberData;
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
            <Skeleton className="h-8 w-80" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-full max-w-md" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
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
            <Link href={`/admin/templates/${params.id}/edit`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">
            {template.title} <span className="text-muted-foreground">Responses</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchData} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={exportToCsv} variant="outline" size="sm" className="gap-2">
            <DownloadIcon className="h-4 w-4" />
            Export to CSV
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="responses" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="responses">Responses</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <TabsContent value="responses" className="mt-0">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Form Responses</CardTitle>
                <CardDescription>
                  Total responses: {responses.length}
                </CardDescription>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search responses..."
                    className="pl-8 w-full sm:w-[260px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setSortField('createdAt')}>
                      Date {sortField === 'createdAt' && (sortDirection === 'desc' ? '↓' : '↑')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortField('user.name')}>
                      Name {sortField === 'user.name' && (sortDirection === 'desc' ? '↓' : '↑')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')}>
                      {sortDirection === 'desc' ? 'Ascending' : 'Descending'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredResponses.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResponses.map((response) => (
                      <TableRow key={response.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{response.user?.name || 'Anonymous'}</span>
                            <span className="text-sm text-muted-foreground">{response.user?.email || 'No email'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            <span>{formatDate(response.createdAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            asChild
                          >
                            <Link href={`/admin/responses/${response.id}`}>
                              <Eye className="h-4 w-4 mr-1.5" />
                              View Details
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No responses found</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  {searchQuery
                    ? "No responses match your search criteria."
                    : "This template has not received any responses yet."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="analytics" className="mt-0">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Numeric questions chart */}
          <Card>
            <CardHeader>
              <CardTitle>Numeric Questions</CardTitle>
              <CardDescription>
                Average values for numeric responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[280px] w-full" />
              ) : aggregateData && prepareNumberChartData().length > 0 ? (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prepareNumberChartData()}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 70,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="question" 
                        angle={-45} 
                        textAnchor="end"
                        height={80}
                        interval={0}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="average" fill="#8884d8" name="Average Value" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <h3 className="text-base font-medium">No numeric data available</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    This template has no numeric questions or no responses yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Checkbox questions charts */}
          <Card>
            <CardHeader>
              <CardTitle>Yes/No Questions</CardTitle>
              <CardDescription>
                Distribution of checkbox answers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[280px] w-full" />
              ) : aggregateData && prepareCheckboxChartData().length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {prepareCheckboxChartData().map((questionData, index) => (
                    <div key={index} className="h-[280px]">
                      <h3 className="text-sm font-medium text-center mb-2">{questionData.name}</h3>
                      <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={questionData.data}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {questionData.data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} responses`, 'Count']} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <h3 className="text-base font-medium">No checkbox data available</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    This template has no checkbox questions or no responses yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Text response summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Text Response Summary</CardTitle>
            <CardDescription>
              Overview of text-based answers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : aggregateData ? (
              <div className="space-y-6">
                {/* Text fields summary */}
                <div className="space-y-4">
                  <h3 className="text-base font-medium">Short Text Fields</h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => {
                      const stateKey = `customString${i}State`;
                      const questionKey = `customString${i}Question`;
                      const countKey = `string${i}_count`;
                      
                      if (template[stateKey] && aggregateData[countKey] !== undefined) {
                        return (
                          <div key={i} className="border rounded-md p-4">
                            <h4 className="text-sm font-medium mb-1">{template[questionKey] || `Text Field ${i}`}</h4>
                            <div className="flex justify-between items-center">
                              <span className="text-2xl font-semibold">{aggregateData[countKey]}</span>
                              <span className="text-xs text-muted-foreground">responses</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
                
                {/* Long text fields summary */}
                <div className="space-y-4">
                  <h3 className="text-base font-medium">Long Text Fields</h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => {
                      const stateKey = `customText${i}State`;
                      const questionKey = `customText${i}Question`;
                      const countKey = `text${i}_count`;
                      
                      if (template[stateKey] && aggregateData[countKey] !== undefined) {
                        return (
                          <div key={i} className="border rounded-md p-4">
                            <h4 className="text-sm font-medium mb-1">{template[questionKey] || `Long Text ${i}`}</h4>
                            <div className="flex justify-between items-center">
                              <span className="text-2xl font-semibold">{aggregateData[countKey]}</span>
                              <span className="text-xs text-muted-foreground">responses</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <h3 className="text-base font-medium">No text response data available</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  This template has no text questions or no responses yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </DashboardLayout>
  );
}
