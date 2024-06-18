const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required: true
    },
    couponId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"admincoupons"
    },
    order_no:{
        type:String
    },    
    order_price:{
        type: Number
    },
    comment:{
        type: String
    },
    addressId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"addresses",
        required: true
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
    status:{
        type:String,
        values:["pending","cancelled","delivered"],
        message:'please select between -pending/cancelled/delivered',
        default:"pending"
    },
    payment_status: {
        type:String,
        enum: {
            values:["paid","unpaid","partial"],
            message:'please select between -pending/cancelled/delivered',
        },
        default:"unpaid"
    },
    paid_amount: {
        type: Number,
        default: 0
    },
    payment_gateway_id: {
        type: String,
        default: undefined
    },
    order_details:[
        {
            proId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"products"
            },
            price:{
                type:Number
            },
            qty:{
                type:Number
            },
            total_pro_price:{
                type:Number
            }
        }
    ],
    orderDeliveryDate: {
        type: Date,
        required: false
    }

},{timestamps:true})


orderSchema.pre('save', async function(next) {
    try {
        this.order_no = 'ORDNO' + Date.now();
        next();
    } catch (error) {
        return next(error);
    }
});



const Order = new mongoose.model("orders",orderSchema);

module.exports = Order
