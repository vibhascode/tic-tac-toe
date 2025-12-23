import {Symbol} from "../types/room";

export const checkWinner = (board: (string | null)[]): Symbol | null => {
    const lines = [                  //writing all possible winning combinations      
        [0,1,2],                     //here numbers are representing position of the matrix, its 0,1,2 in 1st row, 3,4,5 in 2nd row..
        [3,4,5],
        [6,7,8],
        [0,3,6],
        [1,4,7],
        [2,5,8],
        [0,4,8],
        [2,4,6]
    ];

    for (const [a,b,c] of lines){
        if (board[a] && board[a]==board[b] && board[a]==board[c]){
            return board[a] as Symbol;
        }
    }

    return null; 
};

//function to check if board is full i.e. check if the game is draw 
export const isDraw = (board: (string | null)[]): boolean => {
    return board.every(Boolean);       //checks if all boxes are full

}
