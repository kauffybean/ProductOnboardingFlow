import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import StandardsWizard from "@/pages/StandardsWizard";
import ValidationDashboard from "@/pages/ValidationDashboard";
import EstimateDetail from "@/pages/EstimateDetail";
import DocumentsUpload from "@/pages/DocumentsUpload";
import CreateProject from "@/pages/CreateProject";
import OnboardingSidebar from "@/components/OnboardingSidebar";
import { useQuery } from "@tanstack/react-query";
import { type OnboardingProgress } from "@shared/schema";
import Header from "@/components/Header";

function Router() {
  const [location] = useLocation();
  const { data: progress } = useQuery<OnboardingProgress>({
    queryKey: ["/api/onboarding-progress"],
  });
  
  // Determine current step based on route
  const getCurrentStep = () => {
    if (location === '/') return 'welcome';
    if (location === '/standards-wizard') return 'company_standards';
    if (location === '/documents-upload') return 'upload_documents';
    if (location === '/create-estimate') return 'create_estimate';
    if (location === '/validation-dashboard') return 'validate_estimate';
    if (location === '/submit-bid') return 'submit_bid';
    return 'welcome';
  };

  // Check if all onboarding steps are complete to determine if we should show sidebar
  const isOnboardingComplete = progress && 
    progress.standardsSetupComplete && 
    progress.historicPricingUploaded && 
    progress.firstEstimateCreated && 
    progress.estimateValidated && 
    progress.firstBidSubmitted;
  
  // Don't show sidebar on estimate detail pages
  const isEstimateDetailPage = location.startsWith('/estimates/');
  const showSidebar = !isOnboardingComplete && !isEstimateDetailPage;
  
  // Check if we're on the base dashboard, which doesn't need a container
  const isBaseDashboard = location === '/';
  
  return (
    <div className="flex min-h-screen">
      {/* Onboarding Sidebar */}
      {showSidebar && (
        <OnboardingSidebar 
          progress={progress} 
          currentStep={getCurrentStep()} 
        />
      )}
      
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Header />
        
        <div className={`flex-1 ${!isBaseDashboard ? 'container mx-auto px-4 py-8 max-w-7xl' : ''} ${showSidebar ? 'pl-8' : ''}`}>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/standards-wizard" component={StandardsWizard} />
            <Route path="/validation-dashboard" component={ValidationDashboard} />
            <Route path="/estimates/:id" component={EstimateDetail} />
            <Route path="/documents-upload" component={DocumentsUpload} />
            <Route path="/create-project" component={CreateProject} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
