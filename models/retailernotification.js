const mongoose = require("mongoose")
const moment = require('moment-timezone');
const dateIndia = moment.tz(Date.now(), "Asia/Kolkata");

const retailernotificationSchema = new mongoose.Schema({
    retailerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    prodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products"
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: "customer_order",
        enum: {
            values: ["customer_order","supplier_order","available_item"],
            message: "Please choose value between customer_order/supplier_order/available_item"
        }
    },
    entryDate: {
        type: Date,
        required: true
    },
    
    createdAt: {type: Date, default: dateIndia},
    updatedAt: {type: Date, default: dateIndia},
}, 
// {timestamps: true}
)
const RetailerNotification = new mongoose.model("retailernotification", retailernotificationSchema)

module.exports = RetailerNotification;