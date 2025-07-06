import { cn, getImagePath } from '@/lib/utils';
import { ArrowRight, ArrowRightLeft, Box, X } from 'lucide-react';
import { FC, useState } from 'react';
import { Skeleton } from '../ui/skeleton';

interface SelectOption {
    id: string;
    source: {
        name: string;
        icon?: string;
    };
    destination: {
        name: string;
        icon?: string;
    }
}

interface TableMapSelectProps {
    value: string;
    setValue: (value: string) => void;
    options: SelectOption[];
    disabled?: boolean;
    isLoading: boolean;
    onSelect?: (value: string) => void;
    onCancel?: () => void;
}

export const LoadingState: FC = () => (
    <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
    </div>
);

const placeholder = (
    <span className="text-muted-foreground flex items-center gap-2">
        <Box className="h-6 w-6 text-purple-700" />
        <span className="text-sm">Select a map</span>
    </span>
)

const selectItem: FC<SelectOption> = (option) => {
    return (
        <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-2">
                <img
                    src={getImagePath(option?.source?.icon)}
                    alt={option?.source?.name}
                    className="h-6 w-6 object-contin"
                />
                <span className="text-sm">{option?.source?.name}</span>
            </div>

            <ArrowRightLeft className="h-4 w-4" />

            <div className="flex items-center gap-2">
                <img
                    src={getImagePath(option?.destination?.icon)}
                    alt={option?.destination?.name}
                    className="h-6 w-6 object-contain"
                />
                <span className="text-sm">{option?.destination?.name}</span>
            </div>
        </div>
    )
}

export const TableMapSelect: FC<TableMapSelectProps> = ({
    options,
    value,
    setValue,
    disabled,
    isLoading,
    onSelect,
    onCancel,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (value: string) => {
        setValue(value);
        onSelect?.(value);
        setIsOpen(false);
    }

    const selectedOption = options?.find(opt => opt.id === value);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-2.5 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
                    !value && "text-muted-foreground"
                )}
                disabled={disabled}
            >
                <div className="flex items-center gap-2">
                    {selectedOption ? (
                        selectItem(selectedOption)
                    ) : (
                        placeholder
                    )}
                </div>
                {onCancel && (
                    <span
                        onClick={onCancel}
                        className="text-sm text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                    >
                        <X className="h-4 w-4" />
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                    {options.map((option) => (
                        <label key={option.id} className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer">
                            <input
                                type="radio"
                                name="tableMap"
                                value={option.id}
                                checked={value === option.id}
                                onChange={() => handleSelect(option.id)}
                                className="form-radio"
                            />
                            <div className="flex items-center gap-2">
                                <img
                                    src={getImagePath(option.source.icon)}
                                    alt={option.source.name}
                                    className="h-6 w-6 object-contain"
                                />
                                <span className="text-sm">{option.source.name}</span>
                                <ArrowRight className="h-4 w-4" />
                                <img
                                    src={getImagePath(option.destination.icon)}
                                    alt={option.destination.name}
                                    className="h-6 w-6 object-contain"
                                />
                                <span className="text-sm">{option.destination.name}</span>
                            </div>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}; 