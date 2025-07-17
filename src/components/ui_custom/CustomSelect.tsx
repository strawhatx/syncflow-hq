import { cn, getImagePath } from '@/lib/utils';
import { Box, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { FC } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const handleValueChange = (newValue: string) => {
    onValueChange(newValue);
  };

  const selectedOption = options.find(opt => opt.id === value || opt.name === value);

  return (
    <Select value={value || ''}  onValueChange={handleValueChange} disabled={disabled}>
      <SelectTrigger
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-2.5 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
          !value && "text-muted-foreground"
        )}
        
      >
        <div className="flex items-center gap-2">
          {value && selectedOption?.icon && (
            <img
              src={getImagePath(selectedOption.icon)}
              alt={selectedOption.name}
              className="h-6 w-6 object-contain"
            />
          )}
          <SelectValue placeholder={
            <span className="text-muted-foreground flex items-center gap-2">
              <Box className="h-6 w-6 text-purple-700" />
              <span className="text-sm">{placeholder}</span>
            </span>
          }>
            {value && selectedOption?.name}
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
            className="flex items-start gap-2"
          >
            {option.icon && (
              <img
                src={getImagePath(option.icon)}
                alt={option.name}
                className="h-4 w-4 object-contain"
              />
            )}
            {option.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}; 