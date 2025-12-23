import {useEffect, useMemo} from "react";
import io, {Socket} from "socket.io-client";

export const useSocket = (serverUrl: string) : Socket => {
    const socket = useMemo(
        ()=> io(serverUrl, {transports: ["websocket"]}),
        [serverUrl]
    );

    useEffect(()=>{
        return () => {
            socket.disconnect();
        };
    },[socket]);

    return socket;
}
