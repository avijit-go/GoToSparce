const mongoose = require('mongoose');

const retailerSAlesSchema = new mongoose.Schema({
    retailerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    retailerCustomerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "retailercustomers"
    },
    retailerOrderId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "retailerorder"
    },
    orderDate:{
        type:Date
    },
    proId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"retailerproducts"
    },
    catId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"category",
        required: true
    },
    subcatId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"category",
        required: true
    },
    quantity:{
        type:Number,
        required: true
    },
    price:{
        type:Number,
        required: true
    },
    totalPrice:{
        type:Number,
        required: true
    }
},{timestamps: true});

const RetailerSales = new mongoose.model("retailerSAles", retailerSAlesSchema);
module.exports = RetailerSales;