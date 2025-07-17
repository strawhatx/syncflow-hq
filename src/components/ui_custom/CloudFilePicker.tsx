import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { ArrowUpFromLine, Cloud, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { format } from "date-fns";
import { sanitizeField } from '@/lib/sanitize';

interface CloudFilePickerProps {
  files: any[];
  value: any;
  onClose: (file: any) => void;
  isLoading: boolean;
  disabled: boolean;
}

const tableColumns = [
  {
    name: "Name",
    accessorKey: "name"
  },
  {
    name: "Size",
    accessorKey: "size"
  },
  {
    name: "Last Modified",
    accessorKey: "last_modified"
  }
]

const ToolbarComponent = ({ setSearch }: { setSearch: (search: string) => void }) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Sanitize the search input
    const sanitizedSearch = sanitizeField(e.target.value, "text", { maxLength: 100 });
    setSearch(sanitizedSearch);
  };

  return (
    <div className="flex justify-between mt-4 items-center">
      <DialogTitle className="text-md font-semibold">Cloud File Picker</DialogTitle>
      <Input placeholder="Search" className="w-1/2 h-8" onChange={handleSearchChange} />
    </div>
  )
}

const TriggerComponent =
  ({ isLoading, disabled, selectedFile, files, setOpen }:
    {
      isLoading: boolean,
      disabled: boolean,
      selectedFile: string,
      files: any[],
      setOpen: (open: boolean) => void
    }) => {
    const selected = files.find(file => file.id === selectedFile || file.name === selectedFile);

    return (
      <>
        <Button
          variant="outline"
          className={`flex h-9 w-full justify-between border rounded-md px-2.5 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground items-center overflow-hidden cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => setOpen(true)}
          disabled={disabled}
        >

          {selected && !isLoading ? (
            <div className="flex text-muted-foreground items-center gap-2">
              <img
                src="/svg/google_sheets-icon.svg"
                alt={selected.name}
                className="w-4 h-4 rounded-md"
              />
              < span className="text-sm text-gray-600 truncate">{selected?.name || selected}</span>
            </div>
          ) : (
            <div className="flex text-muted-foreground items-center gap-2">
              <Cloud className="h-6 w-6 text-purple-700" />
              <span className="text-sm text-gray-600 truncate">Upload</span>
            </div>
          )}

          {isLoading ? (
            <Loader2 className="h-4 w-4 text-gray-500 animate-spin" />
          ) : (
            <ArrowUpFromLine className="h-4 w-4 text-muted-foreground" />
          )}

        </Button >
      </>
    );
  };

const TableComponent = ({
  files,
  selectedFile,
  setSelectedFile,
}: {
  files: any[];
  selectedFile: string;
  setSelectedFile: (file: any) => void;
}) => {
  return (
    <div className="rounded-md border flex flex-col">
      {/* Table Header */}
      <div className="grid grid-cols-3 border-b bg-gray-50">
        {tableColumns.map((header) => (
          <div key={header.name} className="py-2 px-3 text-sm font-semibold">
            {header.name}
          </div>
        ))}
      </div>

      {/* Scrollable Table Body */}
      <div className="max-h-[300px] overflow-y-auto">
        {files?.length ? (
          files.map((row) => (
            <div
              key={row.id}
              className={`grid grid-cols-3 cursor-pointer hover:bg-gray-100 ${selectedFile === row.id ? "bg-gray-100" : ""
                }`}
              onClick={() => setSelectedFile(row.id)}
            >
              {tableColumns.map((column) => (
                <div key={column.name} className="py-2 px-3 flex items-center gap-2 text-sm">
                  {column.accessorKey === "name" && (
                    <img
                      src="/svg/google_sheets-icon.svg"
                      alt={row.name}
                      className="w-4 h-4 rounded-md"
                    />
                  )}
                  <span className="text-xs">{
                    column.accessorKey === "last_modified" ?
                      format(row[column.accessorKey], "MM/dd/yyyy") :
                      column.accessorKey === "size" ?
                        `${(row[column.accessorKey] / 1024).toFixed(2)} KB` :
                        row[column.accessorKey]
                  }</span>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">No results.</div>
        )}
      </div>
    </div>
  );
};


export default function CloudFilePicker({ onClose, files, value, isLoading, disabled }: CloudFilePickerProps) {
  const [selectedFile, setSelectedFile] = useState<string>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const filtered = files?.filter((file) => file?.name?.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = () => {
    onClose(selectedFile);
    setIsOpen(false);
  }

  useEffect(() => {
    if (value) {
      setSelectedFile(value);
    }
  }, [value]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <TriggerComponent
        setOpen={setIsOpen}
        isLoading={isLoading}
        disabled={disabled}
        selectedFile={selectedFile}
        files={files}
      />

      <DialogContent className="max-h-[80vh] max-w-full md:max-w-xl lg:max-w-3xl">
        <DialogHeader>
          <ToolbarComponent setSearch={setSearch} />
        </DialogHeader>

        <TableComponent files={filtered} selectedFile={selectedFile} setSelectedFile={setSelectedFile} />

        <DialogFooter className="flex flex-row gap-2 justify-end">
          <Button variant="default" className="w-fit h-8" onClick={() => handleSelect()}>Select</Button>
          <Button variant="destructive" className="w-fit h-8" onClick={() => setIsOpen(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>

    </Dialog >
  );
} 