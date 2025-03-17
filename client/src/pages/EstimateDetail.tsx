import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function EstimateDetail() {
  const [, params] = useRoute('/estimates/:id');
  const estimateId = params?.id ? parseInt(params.id, 10) : 0;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
      return apiRequest(`/api/estimates/${estimateId}`);
    },
    enabled: !!estimateId,
  });
  
  const validateMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/estimates/${estimateId}/validate`, {
        method: 'POST',
      });
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
      return await apiRequest(`/api/estimates/${estimateId}/submit`, {
        method: 'POST',
      });
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
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'validating':
        return <Badge variant="secondary">Validating</Badge>;
      case 'validated':
        return <Badge variant="success">Validated</Badge>;
      case 'submitted':
        return <Badge variant="primary">Submitted</Badge>;
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
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-slate-500">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(estimate.totalCost)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-slate-500">Project Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold capitalize">{estimate.projectType}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-slate-500">Total Area</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{estimate.totalArea.toLocaleString()} <span className="text-lg text-slate-500">sq ft</span></div>
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
                      <TableHead>Material</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.materialName}</TableCell>
                        <TableCell>{item.quantity.toLocaleString()}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.totalPrice)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <tfoot>
                    <tr>
                      <td colSpan={4} className="px-4 py-2 text-right font-medium">Total:</td>
                      <td className="px-4 py-2 text-right font-medium">{formatCurrency(estimate.totalCost)}</td>
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
    </div>
  );
}