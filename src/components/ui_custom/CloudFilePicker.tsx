import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "../ui/table";
import { useState } from "react";
import { Input } from "../ui/input";
import { ArrowBigLeft, Cloud, User } from "lucide-react";
import { Button } from "../ui/button";
import React from "react";
import { format } from "path";

interface CloudFilePickerProps {
  files: any[];
  onClose: (file: any) => void;
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
  return (
    <div className="flex justify-between">
      <h3 className="text-md font-semibold">Cloud File Picker</h3>
      <Input placeholder="Search" className="w-1/2 h-8" onChange={(e) => setSearch(e.target.value)} />
    </div>
  )
}

const TriggerComponent = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>((props, ref) => {
  return (
    <>
      <div ref={ref}
        {...props} className="flex h-9 w-full justify-between border rounded-md px-2.5 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground items-center cursor-pointer">
        <div className="flex items-center gap-2">
          <Cloud className="h-6 w-6 text-purple-700" />
          <span>Upload a file</span>
        </div>

        <ArrowBigLeft className="h-4 w-4 text-gray-300" />

      </div>

      <p className="text-xs/5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
    </>
  );
});

const TableComponent = ({ files, selectedFile, setSelectedFile }: { files: any[], selectedFile: any, setSelectedFile: (file: any) => void }) => {
  return (
    <div className="rounded-md border">
      <Table className="w-full overflow-y-auto">
        <TableHeader>
          <TableRow>
            {tableColumns.map((header) => (
              <TableHead key={header.name}> {header.name} </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {files?.length ? (
            files.map((row) => (
              <TableRow
                key={row.id}
                className={`cursor-pointer hover:bg-gray-100 ${selectedFile?.id === row.id ? "bg-gray-100" : ""}`}
                onClick={() => setSelectedFile(row)}
              >
                {tableColumns.map((column) => (
                  <TableCell key={column.name}>
                    <div className="flex items-center gap-2">
                      {column.accessorKey === "name" && (
                        <img
                          src="/svg/google_sheets-icon.svg"
                          alt={row.name}
                          className="w-4 h-4 rounded-md" />
                      )}
                      {column.accessorKey === "last_modified" && (
                        <p className="text-xs">{format(row[column.accessorKey], "MM/dd/yyyy")}</p>
                      )}

                      <p className="text-xs">{row[column.accessorKey]}</p>
                    </div>
                  </TableCell>
                ))}

              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={tableColumns.length}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default function CloudFilePicker({ onClose, files }: CloudFilePickerProps) {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const filtered = files.filter((file) => file.name.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = () => {
    onClose(selectedFile);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild className="w-full">
        <TriggerComponent />
      </DialogTrigger >
      <DialogContent className="max-h-[80vh] max-w-full md:max-w-xl lg:max-w-3xl">
        <DialogHeader>
          <ToolbarComponent setSearch={setSearch} />
        </DialogHeader>

        <TableComponent files={filtered} selectedFile={selectedFile} setSelectedFile={setSelectedFile} />

        <DialogFooter>
          <Button onClick={() => handleSelect()}>Select</Button>
          <Button onClick={() => setIsOpen(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>

    </Dialog >
  );
} 