import mongoose from "mongoose";
const { Schema } = mongoose; // Destructure Schema from mongoose

const taskXMLSchema = new Schema({
  userId: { 
        type: String, 
        required: true 
    }, // associate task with the users ID
  xmlData: { 
        type: String, 
        required: true 
    }, // Store XML as a string
  createdAt: { 
        type: Date, 
        default: Date.now // Setting the default value to the current date
    },
});


const TaskXML = mongoose.model("TaskXML", taskXMLSchema); // Create a model from the schema

export default TaskXML; // Export the model