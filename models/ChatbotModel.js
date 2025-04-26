import mongoose from 'mongoose';
import { v4 } from 'uuid';
const pollutionDataSchema = new mongoose.Schema({
 
 _id:{
    type:String,
    default:v4
 },
 msg:{
    type:String,
    default:""
 },
 msgTime:{
    type:String,
    default:Date
 },
 response:{
    type:String,
    default:""
 },
 userId:{
    type:String,
    ref:"User",
    required:true

 },

},{timestamps:true});
const Chats = mongoose.model('Chats', pollutionDataSchema);
export default Chats;