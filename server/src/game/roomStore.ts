import { Room } from '../types/room';

const rooms: Record<string, Room> = {};

let waitingPlayer: string | null = null;

export const getWaitingPlayer = () => waitingPlayer;

export const setWaitingPlayer = (socketId: string | null) => {
    waitingPlayer = socketId;
}

//create a new room

export const createRoom = (p1:string, p2:string) => {
    const roomId = `room-${p1}-${p2}`;

    const room: Room = {
        players: [p1,p2],
        board: Array(9).fill(null),
        currentTurn: "X",
    };

    // store the room 
    rooms[roomId] = room;

    return {roomId, room}
};

//get a room by id
export const getRoom = (roomId: string) : Room | null => {
    return rooms[roomId] ?? null;
};

//reset a room
export const resetRoom = (roomId: string) => {
    const room = rooms[roomId];
    if (!room) return null;

    room.board= Array(9).fill(null);
    room.currentTurn = "X";
    return room;
}
