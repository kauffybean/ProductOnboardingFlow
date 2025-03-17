import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import OnboardingChecklist from "@/components/OnboardingChecklist";
import DocumentUpload from "@/components/DocumentUpload";
import DocumentList from "@/components/DocumentList";
import EstimateList from "@/components/EstimateList";
import EstimateCreation from "@/components/EstimateCreation";
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronRight, 
  FileText, 
  Calculator, 
  Gauge, 
  Plus, 
  Upload 
} from "lucide-react";
import { type OnboardingProgress } from "@shared/schema";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [showEstimateCreation, setShowEstimateCreation] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);

  // Fetch onboarding progress
  const { data: progress, isLoading: progressLoading } = useQuery<OnboardingProgress>({
    queryKey: ["/api/onboarding-progress"],
  });

  const handleStartStandards = () => {
    navigate("/standards-wizard");
  };
  
  const handleEstimateCreated = (estimateId: number) => {
    setShowEstimateCreation(false);
    navigate(`/estimates/${estimateId}`);
  };
  
  const handleDocumentUploaded = () => {
    setShowDocumentUpload(false);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Welcome to Assembli!</h1>
          <p className="mt-1 text-slate-600">
            Your construction estimator platform with built-in validation and standards
          </p>
        </div>

        {/* Onboarding Checklist */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Onboarding Checklist</h2>
            {progressLoading ? (
              <div className="animate-pulse flex space-y-4 flex-col">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              </div>
            ) : (
              <OnboardingChecklist progress={progress} />
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card 
            className="border border-slate-200 transition duration-150 hover:border-primary shadow-sm hover:shadow cursor-pointer" 
            onClick={handleStartStandards}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-slate-800">Set Company Standards</div>
                <div className="text-primary">
                  <Gauge className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Define your estimating standards to speed up and improve the accuracy of your bids.
              </p>
            </CardContent>
          </Card>
          
          <Card 
            className="border border-slate-200 transition duration-150 hover:border-primary shadow-sm hover:shadow cursor-pointer" 
            onClick={() => setShowDocumentUpload(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-slate-800">Upload Documents</div>
                <div className="text-primary">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Upload schematics, pricing sheets, and material lists for your projects.
              </p>
            </CardContent>
          </Card>
          
          <Card 
            className="border border-slate-200 transition duration-150 hover:border-primary shadow-sm hover:shadow cursor-pointer" 
            onClick={() => setShowEstimateCreation(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-slate-800">Create New Estimate</div>
                <div className="text-primary">
                  <Calculator className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Create a new estimate based on your documents and company standards.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="estimates" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="estimates">Estimates</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="estimates">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">Your Estimates</h2>
              <Button onClick={() => setShowEstimateCreation(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Estimate
              </Button>
            </div>
            
            {showEstimateCreation ? (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Create New Estimate</CardTitle>
                  <CardDescription>
                    Create an estimate based on your project details and uploaded documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EstimateCreation onCreationComplete={handleEstimateCreated} />
                </CardContent>
              </Card>
            ) : null}
            
            <EstimateList />
          </TabsContent>
          
          <TabsContent value="documents">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">Your Documents</h2>
              <Button onClick={() => setShowDocumentUpload(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>
            
            {showDocumentUpload ? (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Upload Document</CardTitle>
                  <CardDescription>
                    Upload schematics, pricing sheets, or material lists for your projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentUpload onUploadComplete={handleDocumentUploaded} />
                </CardContent>
              </Card>
            ) : null}
            
            <DocumentList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
