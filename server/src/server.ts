//code where we will create a server so that 2 players can connect online

import express from "express";
import http from "http";
import { Server } from "socket.io";
import { setUpSockets } from "./socket";

const app = express();
const server = http.createServer(app);

const io = new Server(server,{
    cors:{
        origin:"*",
    },
});

setUpSockets(io);

server.listen(3000,()=>{
    console.log("Server is running on port http://localhost:3000");
})

