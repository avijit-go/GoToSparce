const mongoose = require("mongoose");
const retailercustomerSchema = new mongoose.Schema({
    retailerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required: true
    },
    cust_id: {
        type: String
    },
    name:{
        type:String
    },
    fname: {
        type: String,
        required: true,
        trim: true,
    },
    lname: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
    },
    phoneNo: {
        type: String,
        required: true,
        trim: true,
    },  
    dob: {
        type: Date
    },  
    gender: {
        type: String,
    },
    address: {
        type: String,
    },
    city: {
        type: String
    },
    country: {
        type: String
    },
    pincode: {
        type: String
    },
    makeId:{
        type:mongoose.Schema.Types.ObjectId, /* Vehicle details */
        ref:"make",
       
    },
    brandId:{
        type:mongoose.Schema.Types.ObjectId, /* Vehicle details */
        ref:"brand",
        
    },
    modelId:{
        type:mongoose.Schema.Types.ObjectId, /* Vehicle details */
        ref:"model",
       
    },
    rcNo: {
        type: String, /* Vehicle details */
        
    }
},{timestamps: true});

const RetailerCustomer = new mongoose.model("retailercustomers", retailercustomerSchema);

module.exports = RetailerCustomer;