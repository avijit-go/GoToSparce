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
            brand_name: req.body.brand_name,
            vehicle_cat: req.body.vehicle_cat
        });
        const vehicle = await newVehicleObj.save();
        return res.status(201).json({message: "A new vehicle added", status: 201, vehicle });
    }
    catch(error) {
        next(error);
    }
});

router.get("/list", async (req, res, next) => {
    try {
        const searchKey = req.query.brand_name ? {
            brand_name: { $regex: req.query.brand_name, $options: "i" }
        } : {};
        const vehicles = await Vehicle.find(searchKey).find({isDelete: {$ne: true}});;
        return res.status(200).json({ message: "GET all listed vehicles", status: 200, vehicles });
    } catch (error) {
        next(error)
    }
});
// 

router.put("/update/:vehicleId", async(req, res, next) => {
    try {
        if(!req.params.vehicleId) {
            return res.status(400).json({message: "Vehicle ID is not present"});
        } 
        const originalVehicleData = await Vehicle.findById(req.params.vehicleId);
        // console.log(originalVehicleData);
        var imageURL = '';
        if(req.files) {
            const result = await cloudinary.uploader.upload(req.files.image.tempFilePath);
            imageURL = result.url
        }
        const updateVehicle = await Vehicle.findByIdAndUpdate(req.params.vehicleId, {$set: {
            brand_name: req.body.brand_name,
            vehicle_cat: req.body.vehicle_cat,
            image: imageURL || originalVehicleData.image,
            title: req.body.title
        }}, {new: true})
        return res.status(200).json({message: "Vehicle details updated", status:200, vehicle: updateVehicle})
    } catch (error) {
        next(error)
    }
})

router.delete("/delete/:vehicleId", async(req, res, next) => {
    try {
        if(!req.params.vehicleId) {
            return res.status(400).json({message: "Vehicle ID is not present"});
        } 
        const deleteVehicle = await Vehicle.findByIdAndUpdate(req.params.vehicleId, {$set: {isDelete: true}}, {new: true, strict: false});
        return res.status(200).json({message: 'Vehicle has been deleted', status: 200, vehicle: deleteVehicle})
    } catch (error) {
        next(error)
    }
})


module.exports = router;