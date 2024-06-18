const mongoose = require("mongoose")
const retailerProductSchema = new mongoose.Schema({
    retailerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    proId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        required: true
    },
    proTitle:{
        type: String,
        required: true
    },
    proImage: {
        type: String,
    },
    catId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"category",
        //required: true
    },
    catTitle: {
        type: String,                
    },
    subcatId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"category",
        //required: true
    },
    brandId: {
        type: mongoose.Schema.Types.ObjectId,                   //OES
        ref: "brand"
    },
    subcatTitle: {
        type: String,                
    },
    price:{
        type:Number,
        //required: true
    },
    partNo: {
        type: String
    },
    quantity:{
        type:Number
    }
}, {timestamps: true});
const RetailerProduct = new mongoose.model("retailerproducts", retailerProductSchema);

module.exports = RetailerProduct;