const mongoose = require("mongoose");

const adminNotificationSchema = new mongoose.Schema({
    retailerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"users",
        required: true
    },
    /* retailer portfolio or notification id */
    retailerNotificationId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"retailerprotfolio",
        required: true
    },
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "retailersupplier"
    },
    message: {
        type: String
    },
    status:{
        type:Boolean,
        default:true
    }
}, {timestamps: true})

const AdminNotification = new mongoose.model("adminNotifications",adminNotificationSchema);

module.exports = AdminNotification;