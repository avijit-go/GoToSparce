const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
    _id:{ type: mongoose.Schema.Types.ObjectId },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    car: { type: mongoose.Schema.Types.ObjectId, ref: "vehicles" },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "products" }],
    price: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    vehicle_number: { type: String, required: [true, "Vehicle number is requied"] },
    pickup_drop: { type: Boolean, default: false },
    location: { type: String, default: "" }, 
    invoice_number: { type: Number },
    service_date: {type: String},
    service_time: { type: String },
    total_price: {type: Number},
    status: {
        type: String,
        enum: ["pending", "accept", "inproress", "complete", "cancel"],
        default: "accept",
        index: true
    },

}, {timestamps: true});

const Stock = new mongoose.model("Service",serviceSchema);
module.exports = Stock;