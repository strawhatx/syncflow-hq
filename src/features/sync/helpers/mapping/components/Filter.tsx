import { SyncFilter } from "@/types/sync";

interface FilterProps {
    filters: SyncFilter[];
    setFilters: (filters: SyncFilter[]) => void;
}

export const Filter = (props: FilterProps) => {
    const { filters, setFilters } = props;

    return (
        <div>
            <h1>Filter</h1>
        </div>
    )
}