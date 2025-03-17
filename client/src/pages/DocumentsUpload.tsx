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
import DocumentUpload from '@/components/DocumentUpload';
import DocumentList from '@/components/DocumentList';
import { 
  ArrowLeft,
  ArrowRight, 
  Upload, 
  FileText,
  CheckCircle,
  Clock
} from 'lucide-react';
import { type OnboardingProgress } from '@shared/schema';

export default function DocumentsUpload() {
  const [, navigate] = useLocation();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: progress, refetch: refetchProgress } = useQuery<OnboardingProgress>({
    queryKey: ['/api/onboarding-progress'],
  });
  
  const handleContinue = () => {
    navigate('/create-estimate');
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
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Upload Project Documents</h1>
          <p className="text-slate-500 mt-2">
            Upload your project schematics, drawings, and price sheets to create accurate estimates
          </p>
        </div>
        
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Clock className="h-4 w-4" /> 
          <span>Estimated time: 3 minutes</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Upload Documents</CardTitle>
            <CardDescription>
              Upload schematics, pricing sheets, or material lists for your projects
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
            <CardTitle>What to Upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border border-slate-200 p-3">
              <div className="flex gap-3 items-start">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">Schematics & Drawings</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Floor plans, elevations, and technical drawings in PDF or image formats.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="rounded-md border border-slate-200 p-3">
              <div className="flex gap-3 items-start">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">Price Sheets</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Material price lists or supplier pricing documentation.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="rounded-md border border-slate-200 p-3">
              <div className="flex gap-3 items-start">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">Material Lists</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Bills of materials or quantity takeoffs from previous projects.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
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
      
      <div className="flex justify-between mt-8">
        <Button 
          variant="outline" 
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Standards
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
  );
}