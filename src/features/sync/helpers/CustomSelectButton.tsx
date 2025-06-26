import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { FC, useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Button } from '@/components/ui/button';

interface SelectOption {
    id: string;
    name: string;
    icon?: string;
}

interface CustomSelectButtonProps {
    value: string | null;
    onValueChange: (value: string) => void;
    options: SelectOption[];
    placeholder: string;
    disabled?: boolean;
    isLoading: boolean;
    onCreateNew?: () => void;
}

export const LoadingState: FC = () => (
    <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
    </div>
);

export const CustomSelectButton: FC<CustomSelectButtonProps> = ({
    value,
    onValueChange,
    options,
    placeholder,
    disabled,
    isLoading,
    onCreateNew,
}) => {
    const [open, setOpen] = useState(false);

    const getImagePath = (icon_name: string) => {
        if (!icon_name) return;
        return `/svg/${icon_name}.svg`;
    };

    if (isLoading) return <LoadingState />;

    const selectedOption = options.find(opt => opt.id === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className={cn(
                    "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-2.5 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
                    !value && "text-muted-foreground"
                )}>
                    <div className="flex items-center gap-2">
                        {selectedOption?.icon && (
                            <img
                                src={getImagePath(selectedOption.icon)}
                                alt={selectedOption.name}
                                className="h-3.5 w-3.5 object-contain"
                            />
                        )}
                        <span>{selectedOption?.name || placeholder}</span>
                    </div>
                    <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" side="bottom" align="start">
                <Command>
                    <CommandInput placeholder="Change status..." />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.id}
                                    value={option.name}
                                    onSelect={() => {
                                        onValueChange(option.id);
                                        setOpen(false);
                                    }}
                                >
                                    {option.icon && (
                                        <img
                                            src={getImagePath(option.icon)}
                                            alt={option.name}
                                            className="h-3.5 w-3.5 object-contain"
                                        />
                                    )}
                                    <span>{option.name}</span>
                                    {value === option.id && (
                                        <Check className="ml-auto h-3.5 w-3.5" />
                                    )}
                                </CommandItem>
                            ))}
                            <CommandSeparator className="my-3" />
                            
                            {onCreateNew && (
                                <button
                                    type="button"
                                    onClick={onCreateNew}
                                    disabled={disabled}
                                    className="flex h-9 items-center justify-center w-full rounded-md border border-input bg-background px-2.5 text-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Create new connection
                                </button>
                            )}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}; 