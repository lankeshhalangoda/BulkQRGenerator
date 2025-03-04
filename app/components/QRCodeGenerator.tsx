"use client"

import { useEffect, useRef } from "react"
import QRCode from "qrcode"
import JSZip from "jszip"

declare global {
  interface Window {
    zipBlob?: Blob
  }
}

interface QRCodeGeneratorProps {
  data: any[]
  selectedColumns: string[]
  logo: File | string
  isDefaultLogo: boolean
  isSingleQR: boolean
  singleQRText?: string
  onComplete: (qrCodes: string[]) => void
  onError: (error: string) => void
}

export default function QRCodeGenerator({
  data,
  selectedColumns,
  logo,
  isDefaultLogo,
  isSingleQR,
  singleQRText = "",
  onComplete,
  onError,
}: QRCodeGeneratorProps) {
  // Add a ref to track if onComplete has been called
  const hasCompletedRef = useRef(false)

  useEffect(() => {
    // Reset the ref when the component mounts
    hasCompletedRef.current = false

    const generateQRCodes = async () => {
      try {
        const zip = new JSZip()
        const logoDataUrl = isDefaultLogo ? (logo as string) : await readFileAsDataURL(logo as File)
        const fileNameCounts: { [key: string]: number } = {}
        const generatedQRCodes: string[] = []

        for (const item of data) {
          const displayText = isSingleQR
            ? singleQRText
            : selectedColumns
                .map((col) => item[col] || "")
                .filter(Boolean)
                .join(" - ")

          const link = item.Link || "#"
          const baseFileName = getBaseFileName(item, isSingleQR)
          const fileName = getUniqueFileName(baseFileName, fileNameCounts)

          const qrCodeDataUrl = await QRCode.toDataURL(link, {
            errorCorrectionLevel: "H",
            margin: 1,
            width: 2000,
            height: 2000,
          })

          const finalImageDataUrl = await combineQRCodeWithLogo(qrCodeDataUrl, logoDataUrl, displayText)
          generatedQRCodes.push(finalImageDataUrl)

          const finalImageData = finalImageDataUrl.split(",")[1]
          zip.file(`${fileName}.png`, finalImageData, { base64: true })
        }

        // Store the zip content but don't automatically download it
        const content = await zip.generateAsync({ type: "blob" })
        window.zipBlob = content

        // Only call onComplete if it hasn't been called yet
        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true
          onComplete(generatedQRCodes)
        }
      } catch (err) {
        onError("Error generating QR codes: " + (err instanceof Error ? err.message : String(err)))
      }
    }

    generateQRCodes()

    // Cleanup function
    return () => {
      // This ensures we don't call onComplete if the component unmounts
      hasCompletedRef.current = true
    }
  }, [data, selectedColumns, logo, isDefaultLogo, isSingleQR, singleQRText, onComplete, onError])

  return null
}

function getBaseFileName(item: any, isSingle: boolean): string {
  if (isSingle) return "QR_Code"
  if (item.Location) return item.Location
  return item.Branch || item.Region || "QR_Code"
}

function getUniqueFileName(baseFileName: string, counts: { [key: string]: number }): string {
  counts[baseFileName] = (counts[baseFileName] || 0) + 1
  return counts[baseFileName] === 1 ? baseFileName : `${baseFileName} - ${counts[baseFileName]}`
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function combineQRCodeWithLogo(qrCodeDataUrl: string, logoDataUrl: string, displayText: string): Promise<string> {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Could not get canvas context")

  const size = 1600
  canvas.width = size
  canvas.height = size

  // Draw white background
  ctx.fillStyle = "white"
  ctx.fillRect(0, 0, size, size)

  // Draw QR Code
  const qrCodeImg = await loadImage(qrCodeDataUrl)
  const qrSize = 1440
  const qrPadding = (size - qrSize) / 2
  ctx.drawImage(qrCodeImg, qrPadding, qrPadding - 40, qrSize, qrSize)

  // Draw Logo
  const logoImg = await loadImage(logoDataUrl)
  const logoBackgroundSize = 360
  const centerX = size / 2
  const centerY = size / 2 - 40
  const logoAspectRatio = logoImg.width / logoImg.height
  let logoWidth, logoHeight
  if (logoAspectRatio > 1) {
    logoWidth = Math.min(logoBackgroundSize - 40, logoImg.width)
    logoHeight = logoWidth / logoAspectRatio
  } else {
    logoHeight = Math.min(logoBackgroundSize - 40, logoImg.height)
    logoWidth = logoHeight * logoAspectRatio
  }

  // Draw white background with black border for logo
  ctx.fillStyle = "white"
  ctx.fillRect(
    centerX - logoBackgroundSize / 2,
    centerY - logoBackgroundSize / 2,
    logoBackgroundSize,
    logoBackgroundSize,
  )
  ctx.strokeStyle = "black"
  ctx.lineWidth = 12
  ctx.strokeRect(
    centerX - logoBackgroundSize / 2,
    centerY - logoBackgroundSize / 2,
    logoBackgroundSize,
    logoBackgroundSize,
  )

  ctx.drawImage(logoImg, centerX - logoWidth / 2, centerY - logoHeight / 2, logoWidth, logoHeight)

  // Draw Text only if displayText is not empty
  if (displayText && displayText.trim() !== "") {
    ctx.font = "bold 48px Arial"
    ctx.fillStyle = "black"
    ctx.textAlign = "center"
    ctx.fillText(displayText, size / 2, size - 80)
  }

  return canvas.toDataURL("image/png", 1.0)
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.crossOrigin = "anonymous"
    img.src = src
  })
}

