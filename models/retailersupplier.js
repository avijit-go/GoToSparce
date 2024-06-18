const mongoose = require("mongoose")
const retailersupplierSchema = new mongoose.Schema({
    retailerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required: true
    },
    name:{
        type: String,
        required: true,
        trim:true
    },
    phoneNo:{
        type: String
    },
    email:{
        type: String
    },
    gstNo:{
        type: String,
        required: true,
        trim:true
    },
    licenseNo:{
        type: String,
        required: true,
        trim:true
    },
    address:{
        type: String
    },
    city:{
        type: String
    },
    country:{
        type: String
    },
    pincode:{
        type: String
    },
    isGTSSupplier: {
        type: Boolean,
        default: false
    }
},{timestamps: true});

const RetailerSupplier = new mongoose.model("retailersupplier", retailersupplierSchema);
module.exports = RetailerSupplier;