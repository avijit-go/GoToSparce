require("dotenv").config();
const express = require("express");
const Vehicle = require("../../models/vehicle");
const isAuthenticate = require("../../middleware/authcheck");
const VehicleRoute = express.Router();

/**
 * create Vehicle
 */

VehicleRoute.post("/create",isAuthenticate,async(req,res)=>{
    try{
        const VehicleData = new Vehicle(req.body);
        const result = await VehicleData.save();

        message = {
            error:false,
            message:"Vehicle created successfully",
            data:result
        }
        return res.status(200).send(message);
    }catch(err){
        message = {
            error:false,
            message:"Operation Failed",
            data:err
        }
        return res.status(200).send(message);
    }
});

/**
 * list Vehicle
 */

VehicleRoute.get("/list",isAuthenticate,async(req,res)=>{
    try{
        let VehicleData = await Vehicle.find({}).populate([
            {
                path:"vehicle_type",
                select:"title"
            },
            {
                path:"makeId",
                select:"title"
            },
            {
                path:"modelId",
                select:"title"
            },
            {
                path:"yearId",
                select:"title"
            },
            {
                path:"variantId",
                select:"title"
            },
        ]);

        message = {
            error:false,
            message:"List of all Vehicle",
            data:VehicleData
        }
        res.status(200).send(message);
    }catch(err){
        message = {
            error:true,
            message:"Operation Failed",
            data:err.toString()
        }
        res.status(200).send(message);
    }
});

/**
 * detail vehicle
 */

 VehicleRoute.get("/detail/:vehicleId",isAuthenticate,async(req,res)=>{
    try{
        let VehicleData = await Vehicle.findOne({_id:req.params.vehicleId});

        message = {
            error:false,
            message:"Detail of Vehicle",
            data:VehicleData
        }
        res.status(200).send(message);
    }catch(err){
        message = {
            error:true,
            message:"Operation Failed",
            data:err
        }
        res.status(200).send(message);
    }
});

/**
 * update vehicle
 */


VehicleRoute.patch("/update/:vehicleId",isAuthenticate, async (req, res) => {
	try {
		const result = await Vehicle.findOneAndUpdate({ _id: req.params.vehicleId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Vehicle updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Vehicle not updated",
			};
			res.status(200).send(message);
		}
	} catch (err) {
		message = {
			error: true,
			message: "Operation Failed!",
			data: err,
		};
		res.status(200).send(message);
	}
});

/**
 * change statuse
 */

 VehicleRoute.get("/changestatus/:vehicleId", isAuthenticate, async(req,res) => {
    try{
        let VehicleData = await Vehicle.findOne({_id:req.params.vehicleId});

        if(VehicleData.status == true){
            await Vehicle.findOneAndUpdate({_id:req.params.vehicleId}, { status: false }, {new: true})

            message = {
                error: false,
                message: "Vehicle status changed to inactive",
                data: {},
            };
            res.status(200).send(message);

        } else {
            await Vehicle.findOneAndUpdate({_id:req.params.vehicleId}, { status: true }, {new: true})

            message = {
                error: false,
                message: "Vehicle status changed to active",
                data: {},
            };
            res.status(200).send(message);
        }
        
    }catch(err){
        message = {
            error: true,
            message: "Operation Failed!",
            data: err,
        };
        res.status(200).send(message);
    }
});

/**
 * This method is to delete Vehicle
 * @param str VehicleId
 */

VehicleRoute.delete("/delete/:VehicleId",isAuthenticate, async (req, res) => {
    try {
        const result = await Vehicle.deleteOne({
            _id: req.params.VehicleId
        });
        if (result.deletedCount == 1) {
            message = {
                error: false,
                message: "Vehicle deleted successfully!",
            };
            res.status(200).send(message);
        } else {
            message = {
                error: true,
                message: "Operation failed!",
            };
            res.status(200).send(message);
        }
    } catch (err) {
        message = {
            error: true,
            message: "Operation Failed!",
            data: err,
        };
        res.status(200).send(message);
    }
});


module.exports = VehicleRoute;




