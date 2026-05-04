import { WebSocketServer, WebSocket } from "ws"
import { createClient, type RedisClientType } from "redis"

export class socketManager{
    private static instance:socketManager
    private wss:WebSocketServer
    private subscriber:RedisClientType

    private buyerScoket=new Map<string,WebSocket>()
    private roomSocket=new Map<string,Set<WebSocket>>()
    private socketBuyers=new Map<WebSocket,string>()
    private socketRooms=new Map<WebSocket,Set<string>>()

    public static getInstace(){
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
        
    }
    public async handleDisconnect(ws:WebSocket){
        
    }
}
