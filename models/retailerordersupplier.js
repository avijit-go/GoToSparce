const mongoose = require("mongoose")
const retailerordersupplierSchema = new mongoose.Schema({
    retailerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "retailersupplier"
    },
    orderDate: {
        type: Date,
        required: false
    },
    orderDeliveryDate: {
        type: Date,
        required: false
    },
    orderNo: {
        type: String
    },
    orderPrice:{
        type: Number
    },
    deliverOrderPrice:{
        type: Number
    },
    status:{
        type:String,
        values:["pending","completed","cancelled","dispute"],
        message:'please select between -pending/completed/cancelled/dispute',
        default:"pending"
    },
    isNoneGTSOrder: {
        type: Boolean
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
                //required: true
            },
            catTitle: {
                type: String,                
            },
            subcatId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"category",
                //required: true
            },
            subcatTitle: {
                type: String,                
            },
            main_price:{
                type:Number,
            },
            reatiler_discount_price:{
                type:Number
            },
            price:{
                type:Number,
                //required: true
            },
            discount_percentage:{
                type:Number,
                default:0
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
    deliveredItems:[
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
                //required: true
            },
            catTitle: {
                type: String,                
            },
            subcatId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"category",
                //required: true
            },
            subcatTitle: {
                type: String,                
            },
            main_price:{
                type:Number,
            },
            reatiler_discount_price:{
                type:Number
            },
            price:{
                type:Number,
                //required: true
            },
            discount_percentage:{
                type:Number,
                default:0
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
    partialDeliveredItems:[
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
                //required: true
            },
            catTitle: {
                type: String,                
            },
            subcatId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"category",
                //required: true
            },
            subcatTitle: {
                type: String,                
            },
            main_price:{
                type:Number,
            },
            reatiler_discount_price:{
                type:Number
            },
            price:{
                type:Number,
                //required: true
            },
            discount_percentage:{
                type:Number,
                default:0
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
    partiallyDeliverd: {
        type: Boolean
    },
    partialDeliveryDate: {
        type: Date
    },
    partialDeliveryExpiresOn: {
        type: Date
    }
}, {timestamps: true})
const RetailerOrderSupplier = new mongoose.model("retailerordersupplier", retailerordersupplierSchema);

module.exports = RetailerOrderSupplier;