import {Server} from "socket.io";
import { registeredSocketHandlers } from "./handler";

export const setUpSockets = (io:Server) => {
    io.on("connection", (socket)=>{
        registeredSocketHandlers(io,socket);
    })
};

