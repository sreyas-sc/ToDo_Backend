// models/TaskXML.js
import mongoose from "mongoose";
const { Schema } = mongoose; // Destructure Schema from mongoose

const taskXMLSchema = new Schema({
  userId: { 
        type: String, 
        required: true 
    }, // Associate tasks with a user
  xmlData: { 
        type: String, 
        required: true 
    }, // Store XML as a string
  createdAt: { 
        type: Date, 
        default: Date.now 
    },
});


const TaskXML = mongoose.model("TaskXML", taskXMLSchema);

export default TaskXML;