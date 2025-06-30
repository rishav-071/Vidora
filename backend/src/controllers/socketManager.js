import { Server } from "socket.io";

let connections = {},
    messages = {},
    timeOnline = {};

export const connectToSocket = (server) => {
    const io = new Server(server,{
        cors: { // This CORS configuration is only for development not for production. Remove it in production.
            origin: '*', // Allowing all origins for CORS
            methods: ['GET', 'POST'], // Allowing GET and POST methods
            allowedHeaders: ['*'], // Allowing all headers
            credentials: true // Allowing credentials
        }
    }); // Creating a new instance of socket.io server and passing the HTTP server to it

    io.on("connection", (socket) => {
        socket.on("join-call", (path) => {
            if (connections[path] === undefined) connections[path] = [];
            connections[path].push(socket.id);
            timeOnline[socket.id] = Date.now();
            for (let i = 0; i < connections[path].length; i++)
                io.to(connections[path][i]).emit(
                    "user-joined",
                    socket.id,
                    connections[path]
                );
            if (message[path] !== undefined) {
                for (let i = 0; i < message[path].length; i++)
                    io.to(socket.id).emit(
                        "message",
                        message[path][i]["data"],
                        message[path][i]["sender"],
                        message[path][i]["socket-id-sender"]
                    );
            }
        });

        socket.on("chat-message", (data, sender) => {
            const [path, found] = Object.entries(connections).reduce(
                ([matchedPath, isFound], [currentPath, sockets]) => {
                    if (!isFound && sockets.includes(socket.id))
                        return [true, currentPath];
                    return [matchedPath, isFound];
                },
                [false, null]
            );
            if(found){
                if(!messages[path]) messages[path] = [];
                messages[path].push({
                    data: data,
                    sender: sender,
                    "socket-id-sender": socket.id
                });
                connections[path].forEach(ele => {
                    io.to(ele).emit('chat-message', data, sender, socket.id);
                });
            }
        });

        socket.on('disconnect',()=>{
            Object.entries(connections).forEach((path, sockets)=>{
                if(sockets.includes(socket.id)){
                    connections[path].forEach((id)=>{
                        io.to(id).emit('user-left', socket.id);
                    })
                    connections[path]=connections[path].filter(id=> id!== socket.id);
                    if(connections[path].length===0){
                        delete connections[path];
                        delete messages[path];
                    }
                }
            });
        })
    });

    return io; // Returning the socket.io server instance
};
