import type { Request, Response, NextFunction } from 'express'
import prisma from '../config/prisma.js'

export interface AuthRequest extends Request {
    user: {
        id: string
        role: string
        isOwner: boolean
        active: boolean
    }
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const userId = req.headers['x-user-id'] as string | undefined

    if (!userId) {
        res.status(401).json({ message: 'missing x-user-id header' })
        return
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })

    if (!user) {
        res.status(401).json({ message: 'user not found' })
        return
    }

    req.user = { id: user.id, role: user.role, isOwner: user.isOwner, active: user.active }
    next()
}
