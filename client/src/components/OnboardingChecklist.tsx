import { useLocation } from "wouter";
import { Check } from "lucide-react";
import { type OnboardingProgress } from "@shared/schema";

type OnboardingStep = {
  id: string;
  label: string;
  path: string;
  completed: boolean;
  timeMins?: number;
};

type OnboardingChecklistProps = {
  progress?: OnboardingProgress;
};

export default function OnboardingChecklist({ progress }: OnboardingChecklistProps) {
  const [, navigate] = useLocation();
  
  // Default progress if not provided
  const defaultProgress: OnboardingProgress = {
    id: 0,
    userId: 1,
    standardsSetupComplete: false,
    historicPricingUploaded: false,
    firstEstimateCreated: false,
    estimateValidated: false,
    firstBidSubmitted: false
  };
  
  const currentProgress = progress || defaultProgress;
  
  // Define onboarding steps
  const steps: OnboardingStep[] = [
    {
      id: "standards",
      label: "Set Your Company Standards",
      path: "/standards-wizard",
      completed: currentProgress.standardsSetupComplete,
      timeMins: 5
    },
    {
      id: "pricing",
      label: "Upload Historic Pricing",
      path: "/historic-pricing",
      completed: currentProgress.historicPricingUploaded
    },
    {
      id: "estimate",
      label: "Create Your First Estimate",
      path: "/create-estimate",
      completed: currentProgress.firstEstimateCreated
    },
    {
      id: "validate",
      label: "Validate & Refine Your Estimate",
      path: "/validation-dashboard",
      completed: currentProgress.estimateValidated
    },
    {
      id: "bid",
      label: "Submit Your First Bid",
      path: "/submit-bid",
      completed: currentProgress.firstBidSubmitted
    }
  ];
  
  const handleStepClick = (step: OnboardingStep) => {
    navigate(step.path);
  };
  
  return (
    <div className="space-y-4">
      {steps.map((step) => (
        <div 
          key={step.id}
          className={`flex items-start cursor-pointer hover:bg-slate-50 p-2 rounded-md ${!step.completed && "opacity-60"}`}
          onClick={() => handleStepClick(step)}
        >
          <div className={`flex-shrink-0 w-5 h-5 rounded-full ${step.completed ? 'bg-primary' : 'border-2 border-slate-300'} flex items-center justify-center mt-0.5`}>
            {step.completed && <Check className="h-3 w-3 text-white" />}
          </div>
          <div className="ml-3">
            <span className="font-medium text-slate-900">{step.label}</span>
            {step.timeMins && <span className="ml-2 text-xs font-medium text-slate-500">({step.timeMins} min)</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
