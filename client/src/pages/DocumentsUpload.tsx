import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import DocumentUpload from '@/components/DocumentUpload';
import DocumentList from '@/components/DocumentList';
import { 
  ArrowLeft,
  ArrowRight, 
  Upload, 
  FileText,
  CheckCircle,
  Clock,
  SkipForward,
  Mic,
  MessageSquare
} from 'lucide-react';
import { type OnboardingProgress } from '@shared/schema';

export default function DocumentsUpload() {
  const [, navigate] = useLocation();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: progress, refetch: refetchProgress } = useQuery<OnboardingProgress>({
    queryKey: ['/api/onboarding-progress'],
  });
  
  const handleSkip = async () => {
    try {
      // Mark this step as skipped but acknowledge it
      await fetch('/api/onboarding-progress', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ historicPricingUploaded: true }),
      });
      
      // Refetch progress
      refetchProgress();
      
      toast({
        title: 'Step skipped',
        description: 'You can always come back and upload documents later',
        variant: 'default',
      });
      
      // Navigate to next step
      navigate('/create-project');
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };
  
  const handleContinue = () => {
    navigate('/create-project');
  };
  
  const handleBack = () => {
    navigate('/standards-wizard');
  };
  
  const handleUploadComplete = async () => {
    setShowSuccessMessage(true);
    
    try {
      // Update onboarding progress
      await fetch('/api/onboarding-progress', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ historicPricingUploaded: true }),
      });
      
      // Refetch progress
      refetchProgress();
      
      toast({
        title: 'Documents uploaded successfully',
        description: 'Your documents are ready for estimation',
        variant: 'default',
      });
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };
  
  return (
    <div className="max-w-5xl mx-auto px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Material & Pricing Information</h1>
          <p className="text-slate-500 mt-2">
            Share your pricing information to help us create accurate estimates for your projects
          </p>
        </div>
        
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Clock className="h-4 w-4" /> 
          <span>Estimated time: 3 minutes</span>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-medium text-center mb-6">Choose how you want to add your pricing information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left column - Document Upload */}
          <Card>
            <CardHeader>
              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-center">Upload Documents</CardTitle>
              <CardDescription className="text-center">
                Share your invoices, receipts, and price lists
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border border-slate-200 p-3">
                  <div className="flex gap-3 items-start">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">Supplier Invoices</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Recent invoices from material suppliers with current prices.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-md border border-slate-200 p-3">
                  <div className="flex gap-3 items-start">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">Price Lists</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Any material price lists or catalogs showing current costs.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="px-3 pt-5 text-center">
                  <Button 
                    className="w-full"
                    onClick={() => setActiveTab('upload')}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Select Files to Upload
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right column - Voice & Chat Entry */}
          <Card>
            <CardHeader>
              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                  <Mic className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <CardTitle className="text-center">Voice & Chat Assistant</CardTitle>
              <CardDescription className="text-center">
                Tell us your pricing information directly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-lg border border-slate-200 p-4 flex gap-4 items-center">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Mic className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Voice Entry</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Simply speak and describe your typical material prices
                    </p>
                  </div>
                </div>
                
                <div className="rounded-lg border border-slate-200 p-4 flex gap-4 items-center">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Price Chat</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Chat with our assistant about material prices
                    </p>
                  </div>
                </div>
                
                <div className="px-3 pt-3 text-center">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setActiveTab('chat')}
                  >
                    Start Assistant
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Conditional Content Based on Selected Method */}
      {activeTab === 'upload' && (
        <>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Upload Pricing Documents</CardTitle>
              <CardDescription>
                Upload receipts, invoices, price sheets, or any documents with material costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentUpload onUploadComplete={handleUploadComplete} />
            </CardContent>
            {showSuccessMessage && (
              <CardFooter className="bg-green-50 border-t border-green-100">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800">Documents uploaded successfully!</h4>
                    <p className="text-sm text-green-700">
                      Your documents are now ready to be used for creating estimates.
                    </p>
                  </div>
                </div>
              </CardFooter>
            )}
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Documents</CardTitle>
              <CardDescription>
                View and manage your uploaded project documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentList />
            </CardContent>
          </Card>
        </>
      )}
      
      {activeTab === 'chat' && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Material Pricing Assistant</CardTitle>
            <CardDescription>
              Our assistant will help you provide pricing information through voice or chat
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[400px] flex flex-col items-center justify-center">
            <div className="text-center p-6 max-w-md">
              <Mic className="h-16 w-16 text-primary mx-auto mb-6" />
              <h3 className="text-xl font-semibold mb-3">Voice & Chat Entry</h3>
              <p className="text-slate-600 mb-6">
                This feature is coming soon! Our voice and chat assistants will make it easy to provide pricing 
                information without uploading documents.
              </p>
              <Button
                onClick={handleSkip}
                className="w-full"
              >
                Skip For Now & Continue
              </Button>
            </div>
          </CardContent>
          <CardFooter className="bg-amber-50 border-t border-amber-100 flex justify-between items-center">
            <div className="flex items-center text-amber-800">
              <SkipForward className="h-5 w-5 mr-2" />
              <p className="text-sm">
                You can always come back and add pricing information later.
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSkip}
            >
              Skip This Step
            </Button>
          </CardFooter>
        </Card>
      )}
      
      <div className="flex justify-between mt-8">
        <Button 
          variant="outline" 
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Standards
        </Button>
        
        <div className="space-x-4">
          <Button 
            variant="outline"
            onClick={handleSkip}
          >
            Skip for Now
            <SkipForward className="ml-2 h-4 w-4" />
          </Button>
          
          <Button 
            onClick={handleContinue}
            disabled={!progress?.historicPricingUploaded}
          >
            Continue to Estimate Creation
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}