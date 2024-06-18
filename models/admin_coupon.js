const mongoose = require('mongoose');

const admincouponSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    code:{
        type:String,
        required:true
    },
    coupon_type:{
        type:String,
        enum:{
            values:["flat","percentage"],
            message:'please select between -flat/percentage'
        },
        required: true
    },
    discount_rate:{
        type:Number
    },
    maximumUsage: {
        type: Number,
        required: true
    },
    start_date:{
        type:Date,
        required: true
    },
    end_date:{
        type:Date,
        required: true
    },
    totalUsedBy: {
        type: Number,
        default: 0
    },
    status: {
        type: Boolean,
        default: true
    }
    
}, {timestamps:true});

const AdminCoupon = new mongoose.model("admincoupons", admincouponSchema);

module.exports = AdminCoupon;

