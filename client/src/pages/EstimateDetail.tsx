import React, { useEffect, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import ValidationPanel from '@/components/ValidationPanel';
import { 
  FileBarChart, 
  Clock, 
  CheckCircle2, 
  Send,
  AlertCircle,
  ArrowLeft,
  Loader2,
  BarChart3,
  Plus,
  InfoIcon,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  RotateCcw,
  Users,
  ArrowRight,
  CircleCheck,
  Percent,
  FileSearch,
  FileQuestion,
  ClipboardCheck,
  FileText,
  Edit,
  Check,
  X,
  Download,
  FileUp,
  ExternalLink,
  Clipboard,
  Sparkles,
  ChevronsUpDown,
  Calculator,
  CalendarClock,
  History,
  Maximize2,
  Eye,
  EyeOff,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function EstimateDetail() {
  const [, params] = useRoute('/estimates/:id');
  const estimateId = params?.id ? parseInt(params.id, 10) : 0;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, navigate] = useLocation();
  
  // State for the onboarding tour
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const totalOnboardingSteps = 5;

  // State for editable items
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editedQuantity, setEditedQuantity] = useState<string | null>(null);
  const [editedUnitPrice, setEditedUnitPrice] = useState<string | null>(null);
  const [editingStandard, setEditingStandard] = useState<boolean>(false);
  const [selectedStandard, setSelectedStandard] = useState<string | null>(null);
  
  // State for item details panel
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [showDetailsPanel, setShowDetailsPanel] = useState<boolean>(false);
  
  // State for review modal
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  
  // State for tracking reviewed items
  const [reviewedItems, setReviewedItems] = useState<number[]>([]);
  
  // Mock data for applied standards until we have a real endpoint
  const mockAppliedStandards = [
    {
      id: '1',
      source: 'Company Standard: Drywall',
      description: 'Applied waste factor of 15% for drywall materials.'
    },
    {
      id: '2',
      source: 'Company Standard: Flooring',
      description: 'Applied waste factor of 10% for flooring materials.'
    },
    {
      id: '3',
      source: 'Company Standard: HVAC',
      description: 'Selected preferred HVAC brand (Carrier) as specified in company standards.'
    }
  ];
  
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['/api/estimates', estimateId],
    queryFn: async () => {
      if (!estimateId) return null;
      const response = await apiRequest(`/api/estimates/${estimateId}`);
      return await response.json();
    },
    enabled: !!estimateId,
  });
  
  const validateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(`/api/estimates/${estimateId}/validate`, {
        method: 'POST',
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/estimates', estimateId] });
      
      toast({
        title: 'Validation Started',
        description: 'Validation process started successfully',
        variant: 'default',
      });
      
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to start validation: ${error}`,
        variant: 'destructive',
      });
    },
  });
  
  const submitMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(`/api/estimates/${estimateId}/submit`, {
        method: 'POST',
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/estimates', estimateId] });
      queryClient.invalidateQueries({ queryKey: ['/api/onboarding-progress'] });
      
      toast({
        title: 'Success',
        description: 'Estimate submitted successfully',
        variant: 'default',
      });
      
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to submit estimate: ${error}`,
        variant: 'destructive',
      });
    },
  });
  
  const handleValidate = () => {
    validateMutation.mutate();
  };
  
  const handleSubmit = () => {
    submitMutation.mutate();
  };
  
  const estimate = data?.estimate;
  const items = data?.items || [];
  const issues = data?.issues || [];
  
  // Initialize confidence score from data or start at 75
  const [confidenceScore, setConfidenceScore] = useState<number>(75);
  
  // Update confidence score when estimate changes
  useEffect(() => {
    if (estimate) {
      setConfidenceScore(estimate.confidenceScore || 75);
    }
  }, [estimate]);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'validating':
        return <Badge variant="secondary">Validating</Badge>;
      case 'validated':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Validated</Badge>;
      case 'submitted':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Submitted</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileBarChart className="h-5 w-5 text-slate-400" />;
      case 'validating':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'validated':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'submitted':
        return <Send className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-slate-400" />;
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };
  
  // Handle item editing
  const handleEditItem = (item: any) => {
    setEditingItemId(item.id);
    setEditedQuantity(item.quantity.toString());
    setEditedUnitPrice(item.unitPrice.toString());
  };
  
  const handleSaveItem = (item: any) => {
    // In a real app, this would make an API call
    toast({
      title: "Item Updated",
      description: `Updated ${item.materialName} successfully`,
    });
    
    setEditingItemId(null);
    setEditedQuantity(null);
    setEditedUnitPrice(null);
    
    // Update confidence score when an item is reviewed
    if (!reviewedItems.includes(item.id)) {
      setReviewedItems([...reviewedItems, item.id]);
      const newScore = Math.min(95, confidenceScore + Math.floor(Math.random() * 3) + 1);
      setConfidenceScore(newScore);
      
      toast({
        title: "Confidence Score Updated",
        description: `Confidence score increased to ${newScore}%`,
      });
    }
  };
  
  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditedQuantity(null);
    setEditedUnitPrice(null);
  };
  
  // Open details panel when item is selected
  useEffect(() => {
    if (selectedItem) {
      setShowDetailsPanel(true);
    }
  }, [selectedItem]);
  
  // Get confidence score color
  const getConfidenceScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 80) return "text-emerald-500";
    if (score >= 70) return "text-blue-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };
  
  // Handle export to PDF
  const handleExportToPdf = () => {
    toast({
      title: "Exporting PDF",
      description: "Your estimate is being exported to PDF format",
    });
    // In a real app, this would trigger a download
  };
  
  // Handle review estimate
  const handleReviewEstimate = () => {
    setShowReviewModal(true);
  };
  
  if (isLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center pt-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!estimate) {
    return (
      <div className="w-full mt-8">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Estimate Not Found</h2>
              <p className="text-slate-500 mb-6">The estimate you are looking for does not exist or has been deleted.</p>
              <Link to="/">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link to="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{estimate.name}</h1>
          <div className="ml-2">
            {getStatusBadge(estimate.status)}
          </div>
        </div>
        
        <div className="space-x-2">
          {estimate.status === 'draft' && (
            <Button 
              onClick={handleValidate}
              disabled={validateMutation.isPending}
            >
              {validateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Validate Estimate
                </>
              )}
            </Button>
          )}
          
          {estimate.status === 'validated' && (
            <div className="flex space-x-2">
              <Button 
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Estimate
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  // Navigate to the standards wizard to restart the demo
                  navigate('/standards-wizard');
                  
                  // Show a message to the user
                  toast({
                    title: 'Demo Reset',
                    description: 'The demo has been reset. You can start over from the beginning.',
                    variant: 'default',
                  });
                }}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Restart Demo
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Prominent Confidence Score Card */}
      <Card className={`mb-6 ${confidenceScore >= 95 ? 'bg-green-50' : confidenceScore >= 85 ? 'bg-emerald-50' : confidenceScore >= 75 ? 'bg-blue-50' : confidenceScore >= 65 ? 'bg-amber-50' : 'bg-red-50'}`}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="mr-6">
                <div className="relative w-24 h-24">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="10"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={
                        confidenceScore >= 95 ? '#10b981' : 
                        confidenceScore >= 85 ? '#059669' : 
                        confidenceScore >= 75 ? '#3b82f6' : 
                        confidenceScore >= 65 ? '#f59e0b' : 
                        '#ef4444'
                      }
                      strokeWidth="10"
                      strokeDasharray={`${confidenceScore * 2.83}, 283`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-3xl font-bold ${getConfidenceScoreColor(confidenceScore)}`}>
                      {confidenceScore}%
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Estimate Confidence Score</h3>
                <p className="text-sm text-slate-600 max-w-md">
                  {confidenceScore >= 95 
                    ? 'Perfect! Your estimate is ready for review and submission.' 
                    : confidenceScore >= 85 
                    ? 'Great! Your estimate is in good shape with a few minor areas to check.' 
                    : confidenceScore >= 75 
                    ? 'Good progress. Review highlighted items to improve confidence.' 
                    : confidenceScore >= 65 
                    ? 'Several items need attention before this estimate is ready.' 
                    : 'Multiple issues need to be addressed for this estimate to be valid.'}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium mb-2">Target: &gt;95% confidence</span>
              <div className="space-y-2">
                {confidenceScore >= 95 ? (
                  <Button onClick={handleReviewEstimate} className="w-full md:w-auto">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Review Final Estimate
                  </Button>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Button onClick={handleReviewEstimate} variant="outline" className="w-full md:w-auto" disabled>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Review Final Estimate
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Achieve 95% confidence to proceed</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {confidenceScore < 95 && (
                  <Button variant="ghost" className="text-xs w-full md:w-auto">
                    <InfoIcon className="mr-2 h-3 w-3" />
                    How to Improve Score
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-medium text-slate-500">Total Cost</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-primary"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(estimate.totalCost)}</div>
            <p className="text-xs text-slate-500 mt-1">
              {estimate.status === 'validated' ? '✓ Validated' : estimate.status === 'draft' ? 'Draft estimate' : 'Final cost'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-medium text-slate-500">Project Type</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-primary"
            >
              <path d="M3 21h18M3 10h18M3 7h18M3 4h18" />
              <path d="M4 21V4" />
              <path d="M20 21V4" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{estimate.projectType}</div>
            <p className="text-xs text-slate-500 mt-1">
              Construction project type
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-medium text-slate-500">Total Area</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-primary"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estimate.totalArea.toLocaleString()} <span className="text-base text-slate-500">sq ft</span></div>
            <p className="text-xs text-slate-500 mt-1">
              Total project square footage
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-medium text-slate-500">Cost per Sq Ft</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-primary"
            >
              <path d="M20.2 7.8l-7.7 7.7-4-4-5.7 5.7" />
              <path d="M15 7h6v6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(estimate.totalCost / estimate.totalArea)}
              <span className="text-base text-slate-500"> / sq ft</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {estimate.confidenceScore >= 80 ? '✓ Within market range' : 'Calculated unit cost'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="materials">
        <TabsList>
          <TabsTrigger value="materials">Materials & Costs</TabsTrigger>
          <TabsTrigger value="validation">Validation & Standards</TabsTrigger>
        </TabsList>
        
        <TabsContent value="materials" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Estimate Items</CardTitle>
              <Button size="sm" disabled={estimate.status === 'submitted'}>
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-lg font-medium">No materials added yet</p>
                  <p className="text-sm">Add materials to this estimate to see them here</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material/Description</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Group items by category */}
                    {Array.from(new Set(items.map(item => item.category))).map(category => {
                      const categoryItems = items.filter(item => item.category === category);
                      const categoryTotal = categoryItems.reduce((sum, item) => sum + item.totalPrice, 0);
                      
                      return (
                        <React.Fragment key={category}>
                          {/* Category row */}
                          <TableRow className="bg-slate-50">
                            <TableCell colSpan={4} className="font-semibold">
                              {category}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(categoryTotal)}
                            </TableCell>
                            <TableCell className="text-right">
                              {/* Status indicator based on validation */}
                              {issues.some(issue => 
                                issue.type === 'pricing_anomaly' && 
                                categoryItems.some(item => issue.description.includes(item.materialName))
                              ) ? (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700">
                                  Pending
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                  Approved
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                          
                          {/* Item rows */}
                          {categoryItems.map(item => {
                            const needsReview = issues.some(issue => issue.description.includes(item.materialName));
                            
                            return (
                              <TableRow 
                                key={item.id} 
                                className={`border-b-0 cursor-pointer hover:bg-slate-50 ${needsReview ? 'bg-amber-50/30' : ''}`}
                                onClick={() => setSelectedItem(item)}
                              >
                                <TableCell className="pl-8">
                                  <div className="font-medium flex items-center">
                                    {item.materialName}
                                    {needsReview && (
                                      <Badge variant="outline" className="bg-amber-50 text-amber-700 ml-2">
                                        Needs Review
                                      </Badge>
                                    )}
                                  </div>
                                  {item.description && (
                                    <div className="text-xs text-slate-500">{item.description}</div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">
                                      {item.quantity.toLocaleString()}
                                    </div>
                                    {item.wasteFactor && (
                                      <div className="text-xs text-slate-500">
                                        Includes {item.wasteFactor}% waste factor
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>{item.unit}</TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">
                                      {formatCurrency(item.unitPrice)}
                                    </div>
                                    {item.priceSource && (
                                      <div className="text-xs text-slate-500">
                                        From {item.priceSource}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="font-medium">{formatCurrency(item.totalPrice)}</div>
                                  <div className="text-xs text-slate-500">
                                    {((item.totalPrice / estimate.totalCost) * 100).toFixed(1)}% of total
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  {needsReview ? (
                                    <div className="space-y-1">
                                      <Badge variant="outline" className="bg-amber-50 text-amber-700">
                                        Review
                                      </Badge>
                                    </div>
                                  ) : (
                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                      ✓ Approved
                                    </Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                  <tfoot>
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right font-semibold">Total Estimate:</td>
                      <td className="px-4 py-3 text-right font-semibold text-lg">{formatCurrency(estimate.totalCost)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="validation" className="mt-4">
          <ValidationPanel 
            estimateId={estimateId}
            issues={issues}
            confidenceScore={estimate.confidenceScore}
            onRefresh={refetch}
            appliedStandards={estimate.status !== 'draft' ? mockAppliedStandards : []}
          />
        </TabsContent>
      </Tabs>
      
      {estimate.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{estimate.notes}</p>
          </CardContent>
        </Card>
      )}
      
      <div className="text-sm text-slate-500">
        Created: {format(new Date(estimate.createdAt), 'MMMM d, yyyy')} &middot; Last updated: {format(new Date(estimate.updatedAt), 'MMMM d, yyyy')}
      </div>
      
      {/* Review Estimate Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Review Final Estimate</DialogTitle>
            <DialogDescription>
              Review your estimate before exporting as PDF for submission.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="p-6 mb-4 rounded-lg border border-green-100 bg-green-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="mr-4 bg-white p-2 rounded-full">
                    <CircleCheck className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-green-800">Estimate Ready for Submission</h2>
                    <p className="text-sm text-green-700">All items have been reviewed and the estimate is ready for export</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-700">{confidenceScore}%</div>
                  <div className="text-sm text-green-600">Confidence Score</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-green-700 font-medium">Project</div>
                  <div className="font-bold text-green-900">{estimate.name}</div>
                </div>
                <div>
                  <div className="text-green-700 font-medium">Total Estimate</div>
                  <div className="font-bold text-green-900">{formatCurrency(estimate.totalCost)}</div>
                </div>
                <div>
                  <div className="text-green-700 font-medium">Project Type</div>
                  <div className="font-bold text-green-900 capitalize">{estimate.projectType}</div>
                </div>
                <div>
                  <div className="text-green-700 font-medium">Cost per Sq Ft</div>
                  <div className="font-bold text-green-900">{formatCurrency(estimate.totalCost / estimate.totalArea)}</div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-base font-medium mb-2">Applied Company Standards</h3>
              <div className="space-y-2">
                {mockAppliedStandards.map(standard => (
                  <div key={standard.id} className="flex items-start p-3 rounded-md border border-blue-100 bg-blue-50">
                    <Sparkles className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                      <div className="font-medium text-blue-700">{standard.source}</div>
                      <div className="text-sm text-blue-600">{standard.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-base font-medium">Summary by Category</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">% of Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from(new Set(items.map(item => item.category))).map(category => {
                    const categoryItems = items.filter(item => item.category === category);
                    const categoryTotal = categoryItems.reduce((sum, item) => sum + item.totalPrice, 0);
                    const percentage = (categoryTotal / estimate.totalCost) * 100;
                    
                    return (
                      <TableRow key={category}>
                        <TableCell className="font-medium">{category}</TableCell>
                        <TableCell className="text-right">{formatCurrency(categoryTotal)}</TableCell>
                        <TableCell className="text-right">{percentage.toFixed(1)}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <tfoot>
                  <tr>
                    <td className="px-4 py-2 font-bold">Total</td>
                    <td className="px-4 py-2 text-right font-bold">{formatCurrency(estimate.totalCost)}</td>
                    <td className="px-4 py-2 text-right font-bold">100%</td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewModal(false)}>
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
            <Button onClick={handleExportToPdf}>
              <Download className="mr-2 h-4 w-4" />
              Export to PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Material Details Panel */}
      <div className={`fixed ${showDetailsPanel ? 'block' : 'hidden'} z-50 inset-0 bg-black/20`}>
        <div className="grid grid-cols-1 lg:grid-cols-5 h-full">
          <div className="col-span-3">
            {/* Main content remains visible but darkened */}
          </div>
          
          {/* Fly-out panel takes 2/5 of screen width on desktop */}
          <div className="col-span-2 bg-white shadow-xl h-full overflow-y-auto">
            {selectedItem && (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between border-b p-4">
                  <div>
                    <h2 className="text-xl font-bold">Material Details: {selectedItem.materialName}</h2>
                    <p className="text-sm text-slate-500">Detailed information and calculations for this material</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      setShowDetailsPanel(false);
                      setSelectedItem(null);
                    }}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="font-medium text-lg mb-3">Description</h3>
                    <p className="text-slate-700">{selectedItem.description || 'Standard ' + selectedItem.materialName + ' for ' + estimate.projectType + ' project'}</p>
                  </div>
                  
                  <Separator />
                  
                  {/* Source Information */}
                  <div>
                    <h3 className="font-medium text-lg mb-3">Source Information</h3>
                    <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <FileSearch className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-700">RFP Source</span>
                      </div>
                      <p className="mb-2 text-slate-700 text-sm">Page 14, Section 3.2: Materials Requirements</p>
                      <div className="bg-white border-l-4 border-blue-400 p-3 text-slate-600 text-sm italic">
                        "All {selectedItem.materialName.toLowerCase()} must be sufficient grade for {estimate.projectType.toLowerCase()} use with a minimum of {Math.round(selectedItem.quantity * 100 / (100 + (selectedItem.wasteFactor || 0)))} {selectedItem.unit} required for the project."
                      </div>
                    </div>
                    
                    {selectedItem.priceSource && (
                      <div className="bg-slate-50 border border-slate-200 rounded-md p-4 mt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-5 w-5 text-slate-600" />
                          <span className="font-medium text-slate-700">Pricing Source</span>
                        </div>
                        <p className="text-slate-600 text-sm">
                          Base unit price pulled from {selectedItem.priceSource}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  {/* Calculations */}
                  <div>
                    <h3 className="font-medium text-lg mb-3">Calculations</h3>
                    <div className="space-y-3">
                      <div className="bg-slate-50 rounded-md p-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-600 font-medium">Base Quantity (RFP):</span>
                          <span className="font-semibold">{Math.round(selectedItem.quantity * 100 / (100 + (selectedItem.wasteFactor || 0))).toLocaleString()} {selectedItem.unit}</span>
                        </div>
                        <p className="text-xs text-slate-500">Source: Extracted from RFP documentation</p>
                      </div>
                      
                      {selectedItem.wasteFactor && (
                        <div className="bg-blue-50 rounded-md p-3">
                          <div className="flex justify-between mb-1">
                            <span className="text-blue-700 font-medium">Waste Factor Applied:</span>
                            <span className="font-semibold text-blue-800">{selectedItem.wasteFactor}%</span>
                          </div>
                          <div className="flex justify-between mt-2">
                            <span className="text-blue-700 text-sm">Additional material:</span>
                            <span className="text-blue-800 font-medium">
                              {Math.round(selectedItem.quantity - (selectedItem.quantity * 100 / (100 + selectedItem.wasteFactor))).toLocaleString()} {selectedItem.unit}
                            </span>
                          </div>
                          <p className="text-xs text-blue-600 mt-1">Based on company standards for {selectedItem.category}</p>
                        </div>
                      )}
                      
                      <div className="bg-green-50 rounded-md p-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-green-700 font-medium">Final Quantity:</span>
                          <span className="font-semibold text-green-800">{selectedItem.quantity.toLocaleString()} {selectedItem.unit}</span>
                        </div>
                        <p className="text-xs text-green-600">Includes waste factor and adjustments from schematic calculations</p>
                      </div>
                      
                      <div className="bg-slate-50 rounded-md p-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-600 font-medium">Unit Price:</span>
                          <span className="font-semibold">{formatCurrency(selectedItem.unitPrice)}</span>
                        </div>
                        <p className="text-xs text-slate-500">Source: {selectedItem.priceSource || 'Standard market price'}</p>
                      </div>
                      
                      <div className="bg-green-50 rounded-md p-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-green-700 font-medium">Total Cost:</span>
                          <span className="font-bold text-green-800">{formatCurrency(selectedItem.totalPrice)}</span>
                        </div>
                        <p className="text-xs text-green-600">
                          {((selectedItem.totalPrice / estimate.totalCost) * 100).toFixed(1)}% of total estimate value
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Applied Standards */}
                  <div>
                    <h3 className="font-medium text-lg mb-3">Applied Standards</h3>
                    {selectedItem.wasteFactor ? (
                      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-md p-4">
                        <Sparkles className="h-6 w-6 text-blue-500 mt-1" />
                        <div>
                          <h4 className="font-medium text-blue-700">Company Standard: {selectedItem.category} Waste Factor</h4>
                          <p className="text-sm text-blue-600 mt-1">
                            A {selectedItem.wasteFactor}% waste factor has been automatically applied based on 
                            company standards for {selectedItem.category.toLowerCase()}. This accounts for cutting waste, 
                            damaged materials, and safety margin.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-500 text-sm border border-slate-200 rounded-md p-4 bg-slate-50">
                        No company standards have been applied to this material.
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  {/* Comments */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-lg">Comments</h3>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Comment
                      </Button>
                    </div>
                    
                    <div className="text-slate-500 text-sm border border-slate-200 rounded-md p-4 bg-slate-50">
                      No comments have been added to this item yet.
                    </div>
                  </div>
                  
                  {/* Validation Issues */}
                  {issues.some(issue => issue.description.includes(selectedItem.materialName)) && (
                    <>
                      <Separator />
                      
                      <div>
                        <h3 className="font-medium text-lg mb-3 text-amber-700">Validation Issues</h3>
                        <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                          <div className="flex items-start gap-2 mb-2">
                            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-amber-700">Pricing Anomaly Detected</h4>
                              <p className="text-sm text-amber-600 mt-1">
                                The unit price for {selectedItem.materialName} is 15% higher than the standard market rate for similar projects.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="border-t p-4 bg-slate-50 flex items-center justify-between">
                  <div>
                    {issues.some(issue => issue.description.includes(selectedItem.materialName)) ? (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Needs Review
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        <Check className="h-3 w-3 mr-1" />
                        Approved
                      </Badge>
                    )}
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline" onClick={() => {
                      setShowDetailsPanel(false);
                      setSelectedItem(null);
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={() => handleEditItem(selectedItem)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Item
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Onboarding overlay */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-0 relative overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <FileText className="h-7 w-7 mr-3" />
                  <h2 className="text-xl font-bold">Welcome to your Estimate Dashboard</h2>
                </div>
                <Button 
                  variant="ghost" 
                  className="text-white hover:bg-white/20 hover:text-white -mt-2 -mr-2"
                  onClick={() => setShowOnboarding(false)}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
              <p className="mt-1 max-w-lg">Let's take a quick tour of your newly generated estimate</p>
              
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center">
                  <span className="inline-flex items-center justify-center rounded-full h-8 w-8 bg-white text-blue-600 font-semibold mr-2">
                    {onboardingStep}
                  </span>
                  <span>Step {onboardingStep} of {totalOnboardingSteps}</span>
                </div>
                <div className="w-32">
                  <Progress value={(onboardingStep / totalOnboardingSteps) * 100} className="h-2" />
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {onboardingStep === 1 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-blue-500" />
                    Overview Dashboard
                  </h3>
                  <p className="mb-4">Your estimate has been automatically generated based on the documents you uploaded and your company standards.</p>
                  
                  <div className="border rounded-md p-4 mb-4 bg-slate-50">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      <strong>Key information:</strong><br/>
                      • Total cost is calculated based on extracted measurements<br/>
                      • Applied standard waste factors and pricing formulas<br/>
                      • Materials are organized by category for easy review<br/>
                      • Automatic validations identify potential issues for review
                    </p>
                  </div>
                </div>
              )}
              
              {onboardingStep === 2 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center">
                    <Percent className="mr-2 h-5 w-5 text-blue-500" />
                    Confidence Score
                  </h3>
                  <p className="mb-4">Each estimate includes a confidence score showing the accuracy and reliability of the cost calculations.</p>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-green-50 border border-green-200 rounded-md p-3 flex-1">
                      <span className="font-semibold text-green-800 flex items-center">
                        <CircleCheck className="h-4 w-4 mr-1" />
                        High Confidence (80%+)
                      </span>
                      <p className="text-sm text-green-700 mt-1">Prices and quantities have been verified against multiple data points.</p>
                    </div>
                    
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex-1">
                      <span className="font-semibold text-amber-800 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Medium Confidence (50-79%)
                      </span>
                      <p className="text-sm text-amber-700 mt-1">Some calculations require verification against industry standards.</p>
                    </div>
                  </div>
                </div>
              )}
              
              {onboardingStep === 3 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center">
                    <FileSearch className="mr-2 h-5 w-5 text-blue-500" />
                    Material Categories
                  </h3>
                  <p className="mb-4">Materials are automatically organized by categories making it easy to review and adjust quantities.</p>
                  
                  <div className="border rounded-md p-4 mb-4 bg-slate-50">
                    <div className="flex items-center justify-between mb-2 p-2 bg-white rounded border">
                      <div className="font-semibold">Drywall & Framing</div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">Approved</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">Materials are nested under each category. Click on a category to see detailed items.</p>
                    <p className="text-sm text-slate-700">
                      <strong>Benefits:</strong><br/>
                      • Organized view helps with quick navigation<br/>
                      • Subtotals calculated for each category<br/>
                      • Visual indicators show validation status
                    </p>
                  </div>
                </div>
              )}
              
              {onboardingStep === 4 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center">
                    <FileQuestion className="mr-2 h-5 w-5 text-blue-500" />
                    Real-time Validation
                  </h3>
                  <p className="mb-4">The system automatically validates all line items without requiring a manual validation button.</p>
                  
                  <div className="border rounded-md p-4 mb-4 bg-amber-50 border-amber-200">
                    <h4 className="font-semibold text-amber-800 mb-1">Line Item Validation</h4>
                    <ul className="text-sm text-amber-700 space-y-2">
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Items with validation issues are highlighted and flagged for review</span>
                      </li>
                      <li className="flex items-start">
                        <ArrowRight className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Click on a flagged item to see detailed validation information</span>
                      </li>
                      <li className="flex items-start">
                        <CircleCheck className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Resolve issues in the flyout panel to increase confidence score</span>
                      </li>
                    </ul>
                  </div>
                  
                  <p className="text-sm text-slate-600">
                    No need to manually validate - the confidence score updates automatically as you review and fix issues.
                  </p>
                </div>
              )}
              
              {onboardingStep === 5 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center">
                    <ClipboardCheck className="mr-2 h-5 w-5 text-blue-500" />
                    Final Review & Export
                  </h3>
                  <p className="mb-4">Once your confidence score reaches 95% or higher, you can review and export your estimate.</p>
                  
                  <div className="border rounded-md p-4 mb-4 bg-green-50 border-green-200">
                    <h4 className="font-semibold text-green-800 mb-1">Final Review Process</h4>
                    <ul className="text-sm text-green-700 space-y-2">
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Review comprehensive estimate summary with category breakdowns</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>See all applied company standards in one consolidated view</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Export final estimate as a professional PDF document</span>
                      </li>
                      <li className="flex items-start">
                        <ArrowRight className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Track and manage all estimates from the dashboard</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
                    <div className="flex items-start">
                      <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                      <div className="text-sm text-blue-700">
                        <p className="font-medium mb-1">Pro Tip</p>
                        <p>The "Review Final Estimate" button becomes available once your confidence score reaches 95% or higher. Focus on resolving flagged items to increase your score.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between mt-6">
                {onboardingStep > 1 ? (
                  <Button 
                    variant="outline"
                    onClick={() => setOnboardingStep(prev => Math.max(1, prev - 1))}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                ) : (
                  <div></div>
                )}
                
                {onboardingStep < totalOnboardingSteps ? (
                  <Button
                    onClick={() => setOnboardingStep(prev => Math.min(totalOnboardingSteps, prev + 1))}
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => setShowOnboarding(false)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Get Started
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}