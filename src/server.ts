import 'dotenv/config'
import express from 'express'
import userRoutes from './routes/userRoutes.js'

const app = express()

app.use(express.json())
app.use(userRoutes)

app.listen(3002, () => {
    console.log('Server running on port 3002')
})