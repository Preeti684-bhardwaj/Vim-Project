const express = require("express")
const cors = require("cors")
const errorMiddleware = require("./middleware/error.js")
require("dotenv").config({path:"./.env"})

const app = express()

app.use(cors())
app.use(express.static("public/temp"));
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// Routes Imports
const userRouter = require("./routes/userRoute.js")
const instructionRouter=require("./routes/instructionRoute.js")
const musicRouter = require("./routes/musicRoute.js")

// app.get("/", (req,res,next)=>{
//     return res.status(200).json({
//         success: true,
//         message: "Deployed Successfully"
//     })
// })

//routes declaration
app.use("/api/v1/user", userRouter)
app.use("/api/v1/instruction",instructionRouter)
app.use("/api/v1/audio", musicRouter)

// Middleware for error
app.use(errorMiddleware)

module.exports = app