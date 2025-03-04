import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LucideUpload } from "lucide-react"

interface FileUploadProps {
  id: string
  label: string
  accept: string
  onUpload: (file: File) => void
}

export default function FileUpload({ id, label, accept, onUpload }: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      onUpload(file)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor={id}
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <LucideUpload className="w-8 h-8 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            {fileName ? (
              <p className="text-sm text-gray-500">{fileName}</p>
            ) : (
              <p className="text-xs text-gray-500">Supported file: {accept}</p>
            )}
          </div>
          <Input id={id} type="file" accept={accept} className="hidden" onChange={handleFileChange} />
        </label>
      </div>
    </div>
  )
}

