const mongoose = require("mongoose");

const vehicleTypeSchema = new mongoose.Schema({
    title:{
        type:String
    }
},{timestamps:true});

const VehicleType = new mongoose.model("vehicleTypes",vehicleTypeSchema);

module.exports = VehicleType