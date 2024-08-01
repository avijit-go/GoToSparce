const router = require("express").Router();
const { default: mongoose } = require("mongoose");
const ServiceCenter = require("../models/serviceCenter")

router.post("/create", async(req, res, next) => {
    try {
        if(!req.body.address.trim()) {
            return res.status(400).json({message: "Provide a proper address"})
        } else if(!req.body.phone.trim()) {
            return res.status(400).json({message: "Provide a proper phone number"})
        }
        const serviceCenterData = ServiceCenter({
            _id: new mongoose.Types.ObjectId(),
            address: req.body.address,
            phone: req.body.phone
        });
        const data = await serviceCenterData.save();
        return res.status(201).json({message: "A new service center added", status:201, data})
    } catch (error) {
        next(error)
    }
});

router.get("/list", async(req, res, next) => {
    try {
       const data = await ServiceCenter.find({status: {$eq: "active"}})
       return res.status(200).json({message: "Get list of service centers", status: 200, data})
    } catch (error) {
        next(error)
    }
})

router.put("/update/:id", async(req, res, next) => {
    try {
       if(!req.params.id) {
        return res.status(400).json({message: "Service center id not found"})
       }
       const originalData = await ServiceCenter.findById(req.params.id);
       if(originalData.status === "inactive") {
        return res.status(200).json({message: "Service center details has already been deleted", status: 200})
       }
       const updatedData = await ServiceCenter.findByIdAndUpdate(req.params.id, {$set: {phone: req.body.phone || originalData.phone, address: req.body.address || originalData.address}}, {new: true});
       return res.status(200).json({message: "Service center details has been updated", status: 200, data: updatedData})
    } catch (error) {
        next(error)
    }
})

router.delete("/delete/:id", async(req, res, next) => {
    try {
       if(!req.params.id) {
        return res.status(400).json({message: "Service center id not found"})
       }
       const originalData = await ServiceCenter.findById(req.params.id);
       if(originalData.status === "inactive") {
        return res.status(200).json({message: "Service center details has already been deleted", status: 200})
       }
       const updatedData = await ServiceCenter.findByIdAndUpdate(req.params.id, {$set: {status: "inactive"}}, {new: true});
       return res.status(200).json({message: "Service center details has been deleted", status: 200, data: updatedData})
    } catch (error) {
        next(error)
    }
})
module.exports = router;