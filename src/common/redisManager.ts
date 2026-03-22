import type { RedisClientType } from "redis"
import { createClient } from "redis"
import type { Bids } from "../types/types.js"
import prisma from "./prismaInit.js"

export class redisManager{
    private static redisInstance:redisManager
    private client:RedisClientType
    private publisher:RedisClientType
    private room:any
    private current_price:number
    private bids:Map<string,Object>

    constructor(){
        this.client=createClient({
            url:process.env.REDIS_URL||"redis://localhost:6379"
        })
        this.client.connect().then((e)=>{
            console.log("connected")
        }).catch((e)=>{
            console.log("error connecting",e)
        })
        this.publisher=createClient({
            url:process.env.REDIS_URL||"redis://localhost:6379"
        })
        this.publisher.connect().then((e)=>{
            console.log("connected")
        }).catch((e)=>{
            console.log("error connecting",e)
        })
        this.current_price=0
        this.bids=new Map()
    }
    
    public static getInstance(){
        if(!this.redisInstance){
            this.redisInstance=new redisManager()
        }
        return this.redisInstance
    }
    
    public async auctionStarting(roomId:string){
       const minPrice=await prisma.product.findUnique({
            where:{
                roomId
            },select:{
                minPrice:true
            }
        })
        console.log("[lol]",minPrice)
        if(minPrice){
            this.current_price=minPrice.minPrice
            console.log("[lol] changing the price",minPrice)
        }
        // this.room.push(roomId)
        // i dont think this is needed but lets see 
        this.bids=new Map()
        this.startWorker(roomId)  
    }
    
    private async startWorker(roomId:string){
        while(true){
            console.log("started a new worker")
            const data=await this.publisher.brPop(`bids:${roomId}`,0)
            if(data){
                await this.matchOrder(JSON.parse(data.element) as Bids,roomId)
            }
        }
    }
    
    public async addOrder(productName:string,roomId:string,price:number,buyerId:string,buyerName:string,ownerId:string,ownerName:string){
        const data:Bids={
            roomId: roomId,
            price,
            productName,
            buyerId,
            buyerName,
            ownerId,
            ownerName
        }
        if(this.current_price===0){
            await this.auctionStarting(roomId)
        }
        // here key
        const appendToRedisQueue=await this.client.lPush(`bids:${roomId}`,JSON.stringify(data))
        const matchOrder=await this.matchOrder(data,roomId)
        if(matchOrder.flag){
            this.current_price=price
            console.log("price updated to",price)
            return true
        }else{
            return false
        }
    }

    // bug here the current price is set to zero - we should query it from the db and set it on it
    private async matchOrder(bid:Bids,key:string){
        const price=bid.price
        console.log("[LOL]",this.current_price)
        if(price>this.current_price){
            // stream back to socket to taht user
            // WE HAVE THE TYPE export type ORDER_REJECTED="ORDER_REJECTED"
            // TO-DO ADD DB CALL HERE 
            console.log("state of bid old",bid)
            this.bids.set(key,bid)
            console.log("state of bid updated",bid)
            return {flag:true}
        }else{
            // WE HAVE THE TYPE export type ORDER_REJECTED="ORDER_REJECTED"
            // REJECTED="ORDER_REJECTED"
            console.log("state of bid old",bid)
            this.bids.set(key,bid)
            console.log("state of bid updated",bid)
            return {flag:false}
        }
    }
}