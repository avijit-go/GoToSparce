const router = require("express").Router();
const mongoose = require("mongoose");
const Timeslot = require("../models/timeslot_model");

router.post("/create", async(req, res, next) => {
    try {
       const timeslotObj = Timeslot({
        _id: new mongoose.Types.ObjectId(),
        timeSlot: req.body.timeSlot
       });
       const result = await timeslotObj.save();
       return res.status(201).json({message: "Add timeslot", status: 201, result})
    } catch (error) {
        next(error)
    }
});

router.get("/list", async(req, res, next) => {
    try {
       const result = await Timeslot.find({})
       return res.status(200).json({message: "get timeslot", status: 200, result})
    } catch (error) {
        next(error)
    }
});

router.put("/update-status/:id", async(req, res, next) => {
    try {
       const result = await Timeslot.findByIdAndUpdate(req.params.id, {$set: {status: req.body.status}}, {new: true})
       return res.status(200).json({message: "update timeslot", status: 200, result})
    } catch (error) {
        next(error)
    }
});

router.get("/user-timelist-list", async(req, res, next) => {
    try {
        const result = await Timeslot.find({}).select("timeSlot");
        console.log(result);
        let temp = [];
        for(let i=0; i<result.length; i++) {
            temp.push(result[i].timeSlot)
        }
        return res.status(200).json({message: "get timeslot", status: 200, time_slot: temp})
     } catch (error) {
         next(error)
     }
})

module.exports = router;