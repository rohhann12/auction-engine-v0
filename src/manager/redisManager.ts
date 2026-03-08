import type { RedisClientType } from "redis"
import { createClient } from "redis"
import type { Bids } from "../types/types.js"

export class redisManager{
    private static redisInstance:redisManager
    private client:RedisClientType
    private publisher:RedisClientType
    private room:any
    private current_price:number
    private bids:Bids[]
    constructor(){
        this.client=createClient({
            url:""
        })
        this.client.connect().then((e)=>{
            console.log("connected")
        }).catch((e)=>{
            console.log("error connecting",e)
        })
        this.publisher=createClient({
        })
        this.publisher.connect().then((e)=>{
            console.log("connected")
        }).catch((e)=>{
            console.log("error connecting",e)
        })
        this.current_price=0
        this.bids=[]
    }
    public static getInstance(){
        if(!this.redisInstance){
            this.redisInstance=new redisManager()
        }
        return this.redisInstance
    }
    public auctionStarting(productId:string){
        this.room.append(productId)
        // i dont think this is needed but lets see 
        this.bids=[]
        this.startWorker(productId)  // add this
    }
    private async startWorker(productId:string){
        while(true){
            const data=await this.client.brPop(`bids:${productId}`,0)
            if(data){
                await this.matchOrder(JSON.parse(data.element) as Bids,productId)
            }
        }
    }
    public async addOrder(productName:string,productId:string,price:number,buyerId:string,buyerName:string,ownerId:string,ownerName:string){
        const data:Bids={
            productId,
            price,
            productName,
            buyerId,
            buyerName,
            ownerId,
            ownerName
        }
        // here key 
        const appendToRedisQueue=await this.client.lPush(`bids:${productId}`,JSON.stringify(data))
        const matchOrder=await this.matchOrder(data,productId)
        if(matchOrder.flag){
            this.current_price=price
        }
    }
    
    private async matchOrder(bid:Bids,key:String){
        const price=bid.price
        if(price<this.current_price){
            // stream back to socket to taht user
            // WE HAVE THE TYPE export type ORDER_REJECTED="ORDER_REJECTED"
            this.bids.push(bid)
            return {flag:false}
        }else{
            // WE HAVE THE TYPE export type ORDER_REJECTED="ORDER_REJECTED"
            return {flag:false}
        }
    }
}