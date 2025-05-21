
import { CheckCircle2 } from "lucide-react";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface StepperHeaderProps {
  steps: Step[];
  currentStep: number;
}

const StepperHeader = ({ steps, currentStep }: StepperHeaderProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index < currentStep 
                    ? "bg-primary text-white" 
                    : index === currentStep 
                    ? "bg-primary/10 text-primary border-2 border-primary" 
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {index < currentStep ? <CheckCircle2 size={16} /> : index + 1}
              </div>
              <div className="text-xs mt-2 font-medium">{step.title}</div>
            </div>
            
            {index < steps.length - 1 && (
              <div 
                className={`h-0.5 w-24 ${
                  index < currentStep ? "bg-primary" : "bg-secondary"
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold">{steps[currentStep].title}</h2>
        <p className="text-muted-foreground">{steps[currentStep].description}</p>
      </div>
    </div>
  );
};

export default StepperHeader;
