import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  AlertCircle, 
  CheckCircle, 
  ClipboardCheck, 
  UserCheck,
  Loader2,
  HelpCircle,
  Settings
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type ValidationIssue = {
  id: number;
  type: string;
  status: string;
  description: string;
  resolution: string | null;
  assignedTo: string | null;
  estimateId: number;
  createdAt: string;
  updatedAt: string;
};

type AppliedStandard = {
  id: string;
  description: string;
  source: string;
};

type ValidationPanelProps = {
  estimateId: number;
  issues: ValidationIssue[];
  confidenceScore: number | null;
  onRefresh: () => void;
  appliedStandards?: AppliedStandard[];
};

export default function ValidationPanel({ 
  estimateId, 
  issues, 
  confidenceScore, 
  onRefresh,
  appliedStandards = []
}: ValidationPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeIssueId, setActiveIssueId] = useState<number | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [assignee, setAssignee] = useState('');
  const [resolutionMethod, setResolutionMethod] = useState<'resolve' | 'delegate'>('resolve');
  
  // Count issues by status
  const openIssues = issues.filter(i => i.status === 'open');
  const pendingIssues = issues.filter(i => i.status === 'pending_review');
  const resolvedIssues = issues.filter(i => i.status === 'resolved');
  
  // Progress percentage
  const totalIssues = issues.length;
  const progress = totalIssues === 0 ? 100 : (resolvedIssues.length / totalIssues) * 100;
  
  // Get active issue
  const activeIssue = issues.find(i => i.id === activeIssueId) || null;
  
  // Resolution mutation
  const resolveMutation = useMutation({
    mutationFn: async (issueId: number) => {
      const payload = resolutionMethod === 'resolve' 
        ? { resolution: resolutionText }
        : { resolution: `Delegated to ${assignee}`, assignedTo: assignee };
      
      return await apiRequest(`/api/validation-issues/${issueId}/resolve`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/estimates', estimateId] });
      
      toast({
        title: 'Success',
        description: resolutionMethod === 'resolve' 
          ? 'Issue resolved successfully' 
          : 'Issue delegated successfully',
        variant: 'default',
      });
      
      // Reset form
      setResolutionText('');
      setAssignee('');
      setActiveIssueId(null);
      
      // Refresh the estimate data
      onRefresh();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to resolve issue: ${error}`,
        variant: 'destructive',
      });
    },
  });
  
  const handleResolveIssue = () => {
    if (!activeIssueId) return;
    
    if (resolutionMethod === 'resolve' && !resolutionText.trim()) {
      toast({
        title: 'Missing Resolution',
        description: 'Please provide a resolution description',
        variant: 'destructive',
      });
      return;
    }
    
    if (resolutionMethod === 'delegate' && !assignee.trim()) {
      toast({
        title: 'Missing Assignee',
        description: 'Please select who to delegate this issue to',
        variant: 'destructive',
      });
      return;
    }
    
    resolveMutation.mutate(activeIssueId);
  };
  
  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'ambiguity':
        return <HelpCircle className="h-5 w-5 text-amber-500" />;
      case 'standards_deviation':
        return <Settings className="h-5 w-5 text-red-500" />;
      case 'pricing_anomaly':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-slate-400" />;
    }
  };
  
  const getIssueTitle = (type: string): string => {
    switch (type) {
      case 'ambiguity':
        return 'Specification Ambiguity';
      case 'standards_deviation':
        return 'Standards Deviation';
      case 'pricing_anomaly':
        return 'Pricing Anomaly';
      default:
        return type.replace(/_/g, ' ');
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Validation Review</CardTitle>
            <CardDescription>
              Review and resolve validation issues to finalize this estimate
            </CardDescription>
          </div>
          
          {confidenceScore !== null && (
            <div className="text-right">
              <div className="text-sm text-slate-500 mb-1">Confidence Score</div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">
                  {confidenceScore}%
                </span>
                <div className="w-24 h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      confidenceScore >= 90 ? 'bg-green-500' : 
                      confidenceScore >= 80 ? 'bg-green-400' :
                      confidenceScore >= 70 ? 'bg-amber-400' : 'bg-red-500'
                    }`}
                    style={{ width: `${confidenceScore}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium">
              Validation Progress: {resolvedIssues.length} of {totalIssues} issues resolved
            </div>
            <div className="text-sm text-slate-500">
              {progress.toFixed(0)}%
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent>
        {issues.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-green-800">No validation issues found</h4>
              <p className="text-sm text-green-700 mt-1">
                Your estimate meets all company standards and requirements.
              </p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="open" className="mt-2">
            <TabsList className="mb-4">
              <TabsTrigger value="open" className="relative">
                Open Issues
                {openIssues.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {openIssues.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="pending" className="relative">
                Pending Review
                {pendingIssues.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingIssues.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="resolved" className="relative">
                Resolved
                {resolvedIssues.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {resolvedIssues.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="standards">
                Applied Standards
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs rounded-full px-2 py-0.5">
                  {appliedStandards.length}
                </span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="open">
              <div className="space-y-4">
                {openIssues.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-300" />
                    <p>No open issues</p>
                  </div>
                ) : (
                  openIssues.map(issue => (
                    <Alert 
                      key={issue.id} 
                      className={`cursor-pointer transition-colors ${
                        activeIssueId === issue.id ? 'bg-slate-50' : ''
                      } hover:bg-slate-50`}
                      onClick={() => {
                        setActiveIssueId(issue.id === activeIssueId ? null : issue.id);
                        setResolutionText('');
                        setAssignee('');
                        setResolutionMethod('resolve');
                      }}
                    >
                      <div className="flex gap-2">
                        {getIssueIcon(issue.type)}
                        <div>
                          <AlertTitle>{getIssueTitle(issue.type)}</AlertTitle>
                          <AlertDescription>{issue.description}</AlertDescription>
                        </div>
                      </div>
                      
                      {activeIssueId === issue.id && (
                        <div className="mt-4 pl-7 border-t pt-4">
                          <RadioGroup 
                            value={resolutionMethod} 
                            onValueChange={(value) => setResolutionMethod(value as 'resolve' | 'delegate')}
                            className="mb-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="resolve" id="resolve" />
                              <Label htmlFor="resolve" className="font-medium">Resolve Myself</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="delegate" id="delegate" />
                              <Label htmlFor="delegate" className="font-medium">Delegate to Team Member</Label>
                            </div>
                          </RadioGroup>
                          
                          {resolutionMethod === 'resolve' ? (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="resolution">Resolution</Label>
                                <Textarea
                                  id="resolution"
                                  placeholder="Explain how you resolved this issue..."
                                  value={resolutionText}
                                  onChange={(e) => setResolutionText(e.target.value)}
                                  rows={3}
                                />
                              </div>
                              
                              <Button 
                                onClick={handleResolveIssue}
                                disabled={resolveMutation.isPending}
                                className="w-full"
                              >
                                {resolveMutation.isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Resolving...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Mark as Resolved
                                  </>
                                )}
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="assignee">Assign To</Label>
                                <Select
                                  value={assignee}
                                  onValueChange={setAssignee}
                                >
                                  <SelectTrigger id="assignee">
                                    <SelectValue placeholder="Select team member" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="john.doe@example.com">John Doe (Project Manager)</SelectItem>
                                    <SelectItem value="sarah.smith@example.com">Sarah Smith (Architect)</SelectItem>
                                    <SelectItem value="mike.jones@example.com">Mike Jones (Estimator)</SelectItem>
                                    <SelectItem value="lisa.chen@example.com">Lisa Chen (Engineer)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <Button 
                                onClick={handleResolveIssue}
                                disabled={resolveMutation.isPending || !assignee}
                                className="w-full"
                              >
                                {resolveMutation.isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Delegating...
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Delegate Issue
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </Alert>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="pending">
              <div className="space-y-4">
                {pendingIssues.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-300" />
                    <p>No pending issues</p>
                  </div>
                ) : (
                  pendingIssues.map(issue => (
                    <Alert key={issue.id} className="border-amber-200 bg-amber-50">
                      <div className="flex gap-2">
                        {getIssueIcon(issue.type)}
                        <div>
                          <AlertTitle>{getIssueTitle(issue.type)}</AlertTitle>
                          <AlertDescription className="mb-1">{issue.description}</AlertDescription>
                          
                          {issue.assignedTo && (
                            <div className="flex items-center gap-1 text-sm text-amber-700 mt-2">
                              <UserCheck className="h-4 w-4" />
                              <span>Delegated to {issue.assignedTo}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Alert>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="resolved">
              <div className="space-y-4">
                {resolvedIssues.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-300" />
                    <p>No resolved issues yet</p>
                  </div>
                ) : (
                  resolvedIssues.map(issue => (
                    <Alert key={issue.id} className="border-green-200 bg-green-50">
                      <div className="flex gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <AlertTitle>{getIssueTitle(issue.type)}</AlertTitle>
                          <AlertDescription className="mb-1">{issue.description}</AlertDescription>
                          
                          <div className="mt-2 pt-2 border-t border-green-200">
                            <h5 className="text-sm font-medium text-green-800">Resolution:</h5>
                            <p className="text-sm text-green-700">{issue.resolution}</p>
                            
                            {issue.assignedTo && (
                              <div className="flex items-center gap-1 text-sm text-green-700 mt-2">
                                <UserCheck className="h-4 w-4" />
                                <span>Resolved by {issue.assignedTo}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Alert>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="standards">
              <div className="space-y-4">
                {appliedStandards.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <ClipboardCheck className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>No standards applied yet</p>
                  </div>
                ) : (
                  appliedStandards.map(standard => (
                    <div 
                      key={standard.id} 
                      className="border border-blue-200 bg-blue-50 rounded-md p-4"
                    >
                      <div className="flex gap-2">
                        <ClipboardCheck className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-blue-800">{standard.source}</h4>
                          <p className="text-sm text-blue-700 mt-1">{standard.description}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}