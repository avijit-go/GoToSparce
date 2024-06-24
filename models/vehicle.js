const mongoose = require("mongoose")


const vehicleSchema = new mongoose.Schema({
    title:{
        type:String
    },
    image: {
        type: String,
        default: ""
    },
    brand_name: {
        type: String,
        default: "",
        index: true
    },
    vehicle_type:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"vehicleTypes",
        required: true
    },
    makeId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"make",
        required: true
    },
    modelId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"model",
        required: true
    },
    yearId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"year",
        required: true
    },
    variantId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"variants",
        required: true
    },
    status:{
        type:Boolean,
        default:true
    }
   
})

const Vehicle = new mongoose.model("vehicles", vehicleSchema)

module.exports = Vehicle