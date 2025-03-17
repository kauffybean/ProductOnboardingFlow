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
  ArrowRight,
  Clock
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

        {/* Onboarding Journey Cards with Clear CTAs */}
        <div className="grid grid-cols-1 gap-8 mb-12">
          {/* Step 1: Set Standards */}
          <Card 
            className={`border-2 transition duration-150 shadow-sm hover:shadow ${
              progress?.standardsSetupComplete 
                ? 'border-green-300 bg-green-50' 
                : 'border-primary hover:border-primary-600'
            }`}
          >
            <CardContent className="p-8">
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                
                <div className="flex-grow space-y-1">
                  <h3 className="text-xl font-semibold text-slate-800">Set Company Standards</h3>
                  <p className="text-slate-600">
                    Define your estimating standards to improve the accuracy of your bids.
                  </p>
                  <div className="flex items-center text-xs text-slate-500 mt-1">
                    <Clock className="h-3 w-3 mr-1" /> Estimated time: 2 min
                  </div>
                </div>
                
                <div className="flex-shrink-0 ml-auto">
                  {progress?.standardsSetupComplete ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Completed</span>
                    </div>
                  ) : (
                    <Button 
                      size="lg" 
                      onClick={handleStartStandards}
                      className="font-medium"
                    >
                      Start Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Step 2: Upload Documents */}
          <Card 
            className={`border-2 transition duration-150 shadow-sm hover:shadow ${
              progress?.historicPricingUploaded 
                ? 'border-green-300 bg-green-50' 
                : !progress?.standardsSetupComplete 
                  ? 'border-slate-200 opacity-60' 
                  : 'border-primary hover:border-primary-600'
            }`}
          >
            <CardContent className="p-8">
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                
                <div className="flex-grow space-y-1">
                  <h3 className="text-xl font-semibold text-slate-800">Upload Pricing Information</h3>
                  <p className="text-slate-600">
                    Add your historic pricing data and materials information for accurate estimates.
                  </p>
                  <div className="flex items-center text-xs text-slate-500 mt-1">
                    <Clock className="h-3 w-3 mr-1" /> Estimated time: 1 min
                  </div>
                </div>
                
                <div className="flex-shrink-0 ml-auto">
                  {progress?.historicPricingUploaded ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Completed</span>
                    </div>
                  ) : (
                    <Button 
                      size="lg" 
                      onClick={handleUploadDocuments}
                      disabled={!progress?.standardsSetupComplete}
                      className="font-medium"
                    >
                      {progress?.standardsSetupComplete ? "Continue" : "Next Step"} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Step 3: Create Estimate */}
          <Card 
            className={`border-2 transition duration-150 shadow-sm hover:shadow ${
              progress?.firstEstimateCreated 
                ? 'border-green-300 bg-green-50' 
                : (!progress?.standardsSetupComplete || !progress?.historicPricingUploaded) 
                  ? 'border-slate-200 opacity-60' 
                  : 'border-primary hover:border-primary-600'
            }`}
          >
            <CardContent className="p-8">
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                
                <div className="flex-grow space-y-1">
                  <h3 className="text-xl font-semibold text-slate-800">Create Your First Project</h3>
                  <p className="text-slate-600">
                    Start your first project with schematics and documents to generate an estimate.
                  </p>
                  <div className="flex items-center text-xs text-slate-500 mt-1">
                    <Clock className="h-3 w-3 mr-1" /> Estimated time: 2 min
                  </div>
                </div>
                
                <div className="flex-shrink-0 ml-auto">
                  {progress?.firstEstimateCreated ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Completed</span>
                    </div>
                  ) : (
                    <Button 
                      size="lg"
                      onClick={() => setShowEstimateCreation(true)} 
                      disabled={!progress?.standardsSetupComplete || !progress?.historicPricingUploaded}
                      className="font-medium"
                    >
                      {progress?.standardsSetupComplete && progress?.historicPricingUploaded ? "Start Project" : "Next Step"} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Add placeholder cards for the next steps that align with sidebar */}
          <Card className="border-2 border-slate-200 opacity-60">
            <CardContent className="p-8">
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-slate-400">4</span>
                </div>
                
                <div className="flex-grow space-y-1">
                  <h3 className="text-xl font-semibold text-slate-400">Validate Estimate</h3>
                  <p className="text-slate-400">
                    Review and validate your estimate against company standards.
                  </p>
                  <div className="flex items-center text-xs text-slate-400 mt-1">
                    <Clock className="h-3 w-3 mr-1" /> Estimated time: 2 min
                  </div>
                </div>
                
                <div className="flex-shrink-0 ml-auto">
                  <Button 
                    size="lg" 
                    disabled
                    variant="outline"
                    className="text-slate-400 border-slate-300"
                  >
                    Coming Soon <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-slate-200 opacity-60">
            <CardContent className="p-8">
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-slate-400">5</span>
                </div>
                
                <div className="flex-grow space-y-1">
                  <h3 className="text-xl font-semibold text-slate-400">Submit Bid</h3>
                  <p className="text-slate-400">
                    Finalize and submit your bid with confidence.
                  </p>
                  <div className="flex items-center text-xs text-slate-400 mt-1">
                    <Clock className="h-3 w-3 mr-1" /> Estimated time: 1 min
                  </div>
                </div>
                
                <div className="flex-shrink-0 ml-auto">
                  <Button 
                    size="lg" 
                    disabled
                    variant="outline"
                    className="text-slate-400 border-slate-300"
                  >
                    Coming Soon <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Show only estimates in progress during onboarding */}
        {showEstimateCreation && (
          <Card className="mb-10">
            <CardHeader>
              <CardTitle>Create Your First Project</CardTitle>
              <CardDescription>
                Upload project schematics and create an estimate based on your company standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EstimateCreation onCreationComplete={handleEstimateCreated} />
            </CardContent>
            <CardFooter className="bg-blue-50 border-t border-blue-100">
              <div className="text-sm text-blue-700">
                <p>
                  <strong>Tip:</strong> Your company standards will be automatically applied to optimize accuracy.
                </p>
              </div>
            </CardFooter>
          </Card>
        )}
        
        {/* Show minimal estimate list during onboarding */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Projects</CardTitle>
              <CardDescription>
                Track your construction project estimates here
              </CardDescription>
            </div>
            
            {!showEstimateCreation && (
              <Button 
                onClick={() => setShowEstimateCreation(true)}
                disabled={!progress?.standardsSetupComplete || !progress?.historicPricingUploaded}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <EstimateList />
          </CardContent>
        </Card>
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
