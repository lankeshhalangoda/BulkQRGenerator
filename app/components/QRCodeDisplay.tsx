"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Document, Page, Image, StyleSheet } from "@react-pdf/renderer"
import FileSaver from "file-saver"

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    padding: 10,
  },
  qrCode: {
    width: "30%",
    margin: 10,
  },
})

const QRCodePDF = ({ qrCodes }: { qrCodes: string[] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {qrCodes.map((qrCode, index) => (
        <Image key={index} src={qrCode || "/placeholder.svg"} style={styles.qrCode} />
      ))}
    </Page>
  </Document>
)

// Add a function to download the zip file
const downloadZip = () => {
  if (window.zipBlob) {
    FileSaver.saveAs(window.zipBlob, "QR_Codes.zip")
  }
}

export default function QRCodeDisplay({ qrCodes }: { qrCodes: string[] }) {
  const [previewIndex, setPreviewIndex] = useState(0)
  const isSingleQR = qrCodes.length === 1

  return (
    <Card className="mt-8">
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4 text-center">
          {isSingleQR ? "Generated QR Code" : "Generated QR Codes"}
        </h2>

        <div className="flex justify-center mb-4">
          <img
            src={qrCodes[previewIndex] || "/placeholder.svg"}
            alt="QR Code Preview"
            className="w-64 h-64 object-contain border"
          />
        </div>

        {!isSingleQR && (
          <div className="flex justify-center space-x-4 mb-4">
            <Button
              variant="outline"
              onClick={() => setPreviewIndex((prev) => (prev > 0 ? prev - 1 : qrCodes.length - 1))}
              disabled={qrCodes.length <= 1}
              className="border-emojot text-emojot hover:bg-emojot/10"
            >
              Previous
            </Button>
            <span className="flex items-center">
              {previewIndex + 1} of {qrCodes.length}
            </span>
            <Button
              variant="outline"
              onClick={() => setPreviewIndex((prev) => (prev < qrCodes.length - 1 ? prev + 1 : 0))}
              disabled={qrCodes.length <= 1}
              className="border-emojot text-emojot hover:bg-emojot/10"
            >
              Next
            </Button>
          </div>
        )}

        <div className="flex justify-center space-x-4">
          <Button
            onClick={() => {
              const link = document.createElement("a")
              link.href = qrCodes[previewIndex]
              link.download = `QR_Code_${previewIndex + 1}.png`
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
            }}
            className="bg-emojot hover:bg-emojot/90"
          >
            Download Current QR
          </Button>

          <Button onClick={downloadZip} className="bg-emojot hover:bg-emojot/90">
            Download All QR Codes (ZIP)
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

