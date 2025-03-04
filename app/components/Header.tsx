import Image from "next/image"
import { DEFAULT_LOGO_URL } from "../constants"
import { UserGuide } from "./UserGuide"

export function Header() {
  return (
    <header className="bg-emojot text-white py-4">
      <div className="container flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-white rounded-md flex items-center justify-center mr-3">
            <Image
              src={DEFAULT_LOGO_URL || "/placeholder.svg"}
              alt="Emojot Logo"
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold">QR Code Generator</h1>
        </div>
        <UserGuide />
      </div>
    </header>
  )
}

