const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    },
    user_type:{
        type:String,
        // enum:{
        //     values:["vehicleowner","wholesaler"],
        //     message:'please select between -vehicleowner/wholesaler'
        // }
    },
    fname:{
        type:String
    },
    lname:{
        type:String
    },
    address_type:{
        type:String,
        enum:{
            values:["home","office"],
            message:'please select between -home/office'
        }
    },
    phone_no:{
        type:String
    },
    address:{
        type:String
    },
    lat:{
        type:String
    },
    long:{
        type:String
    },
    land_mark:{
        type:String
    },
    state:{
        type:String
    },
    city:{
        type:String
    },
    pin_code:{
        type:String
    },
    is_primary:{
        type:Boolean,
        default:false
    }
},{timestamps: true});

const Address = new mongoose.model("addresses", addressSchema);

module.exports = Address;