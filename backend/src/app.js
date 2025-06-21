import express from "express";
import { createServer } from "node:http"; // Used to connect the express server with socket.io server because express does not have built-in support for WebSockets and both express and socket.io servers have different instances
import { Server } from "socket.io"; // Importing Server from socket.io for Real-time communication
import mongoose from "mongoose";
import cors from "cors"; // Importing cors for Cross-Origin Resource Sharing

const app = express(); // Creating an instance of express server
const server = createServer(app); // Creating a Node.js HTTP server and wrapping the express app with it
const io = new Server(server); // Creating a new instance of socket.io server and passing the HTTP server to it

const port = process.env.PORT || 3000;

const startServer = async () => {
    try {
        const mongoURL =
            process.env.MONGO_URL || "mongodb://localhost:27017/vidora";
        const connectionDB = await mongoose.connect(mongoURL);
        console.log(`Connected to MongoDB at ${connectionDB.connection.host}`);
        // Starting the server
        server.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (err) {
        console.log(err);
    }
};

startServer();

app.use(cors());
app.use(express.json({ limit: "1mb" })); // Middleware to parse JSON requests with a limit of 50mb
app.use(express.urlencoded({ limit: "1mb", extended: true }));

app.get("/", (req, res) => {
    res.send("Hello World!");
});
