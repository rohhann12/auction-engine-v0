import express from 'express'
import multer from 'multer'
import prisma from '../common/prismaInit.js'
import { uploadImage, deleteImage } from '../common/s3Manager.js'

const route = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

// GET all listings
route.get("/", async (req: any, res: any) => {
    try {
        const listings = await prisma.product.findMany()
        res.status(200).json(listings)
    } catch (error) {
        res.status(500).json({ message: "failed to fetch listings", error })
    }
})

// GET all listings by a seller
route.get("/seller/:ownerId", async (req: any, res: any) => {
    try {
        const listings = await prisma.product.findMany({
            where: { ownerId: req.params.ownerId }
        })
        res.status(200).json(listings)
    } catch (error) {
        res.status(500).json({ message: "failed to fetch seller listings", error })
    }
})

// GET single listing
route.get("/:roomId", async (req: any, res: any) => {
    try {
        const listing = await prisma.product.findUnique({
            where: { roomId: req.params.roomId }
        })
        if (!listing) return res.status(404).json({ message: "listing not found" })
        res.status(200).json(listing)
    } catch (error) {
        res.status(500).json({ message: "failed to fetch listing", error })
    }
})

// CREATE listing (seller lists a product)
route.post("/seller/:ownerId", upload.single("image"), async (req: any, res: any) => {
    try {
        const { ownerId } = req.params
        const { minPrice } = req.body
        if (!minPrice) return res.status(400).json({ message: "minPrice required" })

        const seller = await prisma.user.findUnique({ where: { id: ownerId } })
        if (!seller) return res.status(404).json({ message: "seller not found" })
        if (seller.role !== "seller") return res.status(403).json({ message: "user is not a seller" })

        let imageUrl: string | null = null
        if (req.file) {
            imageUrl = await uploadImage(req.file.buffer, req.file.mimetype)
        }

        const listing = await prisma.product.create({
            data: { minPrice: parseInt(minPrice), ownerId, soldForPrice: parseInt(minPrice), images: imageUrl }
        })
        await prisma.user.update({ where: { id: ownerId }, data: { isOwner: true } })

        res.status(201).json(listing)
    } catch (error) {
        res.status(500).json({ message: "failed to create listing", error })
    }
})

// UPDATE listing
route.put("/:roomId", upload.single("image"), async (req: any, res: any) => {
    try {
        const { minPrice } = req.body
        const { roomId } = req.params

        let imageUrl: string | null | undefined
        if (req.file) {
            // delete old image from S3 if present
            const existing = await prisma.product.findUnique({ where: { roomId }, select: { images: true } })
            if (existing?.images) await deleteImage(existing.images)
            imageUrl = await uploadImage(req.file.buffer, req.file.mimetype)
        }

        const listing = await prisma.product.update({
            where: { roomId },
            data: {
                ...(minPrice !== undefined && { minPrice: parseInt(minPrice) }),
                ...(imageUrl !== undefined && { images: imageUrl })
            }
        })
        res.status(200).json(listing)
    } catch (error) {
        res.status(500).json({ message: "failed to update listing", error })
    }
})


export default route
