import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dontenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js"
import postRoute from "./routes/post.route.js"
import messageRoute from "./routes/message.route.js";

dontenv.config({});
const app = express();
const PORT = process.env.PORT || 9000;


app.get("/", (req, res) => {
   return res.status(200).json({
      message: " i am coming from the backand",
      success: true,
   })
})
// middlware
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

const corsOptions = {
   origin: 'https://localhost:5173',
   methods: "GET,POST,PUT,DELETE,PATCH,HEAD",
   Credential: true,
}

app.use(cors(corsOptions));

// api  endpoint 
app.use("/api/v1/user", userRoute)
app.use("/api/v1/post", postRoute)
app.use("/api/v1/message", messageRoute);


app.listen(PORT, () => {
   connectDB();
   console.log(`server linsten at port ${PORT}`);

})