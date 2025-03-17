import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  ChevronRight, 
  ChevronLeft,
  CheckCircle, 
  Clock, 
  HelpCircle
} from 'lucide-react';
import { type OnboardingProgress } from '@shared/schema';

type OnboardingStep = {
  id: string;
  label: string;
  path: string;
  description: string;
  timeMins: number;
  completed: boolean;
  active: boolean;
  skippable: boolean;
};

type OnboardingSidebarProps = {
  progress?: OnboardingProgress;
  currentStep?: string;
};

export default function OnboardingSidebar({ 
  progress, 
  currentStep = 'welcome' 
}: OnboardingSidebarProps) {
  const [, navigate] = useLocation();
  const [expanded, setExpanded] = useState(true);
  
  // Default onboarding steps with time estimates - aligned with dashboard cards
  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      label: 'Welcome to Assembli',
      path: '/',
      description: 'Get familiar with your estimator dashboard',
      timeMins: 1,
      completed: true, // Always completed as it's the landing page
      active: currentStep === 'welcome',
      skippable: false
    },
    {
      id: 'company_standards',
      label: '1. Set Company Standards',
      path: '/standards-wizard',
      description: 'Define your estimation rules and preferences',
      timeMins: 2,
      completed: progress?.standardsSetupComplete || false,
      active: currentStep === 'company_standards',
      skippable: true
    },
    {
      id: 'upload_documents',
      label: '2. Upload Pricing Information',
      path: '/documents-upload',
      description: 'Add historic pricing data for materials',
      timeMins: 1,
      completed: progress?.historicPricingUploaded || false,
      active: currentStep === 'upload_documents',
      skippable: false
    },
    {
      id: 'create_estimate',
      label: '3. Create Your First Project',
      path: '/create-estimate',
      description: 'Start a project and generate an estimate',
      timeMins: 2,
      completed: progress?.firstEstimateCreated || false,
      active: currentStep === 'create_estimate',
      skippable: false
    },
    {
      id: 'validate_estimate',
      label: '4. Validate Estimate',
      path: '/validation-dashboard',
      description: 'Review and validate against standards',
      timeMins: 2,
      completed: progress?.estimateValidated || false,
      active: currentStep === 'validate_estimate',
      skippable: false
    },
    {
      id: 'submit_bid',
      label: '5. Submit Your Bid',
      path: '/submit-bid',
      description: 'Finalize and submit your estimate',
      timeMins: 1,
      completed: progress?.firstBidSubmitted || false,
      active: currentStep === 'submit_bid',
      skippable: false
    }
  ];
  
  // Calculate overall progress percentage
  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);
  
  // Find current active step index
  const activeStepIndex = steps.findIndex(step => step.active);
  
  const handleStepClick = (step: OnboardingStep) => {
    // Only allow clicking completed steps or the next uncompleted step
    if (step.completed || steps[activeStepIndex].completed) {
      navigate(step.path);
    }
  };
  
  const getNextStep = (): OnboardingStep | undefined => {
    if (activeStepIndex < 0) return steps[0];
    if (activeStepIndex >= steps.length - 1) return undefined;
    
    return steps[activeStepIndex + 1];
  };
  
  const handleContinue = () => {
    const nextStep = getNextStep();
    if (nextStep) {
      navigate(nextStep.path);
    }
  };
  
  const handleSkip = () => {
    const currentStepObj = steps.find(step => step.active);
    if (currentStepObj && currentStepObj.skippable) {
      const nextStep = getNextStep();
      if (nextStep) {
        navigate(nextStep.path);
      }
    }
  };
  
  if (!expanded) {
    return (
      <div className="w-10 h-full bg-slate-50 border-r border-slate-200 flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setExpanded(true)}
          className="mb-4"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <div className="rotate-90 text-xs text-slate-500 font-medium whitespace-nowrap origin-left mt-10">
          Onboarding Progress
        </div>
        
        <div className="mt-auto flex flex-col items-center gap-4">
          <div className="h-16 w-1 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-500 ease-in-out"
              style={{ height: `${progressPercentage}%` }} 
            />
          </div>
          <div className="text-xs font-semibold text-slate-700">{progressPercentage}%</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-72 h-full bg-slate-50 border-r border-slate-200 flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-semibold text-slate-900">Onboarding Progress</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setExpanded(false)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-4 border-b border-slate-200">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-medium">
            {completedSteps} of {totalSteps} steps completed
          </div>
          <div className="text-sm text-slate-500">
            {progressPercentage}%
          </div>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
      
      <div className="flex-grow overflow-auto p-2">
        <div className="space-y-1">
          {steps.map((step, index) => {
            const isActive = step.active;
            const isCompleted = step.completed;
            const isNext = !step.completed && index === activeStepIndex + 1;
            const isDisabled = !step.completed && !isNext && index !== activeStepIndex;
            
            return (
              <div
                key={step.id}
                onClick={() => {
                  if (!isDisabled) handleStepClick(step);
                }}
                className={`
                  relative p-3 rounded-md transition-all duration-150 
                  ${isActive ? 'bg-primary/10 text-primary' : ''}
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-100'}
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {isCompleted ? (
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    ) : isActive ? (
                      <div className="h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-slate-300 flex items-center justify-center">
                        {isNext && (
                          <div className="h-2 w-2 rounded-full bg-slate-300" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center">
                      <div className={`font-medium ${isActive ? 'text-primary' : 'text-slate-900'}`}>
                        {step.label}
                      </div>
                    </div>
                    
                    <div className="text-xs text-slate-500 mt-1">{step.description}</div>
                    
                    <div className="flex items-center mt-2 text-xs">
                      <Clock className="h-3 w-3 mr-1 text-slate-400" />
                      <span className="text-slate-500">{step.timeMins} min</span>
                      
                      {step.skippable && (
                        <span className="ml-2 text-slate-400">• Skippable</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="absolute left-5 top-[38px] bottom-0 w-0.5 bg-slate-200 h-[calc(100%)]"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="p-4 border-t border-slate-200 bg-white">
        {activeStepIndex >= 0 && activeStepIndex < steps.length && (
          <div className="space-y-2">
            <Button 
              onClick={handleContinue}
              className="w-full"
              disabled={!steps[activeStepIndex].completed && activeStepIndex !== 0}
            >
              Continue to Next Step
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
            
            {steps[activeStepIndex].skippable && !steps[activeStepIndex].completed && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="w-full text-slate-500"
              >
                Skip for now
              </Button>
            )}
            
            <Button
              variant="link"
              size="sm"
              className="w-full text-slate-500 flex items-center justify-center mt-2"
              onClick={() => navigate('/help')}
            >
              <HelpCircle className="h-3 w-3 mr-1" />
              Need help with this step?
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}