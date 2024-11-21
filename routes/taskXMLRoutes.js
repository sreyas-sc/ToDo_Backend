// routes/taskXMLRoutes.js
import express from 'express'; // Import express
import TaskXML from "../models/TaskXML.js";

const taskXmlrouter = express.Router();

// Save XML data
taskXmlrouter.post('/save-xml', async (req, res) => {
    console.log("Received body:", req.body);
    
    const { userId, xmlData } = req.body;

    try {
        // Update or create the XML data for the user
        const existing = await TaskXML.findOne({ userId });
        if (existing) {
            existing.xmlData = xmlData;
            await existing.save();
        } else {
            await TaskXML.create({ userId, xmlData });
        }

        res.status(200).json({ message: 'XML data saved successfully' });
    } catch (error) {
        console.error('Save XML Error:', error);
        res.status(500).json({ error: 'Failed to save XML data', details: error.message });
    }
});

// Retrieve XML data
taskXmlrouter.get('/get-xml/:userId', async (req, res) => {
    const { userId } = req.params;
    console.log('Received request for userId:', userId);
  
    try {
      const taskXML = await TaskXML.findOne({ userId });
      console.log('Found task XML:', taskXML);
  
      if (!taskXML) {
        console.log(`No data found for user: ${userId}`);
        return res.status(404).json({ error: 'No data found for this user' });
      }
  
      res.status(200).json({ xmlData: taskXML.xmlData });
    } catch (error) {
      console.error('Retrieve XML Error:', error);
      res.status(500).json({ error: 'Failed to retrieve XML data', details: error.message });
    }
  });

export default taskXmlrouter;
