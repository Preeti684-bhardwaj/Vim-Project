const app = require("./app.js")
const {connectDB} = require("./database/dbconnection.js")
require("dotenv").config({path:"./.env"})


process.on("uncaughtException" , (err)=>{
    console.log(`Error: ${err.message}`)
    console.log(`Shutting down the server due to uncaught Exception`)
    process.exit(1)
})
  
connectDB()
.then(() => {
    const server = app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })

    process.on("unhandledRejection" , (err)=>{
        console.log(`Error: ${err.message}`)
        console.log(`Shutting down the server due to Unhandled Promise Rejection`);
    
        server.close(()=>{
            process.exit(1)
        })
    })
})
.catch((err) => {
    console.log("db connection failed !!! ", err);
    process.exit(1)
})