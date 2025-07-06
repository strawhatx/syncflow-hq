import { cn } from '@/lib/utils';
import { ArrowRightLeft, Box, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { FC, useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface SelectOption {
    id: number;
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
    options: SelectOption[];
    disabled?: boolean;
    isLoading: boolean;
}

export const LoadingState: FC = () => (
    <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
    </div>
);

const getImagePath = (icon_name: string) => {
    if (!icon_name) return;
    return `/svg/${icon_name}.svg`;
};

export const TableMapSelect: FC<TableMapSelectProps> = ({
    options,
    disabled,
    isLoading,
}) => {
    const [value, setValue] = useState<number>(0);
    const selectedOption = options?.find(opt => opt.id === value);

    return (
        <Select value={value} onValueChange={setValue} disabled={disabled}>
            <SelectTrigger
                className={cn(
                    "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-2.5 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
                    !value && "text-muted-foreground"
                )}
            >
                <div className="flex items-center gap-2">
                    <SelectValue placeholder={
                        <span className="text-muted-foreground flex items-center gap-2">
                            <Box className="h-6 w-6 text-purple-700" />
                            <span className="text-sm">Select a map</span>
                        </span>
                    }>
                        {value && (
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <img
                                        src={getImagePath(selectedOption?.source?.icon)}
                                        alt={selectedOption?.source?.name}
                                        className="h-6 w-6 object-contin"
                                    />
                                    <span className="text-sm">{selectedOption?.source?.name}</span>
                                </div>

                                <ArrowRightLeft className="h-4 w-4" />

                                <div className="flex items-center gap-2">
                                    <img
                                        src={getImagePath(selectedOption?.destination?.icon)}
                                        alt={selectedOption?.destination?.name}
                                        className="h-6 w-6 object-contain"
                                    />
                                    <span className="text-sm">{selectedOption?.destination?.name}</span>
                                </div>
                            </div>
                        )}
                    </SelectValue>
                </div>
                {isLoading && (
                    <div className="flex items-end gap-2">
                        <Loader2 className="h-3.5 w-3.5 opacity-50 animate-spin" />
                    </div>
                )}
            </SelectTrigger>

            <SelectContent>
                {options.map((option) => (
                    <SelectItem
                        key={option.id}
                        value={option.id}
                        className="flex items-center gap-2"
                    >
                        <div className="flex items-center gap-2">
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
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}; 