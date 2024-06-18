const mongoose = require("mongoose")

/* Retailer's Customer orders for product stock out */

const retailerorderSchema = new mongoose.Schema({
    retailerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"users",
        required: true
    },
    customerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"retailercustomers",
        required: [true, "customerId is required"]
    },
    /* Customer default address */
    addressId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"retailercustomeraddress",
        required: [true, "Customer addressId is required"]
    },
    orderNo:{
        type: String
    },
    orderDate:{
        type: Date,
        required: true
    },
    orderPrice:{
        type: Number
    },
    status:{
        type: String,
        default: "pending",
        enum:{
            values:["pending","completed","cancelled"],
            message:'please select between -pending/completed/cancelled'
        }
    },
    items:[
        {
            proId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"retailerproducts"
            },
            proTitle:{
                type: String,
                required: true
            },
            proImage: {
                type: String,
            },
            catId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"category",
                required: true
            },
            catTitle: {
                type: String,                
            },
            subcatId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"category",
                required: true
            },
            subcatTitle: {
                type: String,                
            },
            price:{
                type:Number,
                required: true
            },
            quantity:{
                type:Number,
                required: true
            },
            totalPrice:{
                type:Number,
                required: true
            }
        }
    ],
    orderDeliveryDate: {
        type: Date,
        required: false
    }
},{timestamps: true});

retailerorderSchema.pre('save', async function(next) {
    try {
        this.orderNo = 'ORDER' + Date.now();
        next();
    } catch (error) {
        return next(error);
    }
});
const RetailerOrder = new mongoose.model("retailerorder", retailerorderSchema);
module.exports = RetailerOrder;