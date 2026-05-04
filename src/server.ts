import 'dotenv/config'
import express from 'express'
import userRoutes from './routes/buyerRoutes.js'
import userCrudRoutes from './routes/userRoutes.js'
import listingRoutes from './routes/listingRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import { authMiddleware } from './middleware/auth.js'
import { WebSocketServer,WebSocket } from 'ws';
import { userManager } from './common/userManager.js';
const wss = new WebSocketServer({ port: 8080 });
let uuid:string
wss.on('connection', function connection(ws:WebSocket) {
uuid=Math.random().toString()
ws.on('message',(data:any)=>{
    let message: any
    try {
        message = JSON.parse(data)
    } catch {
        ws.send(JSON.stringify({ error: 'Invalid JSON' }))
        return
    }
    if(message.type==="join"){
        const roomId=message.roomId
        userManager.getInstance().addUser(uuid,ws,roomId)
    }else if(message.type==="leaveRoom"){
        userManager.getInstance().leaveRoom(uuid,message.roomId)
    }
})
});
wss.on('disconnect',(ws:WebSocket)=>{
    try {
        userManager.getInstance().killUser(uuid)
        } catch (error) {
            console.log("err",error)
        }
})

const app = express()
app.use(express.json())

app.get("/health", (req, res) => { res.send("healthy") })

app.use(authMiddleware as any)
app.use("/buyer", userRoutes)
app.use("/user", userCrudRoutes)
app.use("/listings", listingRoutes)
app.use("/admin", adminRoutes)

// Must be last — catches body-parser JSON errors and any route errors
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err.type === 'entity.parse.failed') {
        res.status(400).json({ error: 'Invalid JSON' })
        return
    }
    res.status(500).json({ error: 'Internal server error' })
})
const server = app.listen(5102, () => {
    console.log('Server running on port 5102')
})

function shutdown() {
    wss.close()
    server.close()
    process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
// {
//     "type":"join",
//     "roomId":"321685cb-b379-497d-8369-e48b8f9feb9a"
// }