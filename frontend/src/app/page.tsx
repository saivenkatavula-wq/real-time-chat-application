// src/app/page.tsx
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import socket from "@/lib/socket"

type ChatMessage = {
    from: string
    text: string
}

export default function Home() {
    const [username, setUsername] = useState("")
    const [tempName, setTempName] = useState("")
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [onlineUsers, setOnlineUsers] = useState<string[]>([])
    const [selectedUser, setSelectedUser] = useState<string | null>(null)

    useEffect(() => {
        socket.on("receive_message", (data: ChatMessage) => {
            setMessages((prev) => [...prev, data])
        })

        socket.on("online_users", (users: string[]) => {
            // Exclude yourself from list
            setOnlineUsers(users.filter((u) => u !== username))
        })

        return () => {
            socket.off("receive_message")
            socket.off("online_users")
        }
    }, [username])

    const handleRegister = () => {
        if (tempName.trim()) {
            setUsername(tempName.trim())
            socket.emit("register_user", tempName.trim())
        }
    }

    const sendMessage = () => {
        if (message.trim() && username) {
            const payload = {
                from: username,
                text: message
            }

            if (selectedUser) {
                // Private message
                socket.emit("private_message", {
                    ...payload,
                    to: selectedUser
                })
            } else {
                // Broadcast
                socket.emit("send_message", payload)
            }

            setMessages((prev) => [...prev, payload])
            setMessage("")
        }
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6">
            <Card className="w-full max-w-md">
                <CardContent className="space-y-4 pt-6">

                    {!username ? (
                        <>
                            <h1 className="text-xl font-bold text-center">Enter Your Name</h1>
                            <Input
                                placeholder="Username"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                            />
                            <Button onClick={handleRegister} className="w-full">Join Chat</Button>
                        </>
                    ) : (
                        <>
                            <h1 className="text-xl font-bold text-center">Welcome, {username}</h1>

                            {onlineUsers.length > 0 && (
                                <div className="flex flex-wrap gap-2 border p-2 rounded bg-slate-100">
                                    <span className="text-sm font-semibold text-gray-600">Online users:</span>
                                    {onlineUsers.map((user) => (
                                        <Button
                                            key={user}
                                            size="sm"
                                            variant={user === selectedUser ? "default" : "outline"}
                                            onClick={() =>
                                                setSelectedUser(user === selectedUser ? null : user)
                                            }
                                        >
                                            {user}
                                        </Button>
                                    ))}
                                </div>
                            )}

                            <div className="h-60 overflow-y-auto border p-2 rounded bg-gray-50 space-y-2">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className="bg-white px-3 py-2 rounded shadow-sm">
                                        <strong>{msg.from}:</strong> {msg.text}
                                    </div>
                                ))}
                            </div>

                            <Input
                                placeholder={
                                    selectedUser
                                        ? `Message @${selectedUser}`
                                        : "Broadcast to all users..."
                                }
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            />

                            <Button onClick={sendMessage} className="w-full">
                                Send
                            </Button>
                        </>
                    )}

                </CardContent>
            </Card>
        </main>
    )
}
