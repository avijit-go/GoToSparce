const mongoose = require("mongoose");
const retailerstockSchema = new mongoose.Schema({
    retailerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    proId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "retailerproducts",
        required: true
    },
    proTitle:{
        type: String,
       // required: true
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
    entryDate:{
        type: Date,
        //required: true
    },
    stock_type:{
        type:String,
        enum:{
            values:["stock_in","stock_out","initial"]
        },
        default: "stock_in"
    },
    reference_type: {
        type: String,
        enum: {
            values:["customer_order","supplier_order","retailer"]
        }
    },
    customerorderId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "retailerorder",
    },
    supplierorderId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "retailerordersupplier",
    },
    // retailerorderId:{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "retailerproducts",

    // },
    quantity:{
        type:Number,
        required: true
    },
    price:{
        type:Number
    },

    comment: {
        type: String
    }
}, {timestamps: true});
const RetailerStock = new mongoose.model("retailerstock", retailerstockSchema);

module.exports = RetailerStock;