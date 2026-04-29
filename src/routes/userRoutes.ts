import express from 'express'
import prisma from '../config/prisma.js'

const route = express.Router()

// GET all users
route.get("/", async (req: any, res: any) => {
    try {
        const users = await prisma.user.findMany({ include: { userBids: true } })
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({ message: "failed to fetch users", error })
    }
})

// GET single user
route.get("/:id", async (req: any, res: any) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            include: { userBids: true }
        })
        if (!user) return res.status(404).json({ message: "user not found" })
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({ message: "failed to fetch user", error })
    }
})

// CREATE user
route.post("/", async (req: any, res: any) => {
    try {
        const { role, isOwner } = req.body
        if (!role) return res.status(400).json({ message: "role required (buyer | seller)" })
        const user = await prisma.user.create({
            data: { role, active: true, isOwner: isOwner ?? false }
        })
        res.status(201).json(user)
    } catch (error) {
        res.status(500).json({ message: "failed to create user", error })
    }
})

// UPDATE user
route.put("/:id", async (req: any, res: any) => {
    try {
        const { active, role, isOwner } = req.body
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: {
                ...(active !== undefined && { active }),
                ...(role !== undefined && { role }),
                ...(isOwner !== undefined && { isOwner })
            }
        })
        if(!user)return res.status(400).json({ message: "user not found" })
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({ message: "failed to update user", error })
    }
})

// DELETE user
route.delete("/:id", async (req: any, res: any) => {
    try {
        await prisma.user.delete({ where: { id: req.params.id } })
        res.status(200).json({ message: "deleted" })
    } catch (error) {
        res.status(500).json({ message: "failed to delete user", error })
    }
})

// GET user's bids
route.get("/:id/bids", async (req: any, res: any) => {
    try {
        const bids = await prisma.bids.findMany({ where: { userId: req.params.id } })
        res.status(200).json(bids)
    } catch (error) {
        res.status(500).json({ message: "failed to fetch bids", error })
    }
})

export default route
