const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // Load environment variables

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON requests

// MongoDB Connection (Cloud First, Fallback to Local)
const mongoURI = process.env.MONGO_URI ;
console.log("dekh le");
console.log(mongoURI);

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ MongoDB Connection Failed. Retrying with Local DB...");
        // If cloud connection fails, try connecting to local MongoDB
        if (mongoURI !== "mongodb://localhost:27017/click_tracking") {
            try {
                await mongoose.connect("mongodb://localhost:27017/click_tracking", {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                });
                console.log("✅ Connected to Local MongoDB");
            } catch (err) {
                console.error("❌ Local MongoDB Connection Failed", err);
                process.exit(1); // Exit the app if both connections fail
            }
        }
    }
};

// Call Database Connection
connectDB();

// Define Schema for Click Tracking
const clickSchema = new mongoose.Schema({
    timestamp: String,
    elementText: String,
    elementType: String,
    pageURL: String,
    x: Number,
    y: Number
});

// Create Model
const Click = mongoose.model("Click", clickSchema);

// API to Save Click Data
app.post("/api/clicks", async (req, res) => {
    try {
        const newClick = new Click(req.body);
        await newClick.save();
        res.status(201).json({ success: true, message: "Click saved" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error saving click", error });
    }
});

// API to Retrieve Click Data
app.get("/api/clicks", async (req, res) => {
    try {
        const clicks = await Click.find();
        res.json(clicks);
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching clicks", error });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
