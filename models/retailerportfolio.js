const mongoose = require("mongoose")
const retailerprotfolioSchema = new mongoose.Schema({
    retailerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    partNo:{
        type:String,
        required: true 
    },
    title:{
        type:String
    },
    makeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "make",
        required: true 
    },
    modelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "model",
        required: true 
    },
    // brandId: {
    //     type: mongoose.Schema.Types.ObjectId,                   //OES
    //     ref: "brand"
    // }

}, {timestamps: true})
const RetailerProtfolio = new mongoose.model("retailerprotfolio", retailerprotfolioSchema);

module.exports = RetailerProtfolio