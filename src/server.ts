import 'dotenv/config'
import express from 'express'
import userRoutes from './routes/buyerRoutes.js'
import userCrudRoutes from './routes/userRoutes.js'
import listingRoutes from './routes/listingRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import { WebSocketServer,WebSocket } from 'ws';
import { userManager } from './common/userManager.js';
const wss = new WebSocketServer({ port: 8080 });
let uuid:string
wss.on('connection', function connection(ws:WebSocket) {
uuid=Math.random().toString()
ws.on('message',(data:any)=>{
    const message=JSON.parse(data)
    if(message.type==="join"){
        const roomId=message.roomId
        userManager.getInstance().addUser(uuid,ws,roomId)
    }else if(message.type==="leaveRoom"){
        userManager.getInstance().leaveRoom(uuid,message.roomId)
    }else if(message.type==="message"){
        try {
            const dataParse=(message.data)
            userManager.getInstance().sendMessage(uuid,dataParse)
        } catch (error) {
            console.log("err",error)
        }
    }
    // WRONG WE DONT SEND A TYPE TO CLOSE-- SIMPLE CLOSE THE TAB
    else if(message.type==="close"){
        userManager.getInstance().killUser(uuid)
    }
    // WE DONT SEND CANCELORDER THING FROM SOCKET-- SHIFT THIS LOGIC TO API
    // else if(message.type==="cancelOrder"){
    //     try {
    //         userManager.getInstance().UsercancelOrder(uuid,message)
    //     } catch (error) {
    //         console.log("err",error)
    //     }
    // }
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
app.use("/buyer", userRoutes)
app.use("/user", userCrudRoutes)
app.use("/listings", listingRoutes)
app.use("/admin",adminRoutes)

app.listen(5102, () => {
    console.log('Server running on port 5102')
})
// {
//     "type":"join",
//     "roomId":"321685cb-b379-497d-8369-e48b8f9feb9a"
// }