const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({    
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    },
    user_type:{
        type:String,
    },
    deviceId:{
        type:String
    },
    ip_address:{
        type:String
    },
    totalQuantity:{
        type:Number
    },
    totalPrice:{
        type:Number
    },
    totalmrp: {
        type:Number
    }    

},{timestamps: true})
const Cart = new mongoose.model("carts",cartSchema);
module.exports = Cart