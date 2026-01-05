import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors"

import userRoute from "./routes/user.route.js"
import authRoute from "./routes/auth.route.js";
import connectDb from "./Db/connectDb.js";
import cloudinary from "cloudinary"
import postRoute from "./routes/post.route.js"
import notificationRoute from "./routes/notificationRoute.js"

dotenv.config();
const app = express();

cloudinary.config({
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET_KEY
})

app.use(cors({
  origin:"http://localhost:3000",
  credentials:true
}))
const PORT = process.env.PORT;

app.use(express.json(
  {
    limit:"5mb"
  }
));
app.use(cookieParser());
app.use(express.urlencoded({
   extended:true
}))

app.use("/api/auth", authRoute);
app.use("/api/users",userRoute);
app.use("/api/posts",postRoute);
app.use("/api/notifications",notificationRoute)

app.listen(PORT, () => {
  console.log(`SERVER IS ON ${PORT}`);
  connectDb();
});
