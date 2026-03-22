import express from 'express'
import prisma from '../common/prismaInit.js'
import { redisManager } from '../common/redisManager.js'

const route = express.Router()

// GET all products
route.get("/", async (req: any, res: any) => {
    try {
        const list = await prisma.product.findMany()
        res.status(200).json(list)
    } catch (error) {
        res.status(500).json({ message: "failed to fetch products", error })
    }
})

// GET single product
route.get("/:roomId", async (req: any, res: any) => {
    try {
        const details = await prisma.product.findUnique({ where: { roomId: req.params.roomId } })
        if (!details) return res.status(404).json({ message: "product not found" })
        res.status(200).json(details)
    } catch (error) {
        res.status(500).json({ message: "failed to fetch product", error })
    }
})

// GET bids for a product
route.get("/:roomId/bids", async (req: any, res: any) => {
    try {
        const bids = await prisma.bids.findMany({ where: { roomId: req.params.roomId } })
        res.status(200).json(bids)
    } catch (error) {
        res.status(500).json({ message: "failed to fetch bids", error })
    }
})

// PLACE order/bid
route.post("/:roomId/order", async (req: any, res: any) => {
    try {
        const roomId = req.params.roomId
        const { price, productName, buyerId, buyerName, ownerId, ownerName } = req.body
        const pushOrder = await redisManager.getInstance().addOrder(productName, roomId, price, buyerId, buyerName, ownerId, ownerName)
        if (!pushOrder) {
            res.status(200).json({ message: "order not placed" })
        } else {
            res.status(201).json({ message: "order placed" })
        }
    } catch (error) {
        res.status(500).json({ message: "failed to place order", error })
    }
})

export default route
