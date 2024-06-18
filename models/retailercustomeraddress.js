const mongoose = require("mongoose")
const retailercustomeraddressSchema = new mongoose.Schema({
    retailerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    },
    customerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"retailercustomers"
    },
    phoneNo:{
        type: Number,
        // required: true,
        // min: 10
    },
    address:{
        type:String,
        // required: true,
    },
    lat:{
        type:String,
        // required: true,
    },
    long:{
        type:String,
        // required: true,
    },
    land_mark:{
        type:String,
    },
    state:{
        type:String,
        // required: true,
    },
    city:{
        type:String,
        // required: true,
    },
    pin_code:{
        type:String,
        // required: true,
    },
    is_primary:{
        type:Boolean,
        default:false
    }
}, {timestamps: true})

const RetailerCustomerAddress = new mongoose.model("retailercustomeraddress", retailercustomeraddressSchema);

module.exports = RetailerCustomerAddress;