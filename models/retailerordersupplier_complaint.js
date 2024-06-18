const mongoose = require("mongoose")

/* Retailer's Customer orders for product stock out */

const retailerOrderComplaintSchema = new mongoose.Schema({
    reatilerOrderId: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "retailerorder"
    },
    proId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"retailerproducts"
    },
    qty: {
        type: Number,
        default: 0
    },
    complaintType: {
        type: String,
        enum: {
            values: ["dispute", "excess"],
            message: "Only values - dispute / excess"
        }
    }
},{timestamps: true});

const RetailerOrderComplaint = new mongoose.model("retailerorder_complaints", retailerOrderComplaintSchema);
module.exports = RetailerOrderComplaint;