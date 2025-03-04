"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/card"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import FileUpload from "./components/FileUpload"
import ColumnSelector from "./components/ColumnSelector"
import QRCodeGenerator from "./components/QRCodeGenerator"
import QRCodeDisplay from "./components/QRCodeDisplay"
import { Header } from "./components/Header"
import { Footer } from "./components/Footer"
import { ToastContainer, useToast } from "./components/ui/toast-context"
import { DEFAULT_LOGO_URL } from "./constants"
import * as XLSX from "xlsx"

function QRGeneratorApp() {
  const { addToast } = useToast()
  const [ehFile, setEhFile] = useState<File | null>(null)
  const [logo, setLogo] = useState<File | null>(null)
  const [columns, setColumns] = useState<string[]>([])
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [data, setData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQRCodes, setGeneratedQRCodes] = useState<string[]>([])

  // Toggle states
  const [useEhFile, setUseEhFile] = useState(true)
  const [useSingleQR, setUseSingleQR] = useState(false)
  const [useUploadedLogo, setUseUploadedLogo] = useState(true)
  const [useDefaultLogo, setUseDefaultLogo] = useState(false)
  const [singleLink, setSingleLink] = useState("")
  const [singleQRText, setSingleQRText] = useState("")

  // Handle toggle changes with mutual exclusivity
  const handleEhFileToggle = (checked: boolean) => {
    setUseEhFile(checked)
    if (checked) setUseSingleQR(false)
  }

  const handleSingleQRToggle = (checked: boolean) => {
    setUseSingleQR(checked)
    if (checked) {
      setUseEhFile(false)
      setEhFile(null)
      setColumns([])
      setSelectedColumns([])
      setData([])
    }
  }

  const handleUploadedLogoToggle = (checked: boolean) => {
    setUseUploadedLogo(checked)
    if (checked) setUseDefaultLogo(false)
  }

  const handleDefaultLogoToggle = (checked: boolean) => {
    setUseDefaultLogo(checked)
    if (checked) {
      setUseUploadedLogo(false)
      setLogo(null)
    }
  }

  const handleEHFileUpload = async (file: File) => {
    setEhFile(file)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(sheet)

      if (jsonData.length === 0) {
        throw new Error("The Excel file is empty")
      }

      // Check if the file has a "Link" column
      const firstRow = jsonData[0]
      if (!firstRow.hasOwnProperty("Link")) {
        throw new Error("The Excel file must contain a 'Link' column")
      }

      const allColumns = Object.keys(jsonData[0])
      const filteredColumns = allColumns.filter((col) => col.toLowerCase() !== "link")

      setColumns(filteredColumns)
      setSelectedColumns(filteredColumns)
      setData(jsonData)
    } catch (err) {
      setError("Error processing Excel file: " + (err instanceof Error ? err.message : String(err)))
    }
  }

  const handleLogoUpload = (file: File) => {
    setLogo(file)
  }

  const handleColumnToggle = (column: string) => {
    setSelectedColumns((prev) => (prev.includes(column) ? prev.filter((col) => col !== column) : [...prev, column]))
  }

  const validateInputs = (): boolean => {
    // Check if either EH file or single QR is selected
    if (!useEhFile && !useSingleQR) {
      addToast({
        title: "Input Error",
        description: "Please select either 'Upload EH File' or 'Generate Single QR'",
        variant: "destructive",
      })
      return false
    }

    // Check if either uploaded logo or default logo is selected
    if (!useUploadedLogo && !useDefaultLogo) {
      addToast({
        title: "Input Error",
        description: "Please select either 'Upload Logo' or 'Use Default Logo'",
        variant: "destructive",
      })
      return false
    }

    // Check if EH file is selected but not uploaded
    if (useEhFile && !ehFile) {
      addToast({
        title: "Input Error",
        description: "Please upload an EH file",
        variant: "destructive",
      })
      return false
    }

    // Check if uploaded logo is selected but not uploaded
    if (useUploadedLogo && !logo) {
      addToast({
        title: "Input Error",
        description: "Please upload a logo",
        variant: "destructive",
      })
      return false
    }

    // Check if single QR is selected but no link is provided
    if (useSingleQR && !singleLink) {
      addToast({
        title: "Input Error",
        description: "Please enter a link for the QR code",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleGenerate = () => {
    setError(null)
    setGeneratedQRCodes([])

    if (!validateInputs()) return

    setIsGenerating(true)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4">
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Bulk QR Code Generator</CardTitle>
            <CardDescription>Generate QR codes with custom data and logo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input Source Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Input Source</h3>
                  <div className="flex items-center space-x-4">
                    <Switch
                      id="use-eh-file"
                      checked={useEhFile}
                      onCheckedChange={handleEhFileToggle}
                      className="bg-emojot data-[state=checked]:bg-emojot"
                    />
                    <Label htmlFor="use-eh-file">Upload EH File</Label>
                  </div>

                  {useEhFile && (
                    <FileUpload
                      id="eh-file"
                      label="Upload Excel File"
                      accept=".xlsx,.xls"
                      onUpload={handleEHFileUpload}
                    />
                  )}

                  <div className="flex items-center space-x-4">
                    <Switch
                      id="use-single-qr"
                      checked={useSingleQR}
                      onCheckedChange={handleSingleQRToggle}
                      className="bg-emojot data-[state=checked]:bg-emojot"
                    />
                    <Label htmlFor="use-single-qr">Generate Single QR</Label>
                  </div>

                  {useSingleQR && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="single-link">Enter Link</Label>
                        <Input
                          id="single-link"
                          type="url"
                          placeholder="https://example.com"
                          value={singleLink}
                          onChange={(e) => setSingleLink(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="single-qr-text">QR Code Text (Optional)</Label>
                        <Input
                          id="single-qr-text"
                          type="text"
                          placeholder="Text to display below QR code"
                          value={singleQRText}
                          onChange={(e) => setSingleQRText(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Logo Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Logo Options</h3>
                  <div className="flex items-center space-x-4">
                    <Switch
                      id="use-uploaded-logo"
                      checked={useUploadedLogo}
                      onCheckedChange={handleUploadedLogoToggle}
                      className="bg-emojot data-[state=checked]:bg-emojot"
                    />
                    <Label htmlFor="use-uploaded-logo">Upload Logo</Label>
                  </div>

                  {useUploadedLogo && (
                    <FileUpload id="logo" label="Upload Logo" accept="image/*" onUpload={handleLogoUpload} />
                  )}

                  <div className="flex items-center space-x-4">
                    <Switch
                      id="use-default-logo"
                      checked={useDefaultLogo}
                      onCheckedChange={handleDefaultLogoToggle}
                      className="bg-emojot data-[state=checked]:bg-emojot"
                    />
                    <Label htmlFor="use-default-logo">Use Default Logo</Label>
                  </div>

                  {useDefaultLogo && (
                    <div className="flex justify-center">
                      <img
                        src={DEFAULT_LOGO_URL || "/placeholder.svg"}
                        alt="Default Logo"
                        className="h-24 object-contain border p-2"
                      />
                    </div>
                  )}
                </div>
              </div>

              {useEhFile && columns.length > 0 && (
                <ColumnSelector columns={columns} selectedColumns={selectedColumns} onToggle={handleColumnToggle} />
              )}

              <Button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-emojot hover:bg-emojot/90">
                {isGenerating ? "Generating..." : "Generate QR Codes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isGenerating && (
          <QRCodeGenerator
            data={useSingleQR ? [{ Link: singleLink }] : data}
            selectedColumns={selectedColumns}
            logo={useDefaultLogo ? DEFAULT_LOGO_URL : logo!}
            isDefaultLogo={useDefaultLogo}
            isSingleQR={useSingleQR}
            singleQRText={singleQRText}
            onComplete={(qrCodes) => {
              setIsGenerating(false)
              setGeneratedQRCodes(qrCodes)
              addToast({
                title: "Success",
                description: `Generated ${qrCodes.length} QR code${qrCodes.length > 1 ? "s" : ""}`,
                variant: "success",
              })
            }}
            onError={(err) => {
              setError(err)
              setIsGenerating(false)
            }}
          />
        )}

        {generatedQRCodes.length > 0 && <QRCodeDisplay qrCodes={generatedQRCodes} />}
      </main>
      <Footer />
    </div>
  )
}

export default function Home() {
  return (
    <ToastContainer>
      <QRGeneratorApp />
    </ToastContainer>
  )
}

