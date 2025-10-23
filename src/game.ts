import { Chess, Move as MoveType } from "chess.js";
import { WebSocket } from "ws";
import { MESSAGE_TYPES } from "./messages";

export class Game {
  public player1: WebSocket;
  public player2: WebSocket;
  public board: Chess;
  public moves: MoveType[];
  public startTime: Date;
  public moveCount = 0;

  constructor(player1: WebSocket, player2: WebSocket) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();
    this.moves = [];
    this.startTime = new Date();
    this.player1.send(
      JSON.stringify({
        type: MESSAGE_TYPES.INIT_GAME,
        payload: { color: "white" },
      }),
    );
    this.player2.send(
      JSON.stringify({
        type: MESSAGE_TYPES.INIT_GAME,
        payload: { color: "black" },
      }),
    );
  }

  makeMove(socket: WebSocket, move: { from: string; to: string }) {
    if (this.moveCount % 2 === 0 && socket !== this.player1) return;
    if (this.moveCount % 2 === 1 && socket !== this.player2) return;

    try {
      this.board.move(move);
    } catch (e) {
      console.log("Invalid move attempted:", move);
      return;
    }

    if (this.board.isGameOver()) {
      this.player1.send(
        JSON.stringify({
          type: MESSAGE_TYPES.GAME_OVER,
          payload: { winner: this.board.turn() === "w" ? "black" : "white" },
        }),
      );
      return;
    }
    if (this.moveCount % 2 === 0) {
      this.player2.send(
        JSON.stringify({
          type: MESSAGE_TYPES.MOVE,
          payload: move,
        }),
      );
    } else {
      this.player1.send(
        JSON.stringify({
          type: MESSAGE_TYPES.MOVE,
          payload: move,
        }),
      );
    }
    this.moveCount++;
  }
}
