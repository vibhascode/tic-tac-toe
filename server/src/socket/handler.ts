//does tasks so that players can connect / join to a game.. etc
import { Server } from "socket.io";
import { createRoom,getRoom,resetRoom, getWaitingPlayer, setWaitingPlayer } from "../game/roomStore";
import { Symbol } from "../types/room";
import {checkWinner,isDraw} from '../game/logic';

export const registeredSocketHandlers = (io:Server, socket:any) => {

    const waiting = getWaitingPlayer();

    if (!waiting){
        setWaitingPlayer(socket.id);
    } else {
        const {roomId, room} = createRoom(waiting, socket.id);
        
        io.to(waiting).socketsJoin(roomId);
        socket.join(roomId);

        io.to(waiting).emit("game_start",{
            roomId,
            board: [...room.board],
            currentTurn: room.currentTurn,
            mySymbol: "X" as Symbol,
        });

        io.to(socket.id).emit("game_start",{
            roomId,
            board:[...room.board],
            currentTurn:room.currentTurn,
            mySymbol: "0" as Symbol
        })

        //clear the waiting player 
        setWaitingPlayer(null);
    }

    interface MakeMoveData{
        roomId: string;
        index: number;
        symbol:Symbol;
    }

    socket.io("make_move",({roomId,index,symbol}: MakeMoveData)=>{
        const room = getRoom(roomId);
        if (!room) return; 

        //validate move
        if (room.board[index] || room.currentTurn != symbol) return;   //checks if the box is empty and is it actually your turn

        //if the move is valid, update the board
        room.board[index] = symbol;
        room.currentTurn = symbol === "X" ? "O" : "X";

        const winner = checkWinner(room.board);
        const draw = !winner && isDraw(room.board);

        if (winner || draw){
            io.to(roomId).emit("game_over",{
                board: [...room.board],
                winner,
                isDraw: draw

            })
        }

    });

    socket.on("reset_game",({roomId}:{roomId: string})=>{
         
        const room = resetRoom(roomId);
        if (!room) return;

        const [p1,p2] = room.players;

        io.to(p1).emit("game_start",{
            roomId,
            board:[...room.board],
            currentTurn: room.currentTurn,
            mySymbol: "X" as Symbol,
        });

        io.to(p2).emit("game_start",{
            roomId,
            board:[...room.board],
            currentTurn: room.currentTurn,
            mySymbol: "O" as Symbol,
        }); 
    });

    socket.on("disconnect",()=>{
        if (getWaitingPlayer() === socket.id){
            setWaitingPlayer(null);
        }
    });
}

