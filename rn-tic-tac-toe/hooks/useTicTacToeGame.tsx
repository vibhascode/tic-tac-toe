import { Socket } from "socket.io-client";
import { useCallback, useEffect, useRef, useState } from "react";
import { CellValue, Symbol, GameStartPayload, GameOverPayload, GameStatePayload } from "../types/type-Game";

// status - to find who's turn it is, who won, who lost, or is it a draw
type Status =
  | "Finding Opponent"
  | "Your Turn"
  | "Opponent's Turn"
  | "You Win"
  | "You Lose"
  | "Draw";

// UDF to define custom hook
export const useTicTacToeGame = (socket: Socket) => {
    const [roomId, setRoomId] = useState<string | null>(null);
    const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
    const [currentTurn, setCurrentTurn] = useState<Symbol>("X");
    const [mySymbol, setMySymbol] = useState<Symbol | null>(null);
    
    // Ref is crucial for socket listeners to see the current value without re-running the effect
    const mySymbolRef = useRef<Symbol | null>(null);

    const [status, setStatus] = useState<Status>("Finding Opponent");
    const [showRematch, setShowRematch] = useState<boolean>(false);

    // Helper to calculate status string
    const setTurnStatus = useCallback((turn: Symbol, mine: Symbol | null) => {
        if (!mine) {
            setStatus("Finding Opponent");
        } else {
            setStatus(turn === mine ? "Your Turn" : "Opponent's Turn");
        }
    }, []);

    useEffect(() => {
        const onConnect = () => {
            console.log("Connected to server");
        };

        const onGameStart = (payload: GameStartPayload) => {
            setShowRematch(false);
            setRoomId(payload.roomId);
            setBoard(payload.board);
            setCurrentTurn(payload.currentPlayer);
            setMySymbol(payload.mySymbol);
            
            // Sync the ref immediately
            mySymbolRef.current = payload.mySymbol;

            // Use payload values directly to avoid waiting for state update
            setTurnStatus(payload.currentPlayer, payload.mySymbol);
        };

        const onGameState = ({ board, currentPlayer }: GameStatePayload) => {
            setBoard(board);
            setCurrentTurn(currentTurn);
            // Use mySymbolRef.current because mySymbol state is "stale" inside this closure
            setTurnStatus(currentTurn, mySymbolRef.current);
        };

        const onGameOver = ({ board, winner, isDraw }: GameOverPayload) => {
            setBoard(board);
            setShowRematch(true);
            if (isDraw) {
                setStatus("Draw");
            } else if (winner === mySymbolRef.current) {
                setStatus("You Win");
            } else {
                setStatus("You Lose");
            }
        };

        // --- FIX: Use .on to start listening ---
        socket.on("connect", onConnect);
        socket.on("gameStart", onGameStart);
        socket.on("gameState", onGameState);
        socket.on("gameOver", onGameOver);

        // Cleanup: Use .off to stop listening when component unmounts
        return () => {
            socket.off("connect", onConnect);
            socket.off("gameStart", onGameStart);
            socket.off("gameState", onGameState);
            socket.off("gameOver", onGameOver);
        };
    }, [socket, setTurnStatus]);

    const canPlay = roomId && mySymbol && currentTurn === mySymbol;

    const makeMove = useCallback(
        (index: number) => {
            // Check if move is valid locally first
            if (!roomId || !mySymbol || board[index] || currentTurn !== mySymbol) {
                return;
            }

            socket.emit("make_move", { roomId, index, symbol: mySymbol });
        },
        [socket, roomId, board, currentTurn, mySymbol]
    );

    const restartGame = useCallback(() => {
        if (!roomId) return;
        socket.emit("reset_game", { roomId });
    }, [roomId, socket]);

    return {
        board,
        status,
        roomId,
        currentTurn,
        mySymbol,
        showRematch,
        canPlay: Boolean(canPlay),
        makeMove,
        restartGame,
    };
};
