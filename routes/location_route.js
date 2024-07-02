const router = require("express").Router();
const Location = require("../models/location_model");
const mongoose = require("mongoose")

router.post("/create", async(req, res, next) => {
    try {
        const locationObj = Location({
            _id: new mongoose.Types.ObjectId(),
            name: req.body.name,
            address: req.body.address,
            phone: req.body.phone
        });
        await locationObj.save();
        return res.status(201).json({message: "Location added"})
    } catch (error) {
        next(error)
    }
});

router.post("/list", async(req, res, next) => {
    try {
        const data = await Location.find({})
        return res.status(201).json({message: "Location list", status: 200, locations: data})
    } catch (error) {
        next(error)
    }
})

module.exports = router;