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
       const searchKey = req.query.search ? {
        $or: [
            { vehicle_cat: { $regex: req.query.catagory, $options: "i" } },
            { brand_name: { $regex: req.query.brand_name, $options: "i" } },
        ]
       }  : {};
       const vehicles = await Vehicle.find(searchKey).find({isDelete: {$ne: true}});
       return res.status(200).json({message: "GET all listed vehicles", status: 200, vehicles})
    } catch (error) {
        next(error)
    }
});

router.put("/update/:vehicleId", async(req, res, next) => {
    try {
        if(!req.params.vehicleId) {
            return res.status(400).json({message: "Vehicle ID is not present"});
        } 
        if(req.files) {
            const result = await cloudinary.uploader.upload(req.files.image.tempFilePath);
            imageURL = result.url;
            const updateVehicle = await Vehicle.findByIdAndUpdate(req.params.vehicleId, {$set: {
                brand_name: req.body.brand_name,
                vehicle_cat: req.body.vehicle_cat,
                image: imageURL,
                title: req.body.title
            }}, {new: true})
            return res.status(200).json({message: "Vehicle details updated", status:200, vehicle: updateVehicle})
        }
        else {
            const updatedData = {
                brand_name: req.body.brand_name,
                vehicle_cat: req.body.vehicle_cat,
                title: req.body.title
            };
            const updateVehicle = await Vehicle.findByIdAndUpdate(req.params.vehicleId, {$set: updatedData}, {new: true});
            console.log("updateVehicle::", updateVehicle)
            return res.status(200).json({message: "Vehicle details updated", status:200, vehicle: updateVehicle})
        }
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