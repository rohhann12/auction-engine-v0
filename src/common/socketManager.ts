import type { WebSocket } from "ws";

// export class socketManager{
//     private instance:socketManager
//     private userDetails:Map<string,WebSocket[]>= new Map();
//     private constructor(){
//     }

//     public addRecord(ws:WebSocket){
//         const id=this.randomIdGen().toString()
//         const appendToMap=this.userDetails.set(id,ws)
//     }
//     private randomIdGen(){
//         return Math.random()
//     }
// }