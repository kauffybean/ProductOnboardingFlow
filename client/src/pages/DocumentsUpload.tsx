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
  MessageSquare,
  AlertCircle,
  Receipt,
  FileSpreadsheet,
  File
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { type OnboardingProgress } from '@shared/schema';

export default function DocumentsUpload() {
  const [, navigate] = useLocation();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [activeTab, setActiveTab] = useState('selection');
  const [showProcessingScreen, setShowProcessingScreen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: progress, refetch: refetchProgress } = useQuery<OnboardingProgress>({
    queryKey: ['/api/onboarding-progress'],
  });
  
  // Recommended document types
  const recommendedDocuments = [
    { 
      icon: <Receipt className="h-5 w-5 text-blue-600" />, 
      title: "Supplier Invoices", 
      description: "Recent invoices from material suppliers" 
    },
    { 
      icon: <FileSpreadsheet className="h-5 w-5 text-green-600" />, 
      title: "Price Catalogs", 
      description: "Supplier price sheets and catalogs" 
    },
    { 
      icon: <File className="h-5 w-5 text-purple-600" />, 
      title: "Job Quotes", 
      description: "Previous job quotes showing material costs" 
    },
    { 
      icon: <FileText className="h-5 w-5 text-orange-600" />, 
      title: "Purchase Orders", 
      description: "POs showing quantity and prices" 
    }
  ];
  
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
  
  const handleProcessDocuments = () => {
    setShowProcessingScreen(true);
    
    toast({
      title: 'Processing documents',
      description: 'Your documents are being analyzed for pricing information',
      variant: 'default',
    });
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
        description: 'Your documents are ready for processing',
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
      
      {activeTab === 'selection' && (
        <div className="mb-8">
          <h2 className="text-xl font-medium text-center mb-6">Choose how you want to add your pricing information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Document Upload Card */}
            <Card className="flex flex-col">
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
              <CardContent className="flex-grow">
                <div className="space-y-4">
                  {recommendedDocuments.slice(0, 2).map((doc, index) => (
                    <div key={index} className="rounded-md border border-slate-200 p-3">
                      <div className="flex gap-3 items-start">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                          {doc.icon}
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900">{doc.title}</h3>
                          <p className="text-sm text-slate-500 mt-1">
                            {doc.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-4 pb-6 flex-shrink-0">
                <Button 
                  className="w-full"
                  onClick={() => setActiveTab('upload')}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Continue with Upload
                </Button>
              </CardFooter>
            </Card>

            {/* Voice & Chat Entry Card */}
            <Card className="flex flex-col">
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
              <CardContent className="flex-grow">
                <div className="space-y-4">
                  <div className="rounded-md border border-slate-200 p-3">
                    <div className="flex gap-3 items-start">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Mic className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">Voice Entry</h3>
                        <p className="text-sm text-slate-500 mt-1">
                          Speak your material pricing information
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 pb-6 flex-shrink-0">
                <Button 
                  className="w-full" 
                  onClick={() => setActiveTab('chat')}
                >
                  <Mic className="mr-2 h-4 w-4" />
                  Continue with Assistant
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Recommended Documents Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Recommended Documents</CardTitle>
              <CardDescription>
                For best results, upload the following types of documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendedDocuments.map((doc, index) => (
                  <div key={index} className="flex items-start p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mr-4">
                      {doc.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">{doc.title}</h4>
                      <p className="text-xs text-slate-500">{doc.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Skip Option Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mr-4">
                  <SkipForward className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">Skip this step?</h3>
                  <p className="text-sm text-slate-600">
                    You can always come back and add pricing information later
                  </p>
                </div>
              </div>
              <Button 
                variant="outline"
                size="sm"
                onClick={handleSkip}
              >
                Skip For Now
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Document Upload Method */}
      {activeTab === 'upload' && (
        <>
          <div className="flex justify-start mb-4">
            <Button 
              variant="ghost" 
              onClick={() => setActiveTab('selection')}
              className="text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to options
            </Button>
          </div>
        
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Upload Pricing Documents</CardTitle>
              <CardDescription>
                Upload receipts, invoices, price sheets, or any documents with material costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-6 mb-6 text-center">
                <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="font-medium text-slate-700 mb-3">Upload Pricing Files</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Drag & drop or click to upload receipts, invoices, or price sheets
                </p>
                
                <div className="relative mx-auto max-w-xs">
                  <Input
                    type="file"
                    multiple
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleUploadComplete}
                  />
                  <Button variant="outline" className="w-full">
                    Select Files
                  </Button>
                </div>
                <p className="text-xs text-slate-400 mt-4">
                  Supports PDF, images, CAD files, Word and Excel documents
                </p>
              </div>
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
          
          {showProcessingScreen ? (
            <Card className="mb-8">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                  Processing Your Documents
                </CardTitle>
                <CardDescription>
                  We're extracting pricing information from your uploaded documents
                </CardDescription>
              </CardHeader>
              <CardContent className="py-8">
                <div className="max-w-md mx-auto text-center">
                  <div className="mb-6 relative">
                    <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                      <FileText className="h-10 w-10 text-blue-600" />
                    </div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Analyzing Your Pricing Information</h3>
                  <p className="text-slate-600 mb-6">
                    Our system is processing your pricing data. This information will be available for review shortly.
                  </p>
                  <Button
                    onClick={handleContinue}
                    className="mt-4 px-6"
                  >
                    Continue to Create Your First Project
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
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
              {showSuccessMessage && (
                <CardFooter className="border-t border-slate-200 pt-4 flex justify-center">
                  <Button 
                    onClick={handleProcessDocuments}
                    size="lg"
                    className="px-8"
                  >
                    Process Documents
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              )}
            </Card>
          )}
        </>
      )}
      
      {/* Voice & Chat Assistant Method */}
      {activeTab === 'chat' && (
        <>
          <div className="flex justify-start mb-4">
            <Button 
              variant="ghost" 
              onClick={() => setActiveTab('selection')}
              className="text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to options
            </Button>
          </div>
          
          {showProcessingScreen ? (
            <Card className="mb-8">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                  Processing Your Information
                </CardTitle>
                <CardDescription>
                  We're organizing the pricing information you've provided
                </CardDescription>
              </CardHeader>
              <CardContent className="py-8">
                <div className="max-w-md mx-auto text-center">
                  <div className="mb-6 relative">
                    <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                      <MessageSquare className="h-10 w-10 text-blue-600" />
                    </div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Creating Your Material Price Catalog</h3>
                  <p className="text-slate-600 mb-6">
                    We're processing the pricing information you've shared. This will be available for review shortly.
                  </p>
                  <Button
                    onClick={handleContinue}
                    className="mt-4 px-6"
                  >
                    Continue to Create Your First Project
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {!showSuccessMessage ? (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>Material Pricing Assistant</CardTitle>
                    <CardDescription>
                      Our assistant will help you provide pricing information through voice or chat
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="border-t border-slate-200 p-6 bg-slate-50">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 flex-grow">
                          <p className="text-slate-800">
                            Hi there! I'm your pricing assistant. I'll help you add material pricing information without uploading documents. Would you prefer to use voice or text chat?
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end mb-6">
                        <div className="bg-primary/10 rounded-lg p-4 shadow-sm border border-primary/20 max-w-[80%]">
                          <p className="text-slate-800">
                            Let's use text chat for now.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 mb-6">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 flex-grow">
                          <p className="text-slate-800">
                            Great! Let's get started. What types of materials do you typically use for your construction projects? For example, drywall, lumber, concrete, etc.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end mb-6">
                        <div className="bg-primary/10 rounded-lg p-4 shadow-sm border border-primary/20 max-w-[80%]">
                          <p className="text-slate-800">
                            We use drywall, lumber, concrete, insulation, and various flooring materials like vinyl and hardwood.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 mb-6">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 flex-grow">
                          <p className="text-slate-800">
                            Thanks! What are your typical costs for each of these materials?
                            <br/><br/>
                            Let's start with drywall. What's the average cost per sheet or square foot?
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end mb-6">
                        <div className="bg-primary/10 rounded-lg p-4 shadow-sm border border-primary/20 max-w-[80%]">
                          <p className="text-slate-800">
                            Standard 4x8 drywall sheets cost about $12 per sheet. For lumber, 2x4 studs are around $4.50 each. Concrete is about $125 per cubic yard.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 flex-grow">
                          <p className="text-slate-800">
                            Great information! What about your costs for insulation and flooring materials?
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border-t border-slate-200 flex items-center">
                      <Input
                        placeholder="Type your response..."
                        className="flex-grow mr-4"
                        value="Insulation is about $0.70 per square foot. Vinyl flooring costs $2.50 per sq ft, and hardwood is around $7 per sq ft."
                      />
                      <Button onClick={() => setShowSuccessMessage(true)}>
                        Send
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      Information Received
                    </CardTitle>
                    <CardDescription>
                      Your pricing information has been recorded
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-6">
                    <div className="max-w-md mx-auto text-center">
                      <h3 className="text-xl font-semibold mb-4">Ready to Process</h3>
                      <p className="text-slate-600 mb-6">
                        We've collected your pricing information. Click below to process this data and create your material price catalog.
                      </p>
                      <Button
                        onClick={handleProcessDocuments}
                        className="px-8"
                        size="lg"
                      >
                        Process Information
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </>
      )}
      
      {/* Only showing the footer buttons when not showing any processing screen */}
      {(!showSuccessMessage && activeTab === 'selection') && (
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
              Continue to Create Your First Project
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}