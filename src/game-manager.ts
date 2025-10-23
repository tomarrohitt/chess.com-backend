import { WebSocket } from "ws";
import { MESSAGE_TYPES } from "./messages";
import { Game as GameClass } from "./game";

interface GameMessage {
  type: "init_game" | "move" | "game_over";
  payload: { from: string; to: string };
}

export class GameManager {
  private games: GameClass[];
  private pendingUser: WebSocket | null;
  private users: WebSocket[];

  constructor() {
    this.games = [];
    this.users = [];
    this.pendingUser = null;
  }

  addUser(socket: WebSocket) {
    this.users.push(socket);
    this.addHandler(socket);
  }
  removeUser(socket: WebSocket) {
    this.users = this.users.filter((user) => user !== socket);
  }
  private addHandler(socket: WebSocket) {
    socket.on("message", (data) => {
      const message: GameMessage = JSON.parse(data.toString());
      if (message.type === MESSAGE_TYPES.INIT_GAME) {
        if (this.pendingUser) {
          const game = new GameClass(this.pendingUser, socket);
          this.games.push(game);
          this.pendingUser = null;
        } else {
          this.pendingUser = socket;
        }
      }

      if (message.type === MESSAGE_TYPES.MOVE) {
        const game = this.games.find(
          (game) => game.player1 === socket || game.player2 === socket
        );
        if (game) {
          game.makeMove(socket, message.payload);
        }
      }
    });
  }
}
