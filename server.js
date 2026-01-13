import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./config/db.js";

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "https://gig-flow-frontend-orcin.vercel.app",
        credentials: true
    }
});

io.on("connection", socket => {
    socket.on("join", userId => {
        socket.join(userId);
    });
});

app.set("io", io);

server.listen(process.env.PORT, () => {
    console.log("Server running on port", process.env.PORT);
});
