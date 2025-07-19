"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function Home() {
  const [message, setMessage] = useState("")

  return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-4 pt-6">
            <h1 className="text-xl font-bold text-center">💬 Real-Time Chat</h1>

            <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <Button onClick={() => alert(`Sending: ${message}`)}>Send</Button>
          </CardContent>
        </Card>
      </main>
  )
}
