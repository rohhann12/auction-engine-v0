import express from 'express'
import prisma from '../manager/prisma.js'
import { redisManager } from '../manager/redis.js'

const route = express.Router()


route.get("/", async (req: any, res: any) => {
    const list = await prisma.product.findMany()
    console.log("list", list)
    res.json(list)
})

route.get("/product/:productId", async (req: any, res: any) => {
    const productId = req.params.productId
    const details = await prisma.product.findUnique({
        where: {
            productId
        }
    })
    console.log("details", details)
    res.json(details)
})


route.post("/product/:productId/order",async(req:any,res:any)=>{
    const {productId,price,productName,buyerId,buyerName,ownerId,ownerName}=req.body
    const pushOrder=await redisManager.getInstance().addOrder(productId,price,productName,buyerId,buyerName,ownerId,ownerName)
    
})

export default route