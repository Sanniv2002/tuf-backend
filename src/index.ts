import express from "express";
import { PrismaClient } from "@prisma/client";
import CORS from "cors";
import { postSchema, Schema } from "./common";
import Redis from "ioredis"

//Declaring Global Useables
const PORT = process.env.PORT || 3000;
const app = express();
const client = new PrismaClient();
const redisClient = new Redis()

//Function to fetch or get data from db or cache
const getData = async (key: string) => {
  try{
    const cachedData = await redisClient.get(key)
    if(cachedData){
      console.log("Returned from cache")
      return JSON.parse(cachedData)
    }
    else{
      const newData = await client.user.findUnique({
        where:{
          username: key
        }
      })
      await redisClient.set(key, JSON.stringify(newData))
      return newData
    }
  }
  catch (e) {
    console.log("DB error/Internal server error")
  }

}

app.use(CORS()); //Middleware for Cross-Origin Resource Sharing Error
app.use(express.json()); //Middleware to parse JSON Body

app.get("/api/v1", (_, res) => {
  res.status(200).json({
    message: "Server is healthy"
  });
});

//Route to create a new code snippet
app.post("/api/v1/create", async (req, res) => {
  try {
    const data: postSchema = req.body;
    const validateData = Schema.safeParse(data);
    if (!validateData.success) res.json({ message: "Wrong data was sent" });
    const response = await client.user.create({
      data: data,
    });
    res.status(200).json(response)
  } catch (e) {
    res.status(500).json({
      error: `Internal server error ${e}`,
    });
  }
});

//Route to get the code snippet and user details
app.get("/api/v1/code", async (req, res) => {
    const user = req.query.user as string || ""
    const response = await getData(user)
    if (response) {
      const truncatedSrc = response.src.substring(0, 100);
      response.src = truncatedSrc;
  }
    res.send(response)
})

app.listen(PORT, () => {
  console.log("Server started at PORT:", PORT);
});
