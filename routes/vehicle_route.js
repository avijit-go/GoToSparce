const router = require("express").Router();
const { default: mongoose } = require("mongoose");
const Vehicle = require("../models/vehicle");
const cloudinary = require("cloudinary");
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    secure: true,
});

router.post("/create", async (req, res, next) => {
    try {
        var imageURL = "";
        if(req.files) {
            const result = await cloudinary.uploader.upload(req.files.image.tempFilePath);
            imageURL = result.url;
        };
        const newVehicleObj = Vehicle({
            _id: new mongoose.Types.ObjectId(),
            title: req.body.title,
            image: imageURL,
            vehicle_type: req.body.vehicle_type,
            makeId: req.body.makeId,
            modelId: req.body.modelId,
            yearId: req.body.yearId,
            variantId: req.body.variantId,
        });
        const vehicle = await newVehicleObj.save();
        return res.status(201).json({message: "A new vehicle added", status: 201, vehicle });
    }
    catch(error) {
        next(error);
    }
});



module.exports = router;