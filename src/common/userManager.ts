import WebSocket from "ws"
import type { Bids } from "../types/types.js"
import { redisManager } from "./redisManager.js"
export class userManager{
    private static instance:userManager
private userRoomSessions:Map<string,string[]>

    private constructor(){
        this.userRoomSessions=new Map()
    }

    public static getInstance(){
        if(!this.instance){
            return this.instance=new userManager()
        }
        return this.instance
    }

    public addUser(uuid:string,connection:WebSocket,roomId:string){
        console.log("this.users before appending",this.userRoomSessions)
        this.userRoomSessions.set(uuid,[roomId])
        console.log("this.users after appending",this.userRoomSessions)
    }
    
    public leaveRoom(uuid:string,roomId:String){
        const getArr=this.userRoomSessions.get(uuid)
        console.log("before removing",getArr)
        const removeArr=getArr?.filter((r)=>r!==roomId)
        console.log("removed user",removeArr)
        const leaveRoom=this.userRoomSessions.set(uuid,removeArr||[])
    }
    public killUser(uuid:string){
        const removeUser=this.userRoomSessions.set(uuid,[]);
    }
    public async sendMessage(uuid:string,message:Bids){
        // send order to the addOrder in the redisManager where trades happen
        const productname=message.productName
        const roomId=message.roomId
        const price=message.price
        const buyerId=message.buyerId
        const buyerName=message.buyerName
        const ownerId=message.ownerId
        const ownerName=message.ownerName
        try {
            const orderAdd=await redisManager.getInstance().addOrder(productname,roomId,price,buyerId,buyerName,ownerId,ownerName)
            console.log("orderAdd",orderAdd)
        } catch (error) {
            console.log("err",error)
        }
    }
}