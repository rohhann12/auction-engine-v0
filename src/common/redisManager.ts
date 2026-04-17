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
    // this is for uuid se kitni bids ayi
    private bids:Map<string,Object>
    private activeWorkers:Map<string,boolean>
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
        this.current_price=0
        this.bids=new Map()
        this.activeWorkers=new Map()
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
                    // that room is what we fetch the price from for that product
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
            if(!this.activeWorkers.get(roomId)){
                this.activeWorkers.set(roomId,true)
                this.Worker(roomId)
            }
            // flush stale bids left in Redis from previous sessions
            await this.client.del(`bids:${roomId}`)
            this.bids=new Map()
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
                if(flag?.flag==false){
                    console.log("order rejected")
                }else{
                    console.log("order accepted")
                }
            } catch (error) {
                console.log("err startWorker",error)
            }
        }
    }
    
    public async addOrder(orderId:string,productName:string,roomId:string,price:number,buyerId:string,buyerName:string,ownerId:string,ownerName:string){
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
                status
            }
            if(this.current_price===0){
                console.log("updating price")
                await this.auctionStarting(roomId)
                console.log("updated price",this.current_price)
            }
            // here key
            const appendToRedisQueue=await this.client.lPush(`bids:${roomId}`,JSON.stringify(data))
            console.log("pushed to queue",JSON.stringify(appendToRedisQueue))
            console.log("matching in progress");
            // const matchOrder=await this.matchOrder(data,roomId)
            // console.log("matched",matchOrder)
            // if(matchOrder.flag){
            //     return true
            // }else{
            //     return false
            // }
        } catch (error) {
            console.log("err addOrder",error)
            return false
        }
    }

    // bug here the current price is set to zero - we should query it from the db and set it on it
    private async matchOrder(bid:Bids,key:string){
        try {
            const price=bid.price
            console.log("[current_price]",this.current_price)
            if(price>this.current_price){
                // stream back to socket to taht user
                // WE HAVE THE TYPE export type ORDER_REJECTED="ORDER_REJECTED"
                console.log("state of bid old",this.bids)
                const a=this.bids.set(key,bid)
                this.current_price=price
                console.log("state of bid updated",this.bids)
                return {flag:true}
            }else{
                // WE HAVE THE TYPE export type ORDER_REJECTED="ORDER_REJECTED"
                // REJECTED="ORDER_REJECTED"
                return {flag:false}
            }
        } catch (error) {
            console.log("err matchOrder",error)
            return {flag:false}
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

}

// for cancel logic 
// we check that if user has sent cancel flag for it 