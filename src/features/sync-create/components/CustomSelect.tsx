import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import * as Select from '@radix-ui/react-select';
import { Skeleton } from '@/components/ui/skeleton';
import { FC } from 'react';

interface SelectOption {
  id: string;
  name: string;
  icon?: string;
}

interface CustomSelectProps {
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

export const CustomSelect: FC<CustomSelectProps> = ({
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
  isLoading,
}) => {
  const getImagePath = (icon_name: string) => {
    if (!icon_name) return;
    return `/svg/${icon_name}.svg`;
  };

  if (isLoading) return <LoadingState />;

  const handleValueChange = (newValue: string) => {
    onValueChange(newValue);
  };

  return (
    <Select.Root value={value || ''} onValueChange={handleValueChange} disabled={disabled}>
      <Select.Trigger
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-2.5 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
          !value && "text-muted-foreground"
        )}
      >
        <div className="flex items-center gap-2">
          {value && options.find(opt => opt.id === value)?.icon && (
            <img
              src={getImagePath(options.find(opt => opt.id === value)?.icon || '')}
              alt={options.find(opt => opt.id === value)?.name || ''}
              className="h-3.5 w-3.5 object-contain"
            />
          )}
          <Select.Value placeholder={placeholder}>
            {value && options.find(opt => opt.id === value)?.name}
          </Select.Value>
        </div>
        <Select.Icon>
          <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="relative z-50 min-w-[200px] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
        >
          <Select.Viewport className="p-1">
            {options.map((option) => (
              <Select.Item
                key={option.id}
                value={option.id}
                className={cn(
                  "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-7 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                  value === option.id && "bg-accent text-accent-foreground"
                )}
              >
                {option.icon && (
                  <img
                    src={getImagePath(option.icon)}
                    alt={option.name}
                    className="absolute left-2 h-3.5 w-3.5 object-contain"
                  />
                )}
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  <Select.ItemIndicator>
                    <Check className="h-3.5 w-3.5" />
                  </Select.ItemIndicator>
                </span>
                <Select.ItemText>{option.name}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}; 