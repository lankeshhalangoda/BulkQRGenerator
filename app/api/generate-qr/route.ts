import { type NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"
import QRCode from "qrcode"
import sharp from "sharp"

export async function POST(req: NextRequest) {
  console.log("Received POST request to /api/generate-qr")
  try {
    const formData = await req.formData()
    const ehFile = formData.get("ehFile") as File | null
    const logo = formData.get("logo") as File | null
    const selectedColumns = JSON.parse(formData.get("selectedColumns") as string)

    if (!ehFile || !logo || !selectedColumns) {
      console.error("Missing required files or data")
      return NextResponse.json({ error: "Missing required files or data" }, { status: 400 })
    }

    console.log("Processing EH file...")
    const ehBuffer = await ehFile.arrayBuffer()
    const workbook = XLSX.read(new Uint8Array(ehBuffer), { type: "array" })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(sheet)

    if (!Array.isArray(data) || data.length === 0) {
      console.error("Invalid or empty Excel file")
      return NextResponse.json({ error: "Invalid or empty Excel file" }, { status: 400 })
    }

    console.log("Processing logo...")
    const logoBuffer = await logo.arrayBuffer()

    const fileNameCounts: { [key: string]: number } = {}

    console.log("Generating QR codes...")
    const qrCodes = await Promise.all(
      data.map(async (row: any) => {
        const displayText = selectedColumns
          .map((col: string) => row[col] || "")
          .filter(Boolean)
          .join(" - ")
        const link = row["Link"] || "#"
        const baseFileName = getBaseFileName(row)
        const fileName = getUniqueFileName(baseFileName, fileNameCounts)

        const qrCodeBuffer = await QRCode.toBuffer(link, {
          errorCorrectionLevel: "H",
          margin: 1,
          width: 2000, // Increased resolution for higher quality
          height: 2000,
        })

        const finalQR = await sharp({
          create: {
            width: 1600, // Increased size for higher quality
            height: 1600,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 1 },
          },
        })
          .composite([
            {
              input: qrCodeBuffer,
              top: 80,
              left: 80,
              width: 1440,
              height: 1440,
            },
            {
              input: Buffer.from(`
                <svg width="360" height="360">
                  <rect x="0" y="0" width="360" height="360" fill="white" stroke="black" stroke-width="4"/>
                </svg>
              `),
              top: 620,
              left: 620,
            },
            {
              input: await sharp(Buffer.from(logoBuffer)).resize(320, 320, { fit: "inside" }).toBuffer(),
              top: 640,
              left: 640,
              gravity: "center",
            },
            {
              input: {
                text: {
                  text: displayText,
                  font: "Arial Bold",
                  fontSize: 48,
                  rgba: true,
                },
              },
              top: 1520,
              left: 800,
              gravity: "center",
            },
          ])
          .png({ quality: 100 })
          .toBuffer()

        return {
          fileName: `${fileName}.png`,
          data: `data:image/png;base64,${finalQR.toString("base64")}`,
        }
      }),
    )

    console.log(`Generated ${qrCodes.length} QR codes`)
    return NextResponse.json({ qrCodes })
  } catch (error) {
    console.error("Error generating QR codes:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate QR codes" },
      { status: 500 },
    )
  }
}

function getBaseFileName(item: any): string {
  if (item.Location) {
    return item.Location
  }
  return item.Branch || item.Region || "QR_Code"
}

function getUniqueFileName(baseFileName: string, counts: { [key: string]: number }): string {
  counts[baseFileName] = (counts[baseFileName] || 0) + 1
  return counts[baseFileName] === 1 ? baseFileName : `${baseFileName} - ${counts[baseFileName]}`
}

