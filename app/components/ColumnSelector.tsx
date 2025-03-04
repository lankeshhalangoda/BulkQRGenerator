import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface ColumnSelectorProps {
  columns: string[]
  selectedColumns: string[]
  onToggle: (column: string) => void
}

export default function ColumnSelector({ columns, selectedColumns, onToggle }: ColumnSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Select Columns to Include</Label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {columns.map((column) => (
          <div key={column} className="flex items-center space-x-2">
            <Checkbox id={column} checked={selectedColumns.includes(column)} onCheckedChange={() => onToggle(column)} />
            <Label
              htmlFor={column}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {column}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}

