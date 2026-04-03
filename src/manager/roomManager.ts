import WebSocket from "ws"
export class roomManager{
    private static instance:roomManager
    private rooms:Map<string,WebSocket[]>
    private static construtor(){
        
    }
    constructor(){
        this.rooms=new Map()
    }
    public static getInstance(){
        if(!this.instance){
            this.instance=new roomManager()
        }
        return this.instance
    }

    // i have to write logic ki when it connects to a room

    public addUser(ws:WebSocket){
        const uuid=Math.random().toString(36).substring(2, 15)
        const existingRooms=this.rooms.get(uuid)
        if(existingRooms!.length>0){
            // for user to have multiple tabs opens and bid on 
            // multiple apps
            this.rooms.set(uuid,[...existingRooms || [],ws])
        }else{
            this.rooms.set(uuid,[ws])
        }
    }

    public userLeaving(ws:WebSocket){
        // this.rooms.filter(s=>s.))
    }

}