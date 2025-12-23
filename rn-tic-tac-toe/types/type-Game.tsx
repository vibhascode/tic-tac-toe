//symbols - X , O
export type Symbol = 'X' | 'O';

export type CellValue = Symbol | null;

export type GameStartPayload = {
    roomId: string;
    board:CellValue[];
    currentPlayer:Symbol;
    mySymbol: Symbol;
};

export type GameStatePayload={
    board: CellValue[];
    currentPlayer:Symbol;
};

export type GameOverPayload={
    board:CellValue[];
    winner: Symbol | null;
    isDraw: boolean;
}
