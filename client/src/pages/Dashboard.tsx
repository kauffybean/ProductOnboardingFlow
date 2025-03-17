import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import EstimateList from "@/components/EstimateList";
import EstimateCreation from "@/components/EstimateCreation";
import DocumentList from "@/components/DocumentList";
import DocumentUpload from "@/components/DocumentUpload";
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronRight, 
  FileText, 
  Calculator, 
  Gauge, 
  Plus, 
  Upload,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { type OnboardingProgress } from "@shared/schema";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [showEstimateCreation, setShowEstimateCreation] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [showInitialHelp, setShowInitialHelp] = useState(true);

  // Fetch onboarding progress
  const { data: progress, isLoading: progressLoading } = useQuery<OnboardingProgress>({
    queryKey: ["/api/onboarding-progress"],
  });

  // Close initial help messaging on first interaction
  useEffect(() => {
    const hasInteracted = localStorage.getItem('hasInteracted');
    if (hasInteracted) {
      setShowInitialHelp(false);
    }
  }, []);

  const handleCloseHelp = () => {
    localStorage.setItem('hasInteracted', 'true');
    setShowInitialHelp(false);
  };

  const handleStartStandards = () => {
    navigate("/standards-wizard");
  };
  
  const handleUploadDocuments = () => {
    navigate("/documents-upload");
  };
  
  const handleEstimateCreated = (estimateId: number) => {
    setShowEstimateCreation(false);
    navigate(`/estimates/${estimateId}`);
  };
  
  const handleDocumentUploaded = () => {
    setShowDocumentUpload(false);
  };
  
  // Determine if onboarding is complete
  const isOnboardingComplete = progress && 
    progress.standardsSetupComplete && 
    progress.historicPricingUploaded && 
    progress.firstEstimateCreated && 
    progress.estimateValidated && 
    progress.firstBidSubmitted;
  
  // Return different dashboard based on onboarding status
  
  // 1. Initial Onboarding Dashboard
  if (!isOnboardingComplete) {
    return (
      <div className="py-6 px-4 md:px-0">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome to Assembli!</h1>
            <p className="mt-2 text-slate-600">
              Your all-in-one platform for creating and managing construction estimates
            </p>
          </div>
        </div>

        {showInitialHelp && (
          <Card className="mb-8 bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex gap-4 items-start">
                <div className="p-2 bg-blue-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold text-blue-900 mb-1">Let's get you set up in just 5 minutes</h2>
                  <p className="text-blue-700 mb-4">
                    Follow these steps to configure your estimator and start creating accurate estimates for your projects.
                  </p>
                  
                  <ol className="space-y-3 list-decimal list-inside">
                    <li className="text-blue-700">Set up your company's estimation standards (2 min)</li>
                    <li className="text-blue-700">Upload sample project documents (1 min)</li>
                    <li className="text-blue-700">Create your first estimate (2 min)</li>
                  </ol>
                </div>
                
                <div className="ml-auto">
                  <Button onClick={handleCloseHelp} variant="ghost" size="sm">
                    Dismiss
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Onboarding Journey Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card 
            className={`border transition duration-150 shadow-sm hover:shadow cursor-pointer ${progress?.standardsSetupComplete ? 'border-green-300 bg-green-50' : 'border-slate-200 hover:border-primary'}`}
            onClick={handleStartStandards}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-slate-800">Step 1: Set Standards</div>
                <div className={progress?.standardsSetupComplete ? "text-green-500" : "text-primary"}>
                  {progress?.standardsSetupComplete ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Gauge className="h-5 w-5" />
                  )}
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Define your estimating standards to improve the accuracy of your bids.
              </p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs text-slate-500">2 min</span>
                {progress?.standardsSetupComplete ? (
                  <span className="text-xs text-green-600 font-medium">Completed</span>
                ) : (
                  <Button size="sm" variant="outline">
                    {progress?.standardsSetupComplete ? "Review" : "Start"} <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className={`border transition duration-150 shadow-sm hover:shadow cursor-pointer ${
              !progress?.standardsSetupComplete ? 'opacity-60 pointer-events-none' : 
              progress?.historicPricingUploaded ? 'border-green-300 bg-green-50' : 'border-slate-200 hover:border-primary'
            }`} 
            onClick={handleUploadDocuments}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-slate-800">Step 2: Upload Documents</div>
                <div className={progress?.historicPricingUploaded ? "text-green-500" : "text-primary"}>
                  {progress?.historicPricingUploaded ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <FileText className="h-5 w-5" />
                  )}
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Upload schematics, pricing sheets, and material lists for your projects.
              </p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs text-slate-500">1 min</span>
                {progress?.historicPricingUploaded ? (
                  <span className="text-xs text-green-600 font-medium">Completed</span>
                ) : (
                  <Button size="sm" variant="outline" disabled={!progress?.standardsSetupComplete}>
                    Start <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className={`border transition duration-150 shadow-sm hover:shadow cursor-pointer ${
              (!progress?.standardsSetupComplete || !progress?.historicPricingUploaded) ? 'opacity-60 pointer-events-none' : 
              progress?.firstEstimateCreated ? 'border-green-300 bg-green-50' : 'border-slate-200 hover:border-primary'
            }`} 
            onClick={() => setShowEstimateCreation(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-slate-800">Step 3: Create Estimate</div>
                <div className={progress?.firstEstimateCreated ? "text-green-500" : "text-primary"}>
                  {progress?.firstEstimateCreated ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Calculator className="h-5 w-5" />
                  )}
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Create a new estimate based on your documents and company standards.
              </p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs text-slate-500">2 min</span>
                {progress?.firstEstimateCreated ? (
                  <span className="text-xs text-green-600 font-medium">Completed</span>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    disabled={!progress?.standardsSetupComplete || !progress?.historicPricingUploaded}
                  >
                    Start <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Area for Estimates & Documents */}
        <Tabs defaultValue="estimates" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="estimates">Estimates</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="estimates">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">Your Estimates</h2>
              <Button 
                onClick={() => setShowEstimateCreation(true)}
                disabled={!progress?.standardsSetupComplete || !progress?.historicPricingUploaded}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Estimate
              </Button>
            </div>
            
            {showEstimateCreation ? (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Create Your First Estimate</CardTitle>
                  <CardDescription>
                    Let's create your first estimate based on your standards and documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EstimateCreation onCreationComplete={handleEstimateCreated} />
                </CardContent>
                <CardFooter className="bg-blue-50 border-t border-blue-100">
                  <div className="text-sm text-blue-700">
                    <p>
                      <strong>Tip:</strong> This estimate will be created using your company standards and uploaded documents.
                    </p>
                  </div>
                </CardFooter>
              </Card>
            ) : null}
            
            <EstimateList />
          </TabsContent>
          
          <TabsContent value="documents">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">Your Documents</h2>
              <Button onClick={() => navigate('/documents-upload')}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Documents
              </Button>
            </div>
            
            <DocumentList />
          </TabsContent>
        </Tabs>
      </div>
    );
  }
  
  // 2. Post-Onboarding Dashboard (Project-Based)
  return (
    <div className="py-6 px-4 md:px-0">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Your Projects</h1>
          <p className="mt-2 text-slate-600">
            Track and manage your active construction projects
          </p>
        </div>
        
        <div>
          <Button onClick={() => setShowEstimateCreation(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-4 pt-5">
            <div className="text-sm text-slate-500 mb-1">Active Projects</div>
            <div className="text-3xl font-bold text-slate-800">3</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 pt-5">
            <div className="text-sm text-slate-500 mb-1">Pending Validation</div>
            <div className="text-3xl font-bold text-amber-500">2</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 pt-5">
            <div className="text-sm text-slate-500 mb-1">Submitted Bids</div>
            <div className="text-3xl font-bold text-blue-500">5</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 pt-5">
            <div className="text-sm text-slate-500 mb-1">Total Value</div>
            <div className="text-3xl font-bold text-slate-800">$1.2M</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active Projects</TabsTrigger>
          <TabsTrigger value="pending">Pending Validation</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <EstimateList />
          
          {showEstimateCreation && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Create New Project</CardTitle>
                <CardDescription>
                  Create a new construction project estimate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EstimateCreation onCreationComplete={handleEstimateCreated} />
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Validation</CardTitle>
              <CardDescription>
                Projects that need validation or have validation issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-slate-500">Select a project to view validation issues</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Projects</CardTitle>
              <CardDescription>
                Projects that have been validated and submitted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-slate-500">Your completed projects will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-900">Project Documents</h2>
            <Button onClick={() => navigate('/documents-upload')}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Documents
            </Button>
          </div>
          
          <DocumentList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
