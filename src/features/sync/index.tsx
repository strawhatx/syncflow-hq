import { useEffect, useState, useRef } from "react";
import AccountsStep from "./component/Accounts";
import DataSourcesStep from "./component/DataSources";
import FilterStep from "./component/Filter";
import { MappingStep } from "./component/Mapping";
import ReviewStep from "./component/Review";
import ScheduleStep from "./component/Schedule";
import { Check, X, RefreshCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { sanitizeField } from "@/lib/sanitize";
import { useSync } from "@/contexts/SyncContext";

// Step state enum for cleaner logic
enum StepState {
    COMPLETED = 'completed',
    CURRENT = 'current',
    UPCOMING = 'upcoming'
}

// Transition state enum
enum TransitionState {
    IDLE = 'idle',
    CLOSING = 'closing',
    OPENING = 'opening'
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
        id: "mappings",
        label: "Map your tables",
        description: "Map the tables you want to sync",
        component: MappingStep,
    },
    {
        id: "filters",
        label: "Add your filters",
        description: "Add filters to your sync",
        component: FilterStep,
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

const getStepContent = (
    step: typeof steps[0],
    state: StepState,
    onNext?: () => void,
    transitionState: TransitionState = TransitionState.IDLE
) => {
    // Base classes for the content container
    const baseClasses = "flex-1 ml-[10px] border-l-2 transition-all duration-700 ease-in-out";

    // Determine border color based on state
    const borderClasses = state === StepState.CURRENT ? "border-gray-200" : "border-gray-100";

    // Determine height and opacity based on state and transition
    let heightClasses = "";
    let opacityClasses = "";
    let paddingClasses = "";
    let transformClasses = "";

    if (state === StepState.CURRENT) {
        if (transitionState === TransitionState.CLOSING) {
            heightClasses = "max-h-0";
            opacityClasses = "opacity-0";
            paddingClasses = "py-0";
            transformClasses = "scale-95";
        } else if (transitionState === TransitionState.OPENING) {
            heightClasses = "max-h-screen";
            opacityClasses = "opacity-100";
            paddingClasses = "px-6 py-8";
            transformClasses = "scale-100";
        } else {
            heightClasses = "max-h-screen";
            opacityClasses = "opacity-100";
            paddingClasses = "px-6 py-8";
            transformClasses = "scale-100";
        }
    } else {
        heightClasses = "max-h-auto";
        opacityClasses = "opacity-100";
        paddingClasses = "py-4";
        transformClasses = "scale-95";
    }

    const containerClasses = `${baseClasses} ${borderClasses}`;

    const contentClasses = `${heightClasses} ${opacityClasses} ${paddingClasses} ${transformClasses} transition-all duration-700 ease-out`;

    if (state === StepState.CURRENT) {
        const StepComponent = step.component;
        return (
            <div className={containerClasses}>
                <div className={contentClasses}>
                    <StepComponent next={onNext} />
                </div>
            </div>
        );
    } else {
        return (
            <div className={containerClasses}>
                <div className={contentClasses} />
            </div>
        );
    }
};

export default function Sync() {
    const [stepIndex, setStepIndex] = useState(0);
    const [transitionState, setTransitionState] = useState<TransitionState>(TransitionState.IDLE);
    const [previousStep, setPreviousStep] = useState<number | null>(null);
    const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { syncConfig, setTitle, reset, save } = useSync();

    // Custom step change handler with transitions
    const handleStepChange = (newStepIndex: number) => {
        if (newStepIndex === stepIndex) return;

        // Clear any existing timeout
        if (transitionTimeoutRef.current) {
            clearTimeout(transitionTimeoutRef.current);
        }

        // set the previous step and transition state
        setPreviousStep(stepIndex);
        setTransitionState(TransitionState.CLOSING);

        // After closing animation, change step and start opening
        transitionTimeoutRef.current = setTimeout(() => {
            setStepIndex(newStepIndex);
            setTransitionState(TransitionState.OPENING);

            // After opening animation, reset to idle
            transitionTimeoutRef.current = setTimeout(() => {
                setTransitionState(TransitionState.IDLE);
                setPreviousStep(null);
            }, 700);
        }, 600); // Slightly shorter delay for smoother feel
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (transitionTimeoutRef.current) {
                clearTimeout(transitionTimeoutRef.current);
            }
        };
    }, []);

    const MainContent = () => (
        <div className="flex flex-col gap-2">
            {/* Header */}
            <div className="flex justify-between items-center">
                <Input className="text-lg w-1/4 py-1 border-none font-semibold"
                    placeholder="Provide a name"
                    value={syncConfig?.name}
                    onBlur={() => {
                        // if the sync name is empty or the same as the sync name, don't update it
                        if (syncConfig?.name.length === 0 || syncConfig?.name === syncConfig?.name) return;

                        // save the sync config
                        save();
                    }}
                    onChange={(e) => {
                        // if the sync name is the same as the sync name, don't update it
                        const newName = sanitizeField(e.target.value, "text", { maxLength: 100 });
                        setTitle(newName);
                    }}
                    required
                />

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="rounded-md py-2 px-4 h-8"
                        onClick={async () => {
                            // reset the wizard data and all sync data
                            setStepIndex(0);
                            setTransitionState(TransitionState.IDLE);
                            setPreviousStep(null);
                            if (transitionTimeoutRef.current) {
                                clearTimeout(transitionTimeoutRef.current);
                            }
                            // reset the sync config and save it
                            reset();
                        }}
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Restart Sync
                    </Button>
                </div>
            </div>

            <hr className="border-gray-200" />

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
                                    {getStepLabel(step, state, () => handleStepChange(i))}
                                    {state === StepState.CURRENT && (
                                        <span className='text-gray-500 text-sm'>{step.description}</span>
                                    )}
                                </div>
                            </div>

                            {/* Step Content */}
                            {getStepContent(
                                step,
                                state,
                                () => handleStepChange(i + 1),
                                transitionState
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <MainContent />
    );
}