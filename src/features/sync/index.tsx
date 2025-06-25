import { useState } from "react";
import AppStep from "./component/Apps";
import ConnectStep from "./component/Connect";
import MappingStep from "./component/Mapping";
import ReviewStep from "./component/Review";
import ScheduleStep from "./component/Schedule";
import { Check, CheckCircle, Circle } from "lucide-react";

const steps = [
    {
        id: "apps",
        label: "Lets select your Apps",
        description: "Select the apps you want to sync",
        component: AppStep,
    },
    {
        id: "connections",
        label: "choose your connections or create a new one",
        description: "Select the connections you want to sync",
        component: ConnectStep,
    },
    {
        id: "mappings",
        label: "Mappings",
        description: "Map the fields you want to sync",
        component: MappingStep,
    },
    {
        id: "schedule",
        label: "Schedule",
        description: "Schedule the sync",
        component: ScheduleStep,
    },
    {
        id: "review",
        label: "Review",
        description: "Review the sync",
        component: ReviewStep,
    },
];

export default function Sync() {
    const [stepIndex, setStepIndex] = useState(0);
    const Step = steps[stepIndex].component;

    return (
        <div className="flex flex-col gap-4">
            {/*  Vertical Stepper */}
            <div className="flex flex-col">
                {steps.map((step, i) => (
                    <div>
                        <div key={step.id} className="flex items-center gap-2">
                            <div className={`flex items-center justify-center w-5 h-5 rounded-full ${i <= stepIndex ? (i < stepIndex ? 'bg-green-500' : 'bg-gray-300') : 'bg-gray-300'}`}>
                                {i < stepIndex && <Check className="w-3 h-3 text-white" /> }
                                {i === stepIndex && <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full" /> }
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-md font-semibold ${i === stepIndex ? 'text-gray-500' : 'text-gray-200'}`}>{step.label}</span>
                                {i === stepIndex && <span className='text-gray-500 text-sm'>{step.description}</span>}
                            </div>
                        </div>

                        {/* Active Step Component */}
                        {
                            i === stepIndex && 
                            <div className="flex-1 ml-[10px] px-6 py-8 border-l-2 border-gray-200">
                                <Step
                                    next={() => setStepIndex(i => i + 1)}
                                    back={() => setStepIndex(i => i - 1)}
                                />
                            </div>
                        }
                        {
                            i !== stepIndex && 
                                <div className="flex-1 ml-[10px] p-4 border-l-2 border-gray-100">
                                </div>
                            }
                    </div>

                ))}
            </div>
        </div>
    )
}