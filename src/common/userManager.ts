import {WebSocket} from 'ws'
import type { Bids } from "../types/types.js"
import { redisManager } from "./redisManager.js"
import { socketManager } from './socketManager.js'
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

    public addUser(uuid:string,ws:WebSocket,roomId:string){
        // we are setting an empty array for a user id
        this.userRoomSessions.set(uuid,[])
        // socketManager.getInstance().subscribeToPubSub(roomId,ws,[])
    }

    public leaveRoom(uuid:string,roomId:String){
        try {
            const getArr=this.userRoomSessions.get(uuid)
            console.log("before removing",getArr)
            const removeArr=getArr?.filter((r)=>r!==roomId)
            console.log("removed user",removeArr)
            const leaveRoom=this.userRoomSessions.set(uuid,removeArr||[])
        } catch (error) {
            console.log("err leaveRoom",error)
        }
    }
    
    public killUser(uuid:string){
        try {
            // ADD CLOSE TAB EVENT LISTENER -- socket will end and hence we can remove
            const getAllRooms=this.userRoomSessions.get(uuid)
            const removeUser=this.userRoomSessions.set(uuid,[]);
        } catch (error) {
            console.log("err killUser",error)
        }
    }
    
    
    public async UsercancelOrder(uuid:string,message:Bids){
        // send order to the addOrder in the redisManager where trades happen
        const roomId=message.roomId
        const orderId=message.orderId
        try {
            // const data={orderId,productname,roomId,price,buyerId,buyerName,ownerId,ownerName}
            const orderAdd=await redisManager.getInstance().cancelOrder(uuid,orderId,roomId)
            console.log("orderAdd",orderAdd)
        } catch (error) {
            console.log("err",error)
        }
    }
}