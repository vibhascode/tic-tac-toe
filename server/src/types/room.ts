export type Symbol = "X" | "O";  

export interface Room{
    players:[string,string];
    board: (Symbol | null)[];        //board must have symbols X,O and initially it will be null
    currentTurn: Symbol;
}
