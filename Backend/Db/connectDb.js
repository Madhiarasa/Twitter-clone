import mongoose from "mongoose";

const connectDb=async()=>{
    try{
       await mongoose.connect(process.env.MONGO_URL)
       console.log("MONGO CONNECTED")
    }
    catch(error){
        console.log(`ERROR ${error}`)
        process.exit(1)
    }
}
export default connectDb