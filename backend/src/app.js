import 'dotenv/config'
import express from "express";
import { createServer } from "node:http"; // Used to connect the express server with socket.io server because express does not have built-in support for WebSockets and both express and socket.io servers have different instances
import mongoose from "mongoose";
import cors from "cors"; // Importing cors for Cross-Origin Resource Sharing
import { connectToSocket } from "./controllers/socketManager.js";// Importing the connectToSocket function to connect socket.io with the HTTP server
import userRoutes from "./routes/users.routes.js"; // Importing user routes for handling user-related requests
import cookieParser from "cookie-parser"; // Importing cookie-parser to parse cookies in requests

const app = express(); // Creating an instance of express server
const server = createServer(app); // Creating a Node.js HTTP server and wrapping the express app with it
const io = connectToSocket(server);  // Connecting the socket.io server to the HTTP server

const port = process.env.PORT || 3000;


app.use(cors({
    origin: 'http://localhost:5173', // Allowing all origins for CORS, change this in production to specific frontend URL
    credentials: true, // Allowing credentials
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowing specific HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'] // Allowing specific headers
}));
app.use(cookieParser("Secret")); // Middleware to parse cookies in requests
app.use(express.json({ limit: "1mb" })); // Middleware to parse JSON requests with a limit of 50mb
app.use(express.urlencoded({ limit: "1mb", extended: true }));

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.use("/api/v1/users", userRoutes);

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