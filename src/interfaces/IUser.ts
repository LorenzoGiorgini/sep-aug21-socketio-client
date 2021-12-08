import { Room } from "./Room";

export interface IUser {
  username: string
  socketId: string,
  room: Room
}
