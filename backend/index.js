const express = require("express")
const http = require("http")
const cors = require("cors")
const { Server } = require("socket.io")

const app = express()
const server = http.createServer(app)

app.use(cors())

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
})

// username -> socket.id
const users = new Map()

io.on("connection", (socket) => {
    console.log(`🟢 User connected: ${socket.id}`)

    socket.on("register_user", (username) => {
        users.set(username, socket.id)
        console.log(`👤 Registered: ${username} (${socket.id})`)
        io.emit("online_users", Array.from(users.keys()))
    })

    socket.on("send_message", (data) => {
        console.log("📨 Message received (broadcast):", data)
        io.emit("receive_message", data)
    })

    socket.on("private_message", ({ from, to, text }) => {
        const targetId = users.get(to)
        if (targetId) {
            console.log(`📤 Private message from ${from} to ${to}: ${text}`)
            io.to(targetId).emit("receive_message", { from, text })
        } else {
            console.log(`⚠️ User ${to} not found or offline`)
        }
    })

    socket.on("disconnect", () => {
        const username = [...users.entries()].find(([, id]) => id === socket.id)?.[0]
        if (username) {
            users.delete(username)
            console.log(`🔴 ${username} disconnected`)
            io.emit("online_users", Array.from(users.keys()))
        } else {
            console.log(`🔴 Unknown user disconnected: ${socket.id}`)
        }
    })
})

const PORT = process.env.PORT || 4000
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
})
