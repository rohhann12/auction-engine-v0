import express from 'express'
import prisma from '../common/prismaInit.js'
import { redisManager } from '../common/redisManager.js'

const route = express.Router()

// START auction
route.post("/:roomId/start", async (req: any, res: any) => {
    try {
        const { roomId } = req.params
        const listing = await prisma.product.findUnique({ where: { roomId } })
        if (!listing) return res.status(404).json({ message: "listing not found" })

        await redisManager.getInstance().auctionStarting(roomId)
        res.status(200).json({ message: "auction started", roomId })
    } catch (error) {
        res.status(500).json({ message: "failed to start auction", error })
    }
})

// CLOSE auction
route.post("/:roomId/close", async (req: any, res: any) => {
    try {
        const { soldForPrice } = req.body
        if (soldForPrice === undefined) return res.status(400).json({ message: "soldForPrice required" })

        const listing = await prisma.product.update({
            where: { roomId: req.params.roomId },
            data: { soldForPrice }
        })
        res.status(200).json({ message: "auction closed", listing })
    } catch (error) {
        res.status(500).json({ message: "failed to close auction", error })
    }
})

// DELETE listing
route.delete("/:roomId", async (req: any, res: any) => {
    try {
        await prisma.product.delete({ where: { roomId: req.params.roomId } })
        res.status(200).json({ message: "listing removed" })
    } catch (error) {
        res.status(500).json({ message: "failed to delete listing", error })
    }
})

export default route
