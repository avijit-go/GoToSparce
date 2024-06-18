const mongoose = require('mongoose');

const retailercouponSchema = new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:true
    },
    code:{
        type:String,
        required:true
    },
    orderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"orders",
        required:true
    },
    order_amount:{
        type:Number
    },
    status: {
        type: Boolean,
        default: true
    }
    
}, {timestamps:true});

const RetailerCoupon = new mongoose.model("retailerCoupons", retailercouponSchema);

module.exports = RetailerCoupon;

