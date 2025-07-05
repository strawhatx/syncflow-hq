import { useEffect, useState } from "react";
import AccountsStep from "./component/Accounts";
import DataSourcesStep from "./component/DataSources";
import { TableMappingStep } from "./component/TableMapping";
import ReviewStep from "./component/Review";
import ScheduleStep from "./component/Schedule";
import { Check, X, RefreshCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { defaultUpdateSync } from "@/types/sync";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import useSync, { SyncData } from "./hooks/useSync";
import { FieldMappingStep } from "./component/FeildMapping";

// Step state enum for cleaner logic
enum StepState {
    COMPLETED = 'completed',
    CURRENT = 'current',
    UPCOMING = 'upcoming'
}

const steps = [
    {
        id: "accounts",
        label: "choose your connected accounts or create a new one",
        description: "Select the accounts you want to sync",
        component: AccountsStep,
    },
    {
        id: "data-sources",
        label: "choose your data sources",
        description: "Select the data sources you want to sync",
        component: DataSourcesStep,
    },
    {
        id: "table-mappings",
        label: "Map your tables",
        description: "Map the tables you want to sync",
        component: TableMappingStep,
    },
    {
        id: "field-mappings",
        label: "Map your fields",
        description: "Map the fields you want to sync",
        component: FieldMappingStep,
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

// Helper functions to determine step state and styling
const getStepState = (stepIndex: number, currentStep: number): StepState => {
    if (stepIndex < currentStep) return StepState.COMPLETED;
    if (stepIndex === currentStep) return StepState.CURRENT;
    return StepState.UPCOMING;
};

const getStepIndicator = (state: StepState) => {
    switch (state) {
        case StepState.COMPLETED:
            return (
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500">
                    <Check className="w-3 h-3 text-white" />
                </div>
            );
        case StepState.CURRENT:
            return (
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-300">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full" />
                </div>
            );
        case StepState.UPCOMING:
            return (
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-300" />
            );
    }
};

const getStepLabel = (step: typeof steps[0], state: StepState, onClick?: () => void) => {
    const baseClasses = "text-md font-semibold";
    const stateClasses = {
        [StepState.COMPLETED]: "text-gray-300 hover:underline cursor-pointer",
        [StepState.CURRENT]: "text-gray-500",
        [StepState.UPCOMING]: "text-gray-200"
    };

    const className = `${baseClasses} ${stateClasses[state]}`;

    return (
        <span className={className} onClick={state === StepState.COMPLETED ? onClick : undefined}>
            {step.label}
        </span>
    );
};

const getStepContent = (step: typeof steps[0], state: StepState, sync: SyncData, onNext?: () => void) => {
    if (state === StepState.CURRENT) {
        const StepComponent = step.component;
        return (
            <div className="flex-1 ml-[10px] px-6 py-8 border-l-2 border-gray-200">
                <StepComponent next={onNext} sync={sync} />
            </div>
        );
    }
    else {
        return (
            <div className="flex-1 ml-[10px] p-4 border-l-2 border-gray-100" />
        );
    }
};

export default function Sync() {
    const { id } = useParams();
    const { sync, isLoading, createSyncMutation } = useSync(id);
    const { user } = useAuth();
    const [stepIndex, setStepIndex] = useState(0);
    const [syncName, setSyncName] = useState("Untitled Sync");

    useEffect(() => {
        if (sync) {
            // set the sync name(dont forget)
            setSyncName(sync.name);
        }
    }, [sync, isLoading]);

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <Input className="text-lg w-1/2 py-1 border-none font-semibold"
                    placeholder="Provide a name"
                    value={syncName}
                    onBlur={() => {
                        createSyncMutation.mutate({ step: 'apps', data: { id, name: syncName } as any });
                    }}
                    onChange={(e) => setSyncName(e.target.value)}
                />

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="rounded-md py-2 px-4 h-8"
                        onClick={async () => {
                            // reset the wizard data and all sync data
                            setStepIndex(0);
                            createSyncMutation.mutate({ step: 'apps', data: defaultUpdateSync(id, user) as any });
                        }}
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Restart Sync
                    </Button>
                </div>
            </div>

            {/* Vertical Stepper */}
            <div className="flex flex-col">
                {steps.map((step, i) => {
                    const state = getStepState(i, stepIndex);

                    return (
                        <div key={step.id}>
                            <div className="flex items-center gap-2">
                                {/* Step Indicator */}
                                {getStepIndicator(state)}

                                {/* Step Label */}
                                <div className="flex flex-col">
                                    {getStepLabel(step, state, () => setStepIndex(i))}
                                    {state === StepState.CURRENT && (
                                        <span className='text-gray-500 text-sm'>{step.description}</span>
                                    )}
                                </div>
                            </div>

                            {/* Step Content */}
                            {getStepContent(step, state, sync, () => setStepIndex(i => i + 1))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}