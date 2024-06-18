require("dotenv").config();
const express = require("express");
const VehicleType = require("../../models/vehicle_type");
const VehicleTypeRoute = express.Router();
const isAuthenticate = require("../../middleware/authcheck");


/**
 * This API is used for create 
 */


VehicleTypeRoute.post("/create",isAuthenticate,async(req,res)=>{
    try{
        const VehicleTypeData = new VehicleType(req.body);
        const result = await VehicleTypeData.save();

        message = {
            error:false,
            message:"Vehicle Type is created successfully",
            data:result
        };
        return res.status(200).send(message);

    }catch(err){
        message = {
            error:true,
            message:"Operation Failed",
            data:err
        }
        return res.status(200).send(message);
    }
});


/**
 * This API is used for List
 */

VehicleTypeRoute.get("/list",isAuthenticate,async(req,res)=>{
    try{
        let VehicleTypeData = await VehicleType.find({});

        message = {
            error:false,
            message:"List of all Vehicle Type",
            data:VehicleTypeData
        }
        res.status(200).send(message);

    }catch(err){
        message = {
            error:true,
            message:"Operation Failed",
            data:err,
        }
        res.status(200).send(message);
    }
});

module.exports = VehicleTypeRoute
