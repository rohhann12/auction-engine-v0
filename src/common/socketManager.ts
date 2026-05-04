import { WebSocketServer, WebSocket } from "ws"
import { createClient, type RedisClientType } from "redis"
import type { Bids } from "../types/types.js"
import { userManager } from "./userManager.js"

let uuid=""
uuid=Math.random().toString()
export class socketManager{
    private static instance:socketManager
    private wss:WebSocketServer
    private subscriber:RedisClientType

    private buyerSocket=new Map<string,WebSocket>()
    private roomSocket=new Map<string,WebSocket[]>()
    

    public static getInstance(){
        if(!this.instance){
            this.instance= new socketManager()
        }
        return this.instance
    }
    constructor(){
        this.wss=new WebSocketServer({port:8080})
        this.subscriber=createClient({url:"redis://localhost:6379"})
    }
    public async init(){
        await this.subscriber.connect()
        this.wss.on("connection", (ws) => {
            ws.on("message", (raw) => this.handleMessage(ws, raw.toString()))
            ws.on("close", () => this.handleDisconnect(ws))
      })
    }
    public async handleMessage(ws:WebSocket,raw:string){
        const message=JSON.parse(raw) 
        const userId=message.userId
        if(message.type==="join"){
            const roomId=message.roomId
            userManager.getInstance().addUser(uuid,ws,roomId)
            await this.subscribeToSpecificPubSub(userId,ws)
            }else if(message.type==="leaveRoom"){
                userManager.getInstance().leaveRoom(uuid,message.roomId)
            }
    }
    public async handleDisconnect(ws:WebSocket){
        
    }
    public async subscribeToSpecificPubSub(userId:string,ws:WebSocket){
        // now here we make it subscribe to the topic of the roomId and 
        // this is for when user has placed order and is there to listen to its result -- push to uuid
        // are being made 
        if (!this.buyerSocket.has(userId)) {
          await this.subscriber.subscribe(`userId:${userId}`, (message) => {
            const sockets = this.buyerSocket.get(userId)
            sockets?.send(message)
          })
        }
        this.buyerSocket.set(userId,ws)
    }

    public async subscribeToPubSub(roomId:string,ws:WebSocket,message:any){
        // this is for when user presses on a product
        // and will be listening to the trades that
        // are being made 
        if (!this.roomSocket.has(roomId)) {
          await this.subscriber.subscribe(`room:${roomId}`, (message) => {
            const sockets = this.roomSocket.get(roomId) ?? []
            sockets.forEach((s) => s.send(message))
          })
        }
        const existing=this.roomSocket.get(roomId)??[]
        this.roomSocket.set(roomId,[...existing,ws]);
    }
}
