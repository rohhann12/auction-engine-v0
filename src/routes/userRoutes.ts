import express from 'express'
import prisma from '../common/prismaInit.js'
import { redisManager } from '../common/redisManager.js'

const route = express.Router()


route.get("/", async (req: any, res: any) => {
    const list = await prisma.product.findMany()
    console.log("list", list)
    res.json(list)
})

route.get("/:roomId", async (req: any, res: any) => {
    const roomId = req.params.roomId
    const details = await prisma.product.findUnique({
        where: {
            roomId
        }
    })
    console.log("details", details)
    res.json(details)
})


route.post("/:roomId/order",async(req:any,res:any)=>{
    const roomId=req.params.roomId
    const {price,productName,buyerId,buyerName,ownerId,ownerName}=req.body
    console.log("bidding with these details",{roomId,price,productName,buyerId,buyerName,ownerId,ownerName})
    const pushOrder=await redisManager.getInstance().addOrder(productName,roomId,price,buyerId,buyerName,ownerId,ownerName)
    if(!pushOrder){
        res.json({message:"order not placed"})
    }else{
        res.json({message:"order placed"})
    }
})

export default route