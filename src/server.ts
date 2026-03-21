import 'dotenv/config'
import express from 'express'
import userRoutes from './routes/userRoutes.js'
import { WebSocketServer,WebSocket } from 'ws';
import { userManager } from './common/userManager.js';
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws:WebSocket) {
const uuid=Math.random().toString()
ws.on('message',(data:any)=>{
    const message=JSON.parse(data)
    if(message.type==="join"){
        const roomId=message.roomId
        userManager.getInstance().addUser(uuid,ws,roomId)
    }else if(message.type==="leaveRoom"){
        userManager.getInstance().removeUser(uuid,message.roomId)
    }else if(message.type==="message"){
        try {
        console.log("mes",message)
        const dataParse=message.data
        userManager.getInstance().sendMessage(uuid,dataParse)
        console.log("data",dataParse)
        } catch (error) {
            console.log("err",error)
        }
    }else if(message.type==="close"){
        userManager.getInstance().killUser(uuid)
    }
})
});
const app = express()
// claude --resume 3d716b9b-a961-45bb-a51b-c7bcb200a70e
// claude --resume b5b9080a-0230-41fb-90e6-a824d9abbcf6
// claude --resume f9d73936-fff7-4ba4-9173-1864fc44e71e
app.use(express.json())
app.use("/product",userRoutes)


app.listen(5102, () => {
console.log('Server running on port 5102')
})
// {
//     "type":"join",
//     "roomId":"321685cb-b379-497d-8369-e48b8f9feb9a"
// }