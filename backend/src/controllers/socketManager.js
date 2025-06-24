import {Server} from 'socket.io';

export const connectToSocket=(server) => {
    const io=new Server({server}); // Creating a new instance of socket.io server and passing the HTTP server to it
    return io; // Returning the socket.io server instance
}