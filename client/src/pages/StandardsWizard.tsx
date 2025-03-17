import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

import Header from "@/components/Header";
import ProgressIndicator from "@/components/ProgressIndicator";
import StandardsForm from "@/components/StandardsForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check, ArrowRight, ChevronRight, Pencil, Building, Home, Hammer } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import {
  criticalStandardsSchema,
  advancedStandardsSchema,
  fullStandardsSchema,
  commercialStandardsSchema,
  residentialStandardsSchema,
  renovationStandardsSchema,
  fullCommercialStandardsSchema,
  fullResidentialStandardsSchema,
  fullRenovationStandardsSchema,
  type CriticalStandards,
  type AdvancedStandards,
  type FullStandards,
  type CommercialStandards,
  type ResidentialStandards,
  type RenovationStandards,
  type FullCommercialStandards,
  type FullResidentialStandards,
  type FullRenovationStandards,
  type CompanyStandards
} from "@shared/schema";

// Helper function to convert form values to display text
const getDisplayText = (key: string, value: any): string => {
  const displayMap: Record<string, Record<string, string>> = {
    flooringInstallationMethod: {
      adhesive: "Adhesive",
      floating: "Floating",
      nailed: "Nailed",
      "glue-down": "Glue-Down"
    },
    preferredHvacBrand: {
      carrier: "Carrier",
      trane: "Trane",
      lennox: "Lennox",
      daikin: "Daikin"
    },
    drywallFinishLevel: {
      level3: "Level 3",
      level4: "Level 4",
      level5: "Level 5"
    },
    paintFinishStandard: {
      flat: "Flat",
      eggshell: "Eggshell",
      satin: "Satin",
      "semi-gloss": "Semi-Gloss",
      gloss: "Gloss"
    },
    wallFramingStandard: {
      "wood-16oc": "Wood Stud 16\" OC",
      "metal-16oc": "Metal Stud 16\" OC",
      "metal-24oc": "Metal Stud 24\" OC"
    },
    doorMaterialStandard: {
      hollow: "Hollow-core",
      solid: "Solid-core",
      "fire-rated": "Fire-Rated"
    },
    ceilingTileBrand: {
      armstrong: "Armstrong",
      usg: "USG",
      certainteed: "CertainTeed"
    },
    restroomFixtureBrand: {
      kohler: "Kohler",
      toto: "Toto",
      "american-standard": "American Standard"
    }
  };

  // Special cases for percentage values and measurements
  if (key === "drywallWasteFactor" || key === "flooringWasteFactor") {
    return `${value}%`;
  } else if (key === "standardCeilingHeight") {
    return `${value}' AFF`;
  } else if (displayMap[key] && displayMap[key][value]) {
    return displayMap[key][value];
  }
  
  return String(value);
};

// Wizard steps
enum WizardStep {
  WELCOME = 1,
  PROJECT_TYPE = 2,
  CRITICAL_STANDARDS = 3,
  ADVANCED_STANDARDS = 4,
  PROJECT_SPECIFIC_STANDARDS = 5,
  REVIEW = 6,
  COMPLETE = 7
}

export default function StandardsWizard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.WELCOME);
  
  // Project type state
  const [projectType, setProjectType] = useState<"commercial" | "residential" | "renovation">("commercial");
  
  // Default values for form fields
  const defaultCriticalValues: CriticalStandards = {
    projectType: "commercial",
    drywallWasteFactor: 10,
    flooringWasteFactor: 8,
    standardCeilingHeight: 9,
    flooringInstallationMethod: "adhesive",
    preferredHvacBrand: "carrier"
  };
  
  const defaultAdvancedValues: AdvancedStandards = {
    drywallFinishLevel: "level4",
    paintFinishStandard: "eggshell",
    wallFramingStandard: "metal-16oc",
    doorMaterialStandard: "solid",
    ceilingTileBrand: "armstrong",
    restroomFixtureBrand: "kohler"
  };
  
  // Project-specific default values
  const defaultCommercialValues: CommercialStandards = {
    commercialFireRating: "2-hour",
    commercialAccessibilityStandard: "ada",
    commercialFlooringType: "carpet-tile"
  };
  
  const defaultResidentialValues: ResidentialStandards = {
    residentialInsulationRValue: 30,
    residentialWindowType: "double-pane",
    residentialFlooringType: "hardwood"
  };
  
  const defaultRenovationValues: RenovationStandards = {
    demolitionWasteFactor: 15,
    hazardousMaterialHandling: "removal"
  };
  
  // Form for critical standards (Step 3)
  const criticalForm = useForm<CriticalStandards>({
    resolver: zodResolver(criticalStandardsSchema),
    defaultValues: defaultCriticalValues
  });
  
  // Form for advanced standards (Step 4)
  const advancedForm = useForm<AdvancedStandards>({
    resolver: zodResolver(advancedStandardsSchema),
    defaultValues: defaultAdvancedValues
  });
  
  // Project-specific forms (Step 5)
  const commercialForm = useForm<CommercialStandards>({
    resolver: zodResolver(commercialStandardsSchema),
    defaultValues: defaultCommercialValues
  });
  
  const residentialForm = useForm<ResidentialStandards>({
    resolver: zodResolver(residentialStandardsSchema),
    defaultValues: defaultResidentialValues
  });
  
  const renovationForm = useForm<RenovationStandards>({
    resolver: zodResolver(renovationStandardsSchema),
    defaultValues: defaultRenovationValues
  });
  
  // Load existing standards if available
  const { data: existingStandards, isLoading } = useQuery<CompanyStandards>({
    queryKey: ["/api/standards"],
    onSuccess: (data) => {
      if (data) {
        // Fill forms with existing data
        criticalForm.reset({
          drywallWasteFactor: data.drywallWasteFactor,
          flooringWasteFactor: data.flooringWasteFactor,
          standardCeilingHeight: data.standardCeilingHeight,
          flooringInstallationMethod: data.flooringInstallationMethod,
          preferredHvacBrand: data.preferredHvacBrand
        });
        
        advancedForm.reset({
          drywallFinishLevel: data.drywallFinishLevel,
          paintFinishStandard: data.paintFinishStandard,
          wallFramingStandard: data.wallFramingStandard,
          doorMaterialStandard: data.doorMaterialStandard,
          ceilingTileBrand: data.ceilingTileBrand,
          restroomFixtureBrand: data.restroomFixtureBrand
        });
      }
    },
    // Ignore 404 errors when standards don't exist yet
    // @ts-ignore - TanStack Query v5 typing issue
    onError: (error) => {
      if (!error.toString().includes("404")) {
        toast({
          title: "Error",
          description: "Failed to load existing standards.",
          variant: "destructive"
        });
      }
    }
  });
  
  // Save standards mutation
  const saveStandardsMutation = useMutation({
    mutationFn: async (data: FullStandards) => {
      const response = await apiRequest("/api/standards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/standards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding-progress"] });
      
      // Move to completion step
      setCurrentStep(WizardStep.COMPLETE);
      
      toast({
        title: "Success",
        description: "Your company standards have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save your standards. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Navigation functions
  const goToStep = (step: WizardStep) => {
    setCurrentStep(step);
  };
  
  const handleCriticalSubmit = (data: CriticalStandards) => {
    goToStep(WizardStep.ADVANCED_STANDARDS);
  };
  
  const handleAdvancedSubmit = (data: AdvancedStandards) => {
    goToStep(WizardStep.PROJECT_SPECIFIC_STANDARDS);
  };
  
  const handleSkipAdvanced = () => {
    goToStep(WizardStep.PROJECT_SPECIFIC_STANDARDS);
  };
  
  const handleEditStandards = () => {
    goToStep(WizardStep.CRITICAL_STANDARDS);
  };
  
  const handleConfirmSave = () => {
    const criticalData = criticalForm.getValues();
    const advancedData = advancedForm.getValues();
    
    // Combine data from both forms
    const fullData: FullStandards = {
      ...criticalData,
      ...advancedData
    };
    
    // Save standards
    saveStandardsMutation.mutate(fullData);
  };
  
  const handleGoToNextOnboarding = () => {
    // Go to the next step in the onboarding flow
    navigate("/documents-upload");
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <ProgressIndicator 
              currentStep={currentStep} 
              totalSteps={4} 
              excludeFromCount={WizardStep.COMPLETE}
            />
          </div>
          
          {/* Step 1: Welcome */}
          {currentStep === WizardStep.WELCOME && (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 text-primary mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Define Your Estimating Standards</h2>
                <p className="text-slate-600 mb-8 max-w-lg mx-auto">
                  Define your estimating standards clearly to speed up and improve the accuracy of your bids. This will take less than 5 minutes.
                </p>
                
                <Button size="lg" onClick={() => goToStep(WizardStep.PROJECT_TYPE)}>
                  Start
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Step 2: Project Type Selection */}
          {currentStep === WizardStep.PROJECT_TYPE && (
            <Card>
              <CardContent className="p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  Select Project Type
                </h2>
                <p className="text-slate-600 mb-6">
                  Choose the type of projects you primarily work on. This will help us customize standards specific to your business.
                </p>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8">
                  <div 
                    className={`border rounded-lg p-6 flex flex-col items-center cursor-pointer transition-all
                      ${projectType === "commercial" ? "border-primary bg-primary-50" : "border-slate-200 hover:border-primary/50"}
                    `}
                    onClick={() => setProjectType("commercial")}
                  >
                    <Building className="h-12 w-12 mb-4 text-primary" />
                    <h3 className="font-medium text-lg mb-2">Commercial</h3>
                    <p className="text-sm text-center text-slate-500">Offices, retail, hospitality, and other business spaces.</p>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-6 flex flex-col items-center cursor-pointer transition-all
                      ${projectType === "residential" ? "border-primary bg-primary-50" : "border-slate-200 hover:border-primary/50"}
                    `}
                    onClick={() => setProjectType("residential")}
                  >
                    <Home className="h-12 w-12 mb-4 text-primary" />
                    <h3 className="font-medium text-lg mb-2">Residential</h3>
                    <p className="text-sm text-center text-slate-500">Single-family homes, multi-family buildings, and apartments.</p>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-6 flex flex-col items-center cursor-pointer transition-all
                      ${projectType === "renovation" ? "border-primary bg-primary-50" : "border-slate-200 hover:border-primary/50"}
                    `}
                    onClick={() => setProjectType("renovation")}
                  >
                    <Hammer className="h-12 w-12 mb-4 text-primary" />
                    <h3 className="font-medium text-lg mb-2">Renovation</h3>
                    <p className="text-sm text-center text-slate-500">Updating or repurposing existing spaces and structures.</p>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={() => {
                      // Update the projectType in the critical form
                      criticalForm.setValue("projectType", projectType);
                      goToStep(WizardStep.CRITICAL_STANDARDS);
                    }}
                    className="flex items-center"
                  >
                    Continue
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Step 3: Critical Standards */}
          {currentStep === WizardStep.CRITICAL_STANDARDS && (
            <Card>
              <CardContent className="p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  Critical Standards <span className="text-destructive">(Required)</span>
                </h2>
                <p className="text-slate-600 mb-6">
                  Tell us how you usually estimate your most common materials and installation methods. You can update these at any time.
                </p>
                
                <StandardsForm
                  form={criticalForm}
                  onSubmit={handleCriticalSubmit}
                  submitText="Next"
                  submitIcon={<ChevronRight className="ml-2 h-5 w-5" />}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          )}
          
          {/* Step 3: Advanced Standards */}
          {currentStep === WizardStep.ADVANCED_STANDARDS && (
            <Card>
              <CardContent className="p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  Advanced Standards <span className="text-slate-500">(Optional, Recommended)</span>
                </h2>
                <p className="text-slate-600 mb-6">
                  Set these additional standards to make your estimates even more accurate. Feel free to skip for now and return later.
                </p>
                
                <StandardsForm
                  form={advancedForm}
                  onSubmit={handleAdvancedSubmit}
                  submitText="Next"
                  submitIcon={<ChevronRight className="ml-2 h-5 w-5" />}
                  isLoading={isLoading}
                  showSkip
                  onSkip={handleSkipAdvanced}
                  skipText="Skip for now"
                />
              </CardContent>
            </Card>
          )}
          
          {/* Step 5: Project-Specific Standards */}
          {currentStep === WizardStep.PROJECT_SPECIFIC_STANDARDS && (
            <Card>
              <CardContent className="p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  {projectType === "commercial" ? "Commercial-Specific" : 
                   projectType === "residential" ? "Residential-Specific" : 
                   "Renovation-Specific"} Standards
                </h2>
                <p className="text-slate-600 mb-6">
                  These standards are specific to your {projectType} projects and will help improve the accuracy of your estimates.
                </p>
                
                {projectType === "commercial" && (
                  <StandardsForm
                    form={commercialForm}
                    onSubmit={() => goToStep(WizardStep.REVIEW)}
                    submitText="Next"
                    submitIcon={<ChevronRight className="ml-2 h-5 w-5" />}
                    isLoading={isLoading}
                    showSkip
                    onSkip={() => goToStep(WizardStep.REVIEW)}
                    skipText="Skip for now"
                  />
                )}
                
                {projectType === "residential" && (
                  <StandardsForm
                    form={residentialForm}
                    onSubmit={() => goToStep(WizardStep.REVIEW)}
                    submitText="Next"
                    submitIcon={<ChevronRight className="ml-2 h-5 w-5" />}
                    isLoading={isLoading}
                    showSkip
                    onSkip={() => goToStep(WizardStep.REVIEW)}
                    skipText="Skip for now"
                  />
                )}
                
                {projectType === "renovation" && (
                  <StandardsForm
                    form={renovationForm}
                    onSubmit={() => goToStep(WizardStep.REVIEW)}
                    submitText="Next"
                    submitIcon={<ChevronRight className="ml-2 h-5 w-5" />}
                    isLoading={isLoading}
                    showSkip
                    onSkip={() => goToStep(WizardStep.REVIEW)}
                    skipText="Skip for now"
                  />
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Step 6: Review & Confirm */}
          {currentStep === WizardStep.REVIEW && (
            <Card>
              <CardContent className="p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Review & Confirm Standards</h2>
                
                <div className="border border-slate-200 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-slate-800 mb-4">Your Company Standards</h3>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-slate-700">Critical Standards:</h4>
                    <ul className="mt-2 space-y-2 text-sm">
                      {Object.entries(criticalForm.getValues()).map(([key, value]) => (
                        <li className="flex" key={key}>
                          <span className="text-slate-600 w-1/2">
                            {key === "drywallWasteFactor" ? "Drywall Waste" :
                             key === "flooringWasteFactor" ? "Flooring Waste" :
                             key === "standardCeilingHeight" ? "Standard Ceiling Height" :
                             key === "flooringInstallationMethod" ? "Flooring Installation Method" :
                             key === "preferredHvacBrand" ? "Preferred HVAC Equipment Brand" : key}:
                          </span>
                          <span className="font-medium text-slate-800">
                            {getDisplayText(key, value)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-slate-700">Optional (Advanced) Standards:</h4>
                    <ul className="mt-2 space-y-2 text-sm">
                      {Object.entries(advancedForm.getValues()).map(([key, value]) => (
                        <li className="flex" key={key}>
                          <span className="text-slate-600 w-1/2">
                            {key === "drywallFinishLevel" ? "Drywall Finish Level" :
                             key === "paintFinishStandard" ? "Paint Finish" :
                             key === "wallFramingStandard" ? "Wall Framing" :
                             key === "doorMaterialStandard" ? "Door Material" :
                             key === "ceilingTileBrand" ? "Ceiling Tile Brand" :
                             key === "restroomFixtureBrand" ? "Restroom Fixture Brand" : key}:
                          </span>
                          <span className="font-medium text-slate-800">
                            {value ? getDisplayText(key, value) : "Not specified"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    className="flex items-center" 
                    onClick={handleEditStandards}
                  >
                    <Pencil className="mr-2 h-5 w-5" />
                    Edit Standards
                  </Button>
                  
                  <Button 
                    className="flex items-center" 
                    onClick={handleConfirmSave}
                    disabled={saveStandardsMutation.isPending}
                  >
                    {saveStandardsMutation.isPending ? "Saving..." : "Confirm and Save"}
                    <Check className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Completion Screen */}
          {currentStep === WizardStep.COMPLETE && (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500 text-white mb-6">
                  <Check className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Great job!</h2>
                <p className="text-slate-600 mb-8 max-w-lg mx-auto">
                  You've successfully set your company standards. You're already on your way to faster and more accurate bids.
                </p>
                
                <Button 
                  size="lg"
                  onClick={handleGoToNextOnboarding}
                >
                  Next Step: Upload Historic Pricing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
