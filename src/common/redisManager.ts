import type { RedisClientType } from "redis"
import { createClient } from "redis"
import type { Bids } from "../types/types.js"
import prisma from "../config/prisma.js"
export class redisManager{
    private static redisInstance:redisManager
    private client:RedisClientType
    private publisher:RedisClientType
    private room:any
    private currentPrices:Map<string,number>=new Map()
    // this is for uuid se kitni bids ayi
    private bids:Map<string,Object[]>=new Map()
    private activeWorkers:Map<string,boolean>=new Map()
    private pendingOrder:Map<string,(flag:boolean)=>void>=new Map()
    constructor(){
        this.client=createClient({
            url:process.env.REDIS_URL||"redis://localhost:6379"
        })
        this.client.connect().then((e)=>{
            console.log("connected client")
        }).catch((e)=>{
            console.log("error connecting",e)
        })
        this.publisher=createClient({
            url:process.env.REDIS_URL||"redis://localhost:6379"
        })
        this.publisher.connect().then((e)=>{
            console.log("connected publisher")
        }).catch((e)=>{
            console.log("error connecting",e)
        })
        // this.currentPrices=new Map()
        // this.bids=new Map()
        // this.activeWorkers=new Map()
        // this.pendingOrder=new Map()
    }
    
    public static getInstance(){
        if(!this.redisInstance){
            this.redisInstance=new redisManager()
        }
        return this.redisInstance
    }
    
    public async auctionStarting(roomId:string){
        try {
            const minPrice=await prisma.product.findUnique({
                where:{
                    // we are assuming each product will have its own room and 
                    // that room is what we fetch the price from for that p roduct
                    roomId
                },select:{
                    // min price is the price the seller has asked for
                    minPrice:true
                }
            })
            console.log("[lol]",minPrice)
            if(minPrice){
                this.currentPrices.set(roomId,minPrice.minPrice)
                console.log("[lol] changing the price",minPrice)
            }
            if(!this.activeWorkers.get(roomId)){
                // having this so one worked is popping thorugh the queue to maintian consistency
                this.activeWorkers.set(roomId,true)
                this.Worker(roomId)
            }
            // flush stale bids left in Redis from previous sessions
            await this.client.del(`bids:${roomId}`)
            // this.bids=new Map()
        } catch (error) {
            console.log("err auctionStarting",error)
        }
    }
    
    private async Worker(roomId:string){
        let flag
        while(true){
            try {
                console.log("started a new worker",this.activeWorkers)
                const data=await this.publisher.brPop(`bids:${roomId}`,0)
                console.log("popped from queue",JSON.stringify(data))
                if(data){
                    flag=await this.matchOrder(JSON.parse(data.element) as Bids,roomId)
                }
                if(!flag){
                    console.log("order rejected")
                    // return {flag:false}
                }else{
                    console.log("order accepted")
                    // return {flag:true}
                }
            } catch (error) {
                console.log("err startWorker",error)
            }
        }
    }
    
    public async addOrder(orderId:string,productName:string,roomId:string,price:number,buyerId:string,buyerName:string,ownerId:string,ownerName:string,timeOrderPlaced:string){
        try {
            const status="ORDER_PENDING"
            const data:Bids={
                orderId,
                roomId: roomId,
                price,
                productName,
                buyerId,
                buyerName,
                ownerId,
                ownerName,
                status,
                timeOrderPlaced
            }
            if(!this.currentPrices.has(roomId)){
                console.log("updating price")
                await this.auctionStarting(roomId)
                console.log("updated price",this.currentPrices.get(roomId))
            }
            const currentPrice=this.currentPrices.get(roomId)
            if(currentPrice===undefined){
                return false
            }
            if(price<=currentPrice){
                console.log("order rejected before queueing", { roomId, price, currentPrice })
                return false
            }
            // here key
            const appendToRedisQueue=await this.client.lPush(`bids:${roomId}`,JSON.stringify(data))
            // console.log("appendToRedisQueue",appendToRedisQueue)
            if(!appendToRedisQueue){
                return false
            }
            // return true
            const result=await new Promise((resolve)=>{
                this.pendingOrder.set(orderId,resolve)
            })
            return result
        } catch (error) {
            console.log("err addOrder",error)
            return false
        }
    }

    // bug here the current price is set to zero - we should query it from the db and set it on it
    private async matchOrder(bid:Bids,key:string){
        try {
            const price=bid.price
            const currentPrice=this.currentPrices.get(key) ?? 0
            console.log("[current_price]",currentPrice)
            if(price>currentPrice){
                // stream back to socket to taht user
                console.log("state of bid old",this.bids)
                const a=this.bids.get(key)??[]
                this.bids.set(key,[...a,bid])
                this.currentPrices.set(key,price)
                console.log("state of bid updated",this.bids)
                // return true
               this.pendingOrder.get(bid.orderId)?.(true)
            }else{
                // WE HAVE THE TYPE export type ORDER_REJECTED="ORDER_REJECTED"
                // REJECTED="ORDER_REJECTED"
                // return false
               this.pendingOrder.get(bid.orderId)?.(false)
            }
            this.pendingOrder.delete(bid.orderId)
        } catch (error) {
            console.log("err matchOrder",error)
            return false
        }
    }

    public async cancelOrder(uuid:string,orderId:string,roomId:string){
        try{
            // user can send one order until it fullfills 
            // else cancel that and send another one
            // removing the first occurence from left of the order 
            // console.log(data)
            // const orderId=Object.entries(data)-- no need to complicate
            await this.publisher.lRem(`bids:${roomId}`,1,orderId)
        }catch(e){
            console.log("err cancelling order",e)
        }
    }
    public async subscribeToPubSub(userId:String){
        // now here we make it subscribe to the topic of the roomId and 
        // 
    }
}

// for cancel logic 
// we check that if user has sent cancel flag for it 
