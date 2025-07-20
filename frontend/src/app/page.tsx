// src/app/page.tsx
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import socket from "@/lib/socket"

export default function Home() {
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState<string[]>([])

    // Listen for incoming messages
    useEffect(() => {
        socket.on("receive_message", (data) => {
            setMessages((prev) => [...prev, data])
        })

        return () => {
            socket.off("receive_message")
        }
    }, [])

    const sendMessage = () => {
        if (message.trim()) {
            socket.emit("send_message", message)
            setMessage("")
        }
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6">
            <Card className="w-full max-w-md">
                <CardContent className="space-y-4 pt-6">
                    <h1 className="text-xl font-bold text-center">💬 Real-Time Chat</h1>

                    <div className="h-60 overflow-y-auto border p-2 rounded bg-gray-50 space-y-2">
                        {messages.map((msg, idx) => (
                            <div key={idx} className="bg-white px-3 py-2 rounded shadow-sm">
                                {msg}
                            </div>
                        ))}
                    </div>

                    <Input
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") sendMessage()
                        }}
                    />

                    <Button onClick={sendMessage} className="w-full">Send</Button>
                </CardContent>
            </Card>
        </main>
    )
}
