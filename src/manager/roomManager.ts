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
    public userLeaving(ws:WebSocket){
        // this.rooms.filter(s=>s.))
    }

}