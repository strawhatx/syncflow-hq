import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "../ui/table";
import { useState } from "react";
import { Input } from "../ui/input";
import { User } from "lucide-react";
import { Button } from "../ui/button";

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
    name: "Type",
    accessorKey: "type"
  },
  {
    name: "Size",
    accessorKey: "size"
  },
  {
    name: "Last Modified",
    accessorKey: "lastModified"
  }
]

const ToolbarComponent = ({ setSearch }: { setSearch: (search: string) => void }) => {
  return (
    <div className="flex justify-between">
      <h3 className="text-md font-semibold">Cloud File Picker</h3>
      <Input placeholder="Search" className="w-full" onChange={(e) => setSearch(e.target.value)} />
    </div>
  )
}

const TriggerComponent = () => {
  return (
    <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
      <div className="text-center">
        <User aria-hidden="true" className="mx-auto size-6 text-gray-300" />
        <div className="mt-4 flex text-sm/6 text-gray-600">
          <label
            htmlFor="file-upload"
            className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 focus-within:outline-hidden hover:text-indigo-500"
          >
            <span>Upload a file</span>
            <input id="file-upload" name="file-upload" type="file" className="sr-only" />
          </label>
          <p className="pl-1">or drag and drop</p>
        </div>
        <p className="text-xs/5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
      </div>
    </div>
  )
}

const TableComponent = ({ files, selectedFile, setSelectedFile }: { files: any[], selectedFile: any, setSelectedFile: (file: any) => void }) => {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table className="w-full">
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
                  <TableCell key={column.name}> {row[column.accessorKey]} </TableCell>
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
      <DialogTrigger asChild>
        <TriggerComponent />
      </DialogTrigger >

      <DialogHeader>
        <ToolbarComponent setSearch={setSearch} />
      </DialogHeader>

      <DialogContent className="sm:max-w-[425px]">
        <TableComponent files={filtered} selectedFile={selectedFile} setSelectedFile={setSelectedFile} />
      </DialogContent>
      <DialogFooter>
        <Button onClick={() => handleSelect()}>Select</Button>
        <Button onClick={() => setIsOpen(false)}>Cancel</Button>
      </DialogFooter>
    </Dialog >
  );
} 