const mongoose = require('mongoose');
//const timeZone = require('mongoose-timezone');

// const moment = require('moment-timezone');

// let dateIndia = moment.tz(Date.now(), "Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");

const cartSchema = new mongoose.Schema({
    proId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"products"
    },
    deviceId:{
        type:String
    },
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    },
    user_type:{
        type:String,
    },

    ip_address:{
        type:String
    },
    quantity:{
        type:Number
    },
    price:{
        type:Number
    }
    // created_date: {type:Date, default:Date.now, timezone: 'Asia/Kolkata'},
    // updated_date: {type:Date, default:Date.now, timezone: 'Asia/Kolkata'}
    // createdAt:{
    //     type:String,
    //     value: dateIndia
    // },
    // updatedAt:{
    //     type:String,
    //     value: dateIndia
    // }

},
{timestamps: true}
)

const Cart = new mongoose.model("carts",cartSchema);

module.exports = Cart

