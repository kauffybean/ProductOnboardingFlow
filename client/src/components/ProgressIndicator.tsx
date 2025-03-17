import { cn } from "@/lib/utils";

type ProgressIndicatorProps = {
  currentStep: number;
  totalSteps: number;
  excludeFromCount?: number;
};

export default function ProgressIndicator({
  currentStep,
  totalSteps,
  excludeFromCount
}: ProgressIndicatorProps) {
  // Create an array of step numbers
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
  
  return (
    <div className="flex items-center">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm",
              step < currentStep
                ? "bg-green-500 text-white" // Completed
                : step === currentStep
                ? "bg-primary text-white" // Active
                : "bg-slate-200 text-slate-600" // Upcoming
            )}
          >
            {step}
          </div>
          
          {/* Connector line between steps */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                "h-0.5 flex-grow",
                step < currentStep && steps[index + 1] <= currentStep
                  ? "bg-green-500" // Both steps completed
                  : step < currentStep
                  ? "bg-gradient-to-r from-green-500 to-slate-200" // Left step completed
                  : "bg-slate-200" // Neither step completed
              )}
              style={{ width: "3rem" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
