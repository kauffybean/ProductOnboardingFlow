import { useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Send, 
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'wouter';

export default function EstimateList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: estimates = [], isLoading } = useQuery({
    queryKey: ['/api/estimates'],
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to load estimates: ${error}`,
        variant: 'destructive',
      });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (estimateId: number) => {
      return await apiRequest(`/api/estimates/${estimateId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/estimates'] });
      
      toast({
        title: 'Success',
        description: 'Estimate deleted successfully',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete estimate: ${error}`,
        variant: 'destructive',
      });
    },
  });
  
  const validateMutation = useMutation({
    mutationFn: async (estimateId: number) => {
      return await apiRequest(`/api/estimates/${estimateId}/validate`, {
        method: 'POST',
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/estimates'] });
      
      toast({
        title: 'Validation Started',
        description: `Validation process started with confidence score: ${data.confidenceScore}%`,
        variant: 'default',
      });
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
    mutationFn: async (estimateId: number) => {
      return await apiRequest(`/api/estimates/${estimateId}/submit`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/estimates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/onboarding-progress'] });
      
      toast({
        title: 'Success',
        description: 'Estimate submitted successfully',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to submit estimate: ${error}`,
        variant: 'destructive',
      });
    },
  });
  
  const handleDelete = (estimateId: number) => {
    if (confirm('Are you sure you want to delete this estimate?')) {
      deleteMutation.mutate(estimateId);
    }
  };
  
  const handleValidate = (estimateId: number) => {
    validateMutation.mutate(estimateId);
  };
  
  const handleSubmit = (estimateId: number) => {
    submitMutation.mutate(estimateId);
  };
  
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
        return <FileText className="h-4 w-4 text-slate-400" />;
      case 'validating':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'validated':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'submitted':
        return <Send className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-slate-400" />;
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };
  
  const sortedEstimates = useMemo(() => {
    return [...estimates].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [estimates]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Estimates</CardTitle>
      </CardHeader>
      <CardContent>
        {estimates.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium">No estimates created yet</p>
            <p className="text-sm">Create your first estimate to get started</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Area (sq ft)</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEstimates.map((estimate) => (
                <TableRow key={estimate.id}>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {getStatusIcon(estimate.status)}
                      {getStatusBadge(estimate.status)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link to={`/estimates/${estimate.id}`} className="hover:underline text-primary">
                      {estimate.name}
                    </Link>
                  </TableCell>
                  <TableCell className="capitalize">{estimate.projectType}</TableCell>
                  <TableCell>{estimate.totalArea.toLocaleString()}</TableCell>
                  <TableCell>{formatCurrency(estimate.totalCost)}</TableCell>
                  <TableCell>
                    {estimate.confidenceScore !== null ? (
                      <div className="flex items-center gap-1">
                        <span>{estimate.confidenceScore}%</span>
                        <div 
                          className="h-2 w-16 bg-slate-200 rounded-full overflow-hidden"
                          title={`${estimate.confidenceScore}% confidence`}
                        >
                          <div 
                            className={`h-full ${
                              estimate.confidenceScore >= 90 ? 'bg-green-500' : 
                              estimate.confidenceScore >= 80 ? 'bg-green-400' :
                              estimate.confidenceScore >= 70 ? 'bg-amber-400' : 'bg-red-500'
                            }`}
                            style={{ width: `${estimate.confidenceScore}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>{format(new Date(estimate.createdAt), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {estimate.status === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleValidate(estimate.id)}
                          disabled={validateMutation.isPending && validateMutation.variables === estimate.id}
                        >
                          {validateMutation.isPending && validateMutation.variables === estimate.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>Validate</>
                          )}
                        </Button>
                      )}
                      
                      {estimate.status === 'validated' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSubmit(estimate.id)}
                          disabled={submitMutation.isPending && submitMutation.variables === estimate.id}
                        >
                          {submitMutation.isPending && submitMutation.variables === estimate.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>Submit</>
                          )}
                        </Button>
                      )}
                      
                      {estimate.status !== 'submitted' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(estimate.id)}
                          disabled={deleteMutation.isPending && deleteMutation.variables === estimate.id}
                        >
                          {deleteMutation.isPending && deleteMutation.variables === estimate.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-red-500" />
                          )}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}