import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import ValidationPanel from "@/components/ValidationPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Check, AlertTriangle, User, 
  CheckCircle, Settings, UserPlus,
  Loader2, ArrowRight, FileBarChart,
  BarChart3
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function ValidationDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Query to fetch the latest estimate (assuming it's the first one)
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['/api/estimates'],
    queryFn: async () => {
      const estimates = await apiRequest('/api/estimates');
      // Get the most recent estimate
      if (Array.isArray(estimates) && estimates.length > 0) {
        const latestEstimate = estimates[0];
        // If we have an estimate, get its details
        if (latestEstimate && latestEstimate.id) {
          return apiRequest(`/api/estimates/${latestEstimate.id}`);
        }
      }
      return null;
    }
  });
  
  // Extract data
  const estimate = data?.estimate;
  const items = data?.items || [];
  const issues = data?.issues || [];
  
  // Create groups by category
  const categories = Array.from(new Set(items.map((item: any) => item.category)));
  const categoryTotals = categories.map((category) => {
    const categoryItems = items.filter((item: any) => item.category === category);
    const total = categoryItems.reduce((sum: number, item: any) => sum + item.totalPrice, 0);
    const hasIssues = issues.some((issue: any) => 
      issue.type === 'pricing_anomaly' && 
      categoryItems.some((item: any) => issue.description.includes(item.materialName))
    );
    return { category, total, hasIssues };
  });
  
  // Calculate totals
  const totalCost = estimate?.totalCost || 0;
  const totalArea = estimate?.totalArea || 0;
  const costPerSqFt = totalArea > 0 ? totalCost / totalArea : 0;
  
  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };
  
  // Confidence score (use from estimate or default)
  const confidenceScore = estimate?.confidenceScore || 84;
  
  // Helper function to determine confidence level color
  const getConfidenceColor = (score: number): string => {
    if (score >= 85) return "text-green-500 bg-green-50";
    if (score >= 65) return "text-amber-500 bg-amber-50";
    if (score >= 40) return "text-orange-500 bg-orange-50";
    return "text-red-500 bg-red-50";
  };
  
  const confidenceColorClass = getConfidenceColor(confidenceScore);
  const confidenceBgClass = confidenceColorClass.split(" ")[1];
  const confidenceTextClass = confidenceColorClass.split(" ")[0];
  
  // Ambiguities from validation issues
  const ambiguities = issues.filter((issue: any) => issue.type === 'ambiguity' && issue.status === 'open');
  
  // Standards from storage
  const { data: standardsData } = useQuery({
    queryKey: ['/api/company-standards'],
    queryFn: async () => {
      return apiRequest('/api/company-standards');
    }
  });
  
  const standards = standardsData || {};
  
  // Simulation for processing estimate
  const processEstimate = () => {
    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      setIsProcessing(false);
      
      // Navigate to estimate detail
      if (estimate?.id) {
        navigate(`/estimates/${estimate.id}`);
      } else {
        toast({
          title: "No estimate found",
          description: "Please create an estimate first",
          variant: "destructive",
        });
      }
    }, 2500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  if (!estimate) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Estimate Validation & Refinement Center</h1>
            <p className="mt-1 text-slate-600">Create a project to generate an estimate.</p>
          </div>
          
          <Card className="mb-6">
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <FileBarChart className="h-8 w-8 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold mb-2">No Estimate Available</h2>
              <p className="mb-6 text-slate-600 max-w-md mx-auto">
                You need to create a project first to generate an estimate for validation.
              </p>
              <Button onClick={() => navigate("/create-project")}>
                Create Your First Project
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Estimate Validation Dashboard</h1>
          <p className="mt-1 text-slate-600">Review your estimate and make necessary adjustments.</p>
        </div>

        {isProcessing ? (
          <Card className="mb-6">
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 relative mb-4">
                <BarChart3 className="h-8 w-8 text-blue-600 absolute inset-0 m-auto" />
                <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
              </div>
              <h2 className="text-xl font-bold mb-2">Processing Your Estimate</h2>
              <p className="mb-6 text-slate-600 max-w-md mx-auto">
                We're analyzing your project information and applying your defined standards...
              </p>
              <Progress value={65} className="max-w-md mx-auto h-2 mb-2" />
              <p className="text-sm text-slate-500">This usually takes 10-15 seconds</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Confidence Panel */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-6">
                    <div className={`rounded-full w-10 h-10 flex items-center justify-center ${confidenceColorClass}`}>
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div className="ml-3">
                      <span className="text-sm text-slate-600">Estimate Confidence</span>
                      <div className="flex items-center">
                        <span className={`text-2xl font-bold ${confidenceTextClass}`}>{confidenceScore}%</span>
                        <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${confidenceBgClass} ${confidenceTextClass}`}>
                          {confidenceScore >= 85 ? "Excellent" :
                           confidenceScore >= 65 ? "Good" :
                           confidenceScore >= 40 ? "Fair" : "Poor"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Materials Summary Table */}
                  <div className="border-t border-slate-200 pt-4 pb-2">
                    <h3 className="font-medium text-slate-900 mb-3">Estimate Summary by Category</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Total Cost</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categoryTotals.map(({ category, total, hasIssues }, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{category}</TableCell>
                            <TableCell className="text-right">{formatCurrency(total)}</TableCell>
                            <TableCell className="text-right">
                              {hasIssues ? (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700">Needs Review</Badge>
                              ) : (
                                <Badge variant="outline" className="bg-green-50 text-green-700">Approved</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-slate-50">
                          <TableCell className="font-bold">Total Estimate</TableCell>
                          <TableCell className="text-right font-bold">{formatCurrency(totalCost)}</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Applied Standards */}
                  <div className="border-t border-slate-200 pt-4 pb-2 mt-4">
                    <h3 className="font-medium text-slate-900 mb-3">Applied Company Standards</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {standards.drywallWasteFactor && (
                        <div className="bg-slate-50 rounded-md p-3 flex items-start">
                          <div className="text-green-500 mr-2">
                            <Check className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="block text-sm font-medium text-slate-900">Drywall Waste: {standards.drywallWasteFactor}%</span>
                            <span className="text-xs text-slate-500">(Company Standard)</span>
                          </div>
                        </div>
                      )}
                      
                      {standards.flooringInstallationMethod && (
                        <div className="bg-slate-50 rounded-md p-3 flex items-start">
                          <div className="text-green-500 mr-2">
                            <Check className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="block text-sm font-medium text-slate-900">
                              Flooring Method: {standards.flooringInstallationMethod}
                            </span>
                            <span className="text-xs text-slate-500">(Company Standard)</span>
                          </div>
                        </div>
                      )}
                      
                      {standards.standardCeilingHeight && (
                        <div className="bg-slate-50 rounded-md p-3 flex items-start">
                          <div className="text-green-500 mr-2">
                            <Check className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="block text-sm font-medium text-slate-900">
                              Ceiling Height: {standards.standardCeilingHeight}" AFF
                            </span>
                            <span className="text-xs text-slate-500">(Company Standard)</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ambiguities */}
                  {ambiguities.length > 0 && (
                    <div className="border-t border-slate-200 pt-4 pb-2 mt-4">
                      <h3 className="font-medium text-slate-900 mb-3">
                        Ambiguities Requiring Clarification ({ambiguities.length})
                      </h3>
                      <div className="space-y-4">
                        {ambiguities.map((issue: any, index: number) => (
                          <div key={index} className="bg-amber-50 rounded-md p-4">
                            <div className="flex items-start">
                              <div className="text-amber-500 mr-2">
                                <AlertTriangle className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <span className="block text-sm font-medium text-slate-900">{issue.description}</span>
                                <div className="mt-2 flex space-x-3">
                                  <Button variant="outline" size="sm">Clarify internally</Button>
                                  <Button variant="outline" size="sm">Delegate to SME</Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Action Panel */}
            <div>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium text-slate-900 mb-6">Actions</h3>
                  
                  <div className="space-y-4">
                    <Button 
                      className="w-full flex items-center justify-center" 
                      size="lg"
                      onClick={() => {
                        if (estimate?.id) {
                          navigate(`/estimates/${estimate.id}`);
                        }
                      }}
                    >
                      <Check className="mr-2 h-5 w-5" />
                      View Detailed Estimate
                    </Button>
                    
                    <Button 
                      className="w-full flex items-center justify-center" 
                      variant="outline" 
                      size="lg"
                      onClick={processEstimate}
                    >
                      <BarChart3 className="mr-2 h-5 w-5" />
                      Process Estimate
                    </Button>
                    
                    <Button 
                      className="w-full flex items-center justify-center" 
                      variant="outline" 
                      size="lg"
                      onClick={() => navigate("/standards-wizard")}
                    >
                      <Settings className="mr-2 h-5 w-5" />
                      Edit Standards
                    </Button>
                  </div>

                  <div className="mt-8">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Estimate Summary</h4>
                    <div className="bg-slate-50 rounded-md p-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600">Total Cost:</span>
                        <span className="font-medium text-slate-900">{formatCurrency(totalCost)}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600">Area:</span>
                        <span className="font-medium text-slate-900">{totalArea.toLocaleString()} sq ft</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600">Cost per sq ft:</span>
                        <span className="font-medium text-slate-900">{formatCurrency(costPerSqFt)}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-slate-200 mt-2">
                        <span className="text-slate-600">Last updated:</span>
                        <span className="font-medium text-slate-900">
                          {estimate?.updatedAt ? format(new Date(estimate.updatedAt), 'MMM d, h:mm a') : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
