"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/modal"
import { HelpCircle, Download } from "lucide-react"
import * as XLSX from "xlsx"

export function UserGuide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-1 text-white">
          <HelpCircle className="h-4 w-4" />
          <span>User Guide</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto my-8">
        <DialogHeader>
          <DialogTitle className="text-2xl text-emojot">How to Use QR Code Generator</DialogTitle>
          <DialogDescription>Follow these simple steps to generate QR codes</DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <section>
            <h3 className="text-lg font-medium text-emojot mb-2">Option 1: Generate Single QR Code</h3>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Toggle "Generate Single QR"</li>
              <li>Enter your URL in the link field</li>
              <li>Optionally add text to display below the QR code</li>
              <li>Choose to either upload your logo or use the default Emojot logo</li>
              <li>Click "Generate QR Codes"</li>
            </ol>
          </section>

          <section>
            <h3 className="text-lg font-medium text-emojot mb-2">Option 2: Generate Multiple QR Codes</h3>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Toggle "Upload EH File"</li>
              <li>
                Prepare your Excel file with required columns:
                <ul className="list-disc pl-6 mt-1">
                  <li>
                    <strong>Link</strong> (required) - URLs for QR codes
                  </li>
                  <li>
                    <strong>Location</strong> (optional) - Used for file naming
                  </li>
                  <li>Any other columns you want to display on QR codes</li>
                </ul>
              </li>
              <li>Upload your Excel file</li>
              <li>Select which columns to display on QR codes</li>
              <li>Choose to either upload your logo or use the default Emojot logo</li>
              <li>Click "Generate QR Codes"</li>
            </ol>
          </section>

          <section>
            <h3 className="text-lg font-medium text-emojot mb-2">Sample Excel File</h3>
            <p className="mb-3">Download our sample Excel file to see the correct format:</p>
            <Button
              onClick={() => {
                const data = [
                  ["Location", "Link"],
                  ["Colombo Municipal Council", "https://emo.run/taxmgt"],
                ]

                // Create a new workbook
                const wb = XLSX.utils.book_new()
                const ws = XLSX.utils.aoa_to_sheet(data)
                XLSX.utils.book_append_sheet(wb, ws, "Sheet1")

                // Generate and download the file
                XLSX.writeFile(wb, "sample-eh-file.xlsx")
              }}
              className="w-full bg-emojot hover:bg-emojot/90 flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Sample Excel File
            </Button>
          </section>

          <section className="border-t pt-3">
            <h3 className="text-lg font-medium text-emojot mb-2">After Generation</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Preview generated QR codes</li>
              <li>Download individual QR codes</li>
              <li>Download all QR codes as a ZIP file</li>
            </ul>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}

