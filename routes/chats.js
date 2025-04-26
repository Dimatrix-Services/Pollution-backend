
import express from 'express';
import axios from 'axios';
import Chats from '../models/ChatbotModel.js';
import auth from '../middleware/auth.js';

const router=express.Router()

router.post("/chatPost",auth.auth, async(req,res)=>{

    try{
        let body=req.body
        const token= process.env.CHATTOKEN
        const data= await axios.post("https://api.cohere.ai/v1/generate",{
            model: "command",  // or "command-light"
            prompt: req.body.prompt|| "Talk about Weather",
            max_tokens: 50,
            temperature: 0.7
          },{headers:{
            Authorization:`Bearer ${token}`
          }})
          console.log(data.data)
        const chat_creation=await Chats.create({
            userId:req.user._id,
            msg:body.prompt||"Hii",
            response:data.data.generations[0].text,
            msgTime:body.promtTime
        })
        res.send(chat_creation)
    }catch(err){
        console.log(err.message)
    }
} )

router.get("/get",auth.auth,async(req,res)=>{
try{
const data=await Chats.find({userId:req.user._id})
res.send(data)
}catch(err){
    console.log(err.message)
}
})

export default router