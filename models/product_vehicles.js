const mongoose = require("mongoose");

const productVehiclesSchema = new mongoose.Schema({
    prodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        required: true
    },
    makeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "make"
    },
    modelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "model"
    },
    yearId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "year"
    },
    variantId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "variants"
    },
    status:{
        type:Boolean,
        default:true
    }
    
}, {timestamps:true});

const ProductVechicle = new mongoose.model("productvechicles",productVehiclesSchema);

module.exports = ProductVechicle