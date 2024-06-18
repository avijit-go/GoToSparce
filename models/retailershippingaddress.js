const mongoose = require("mongoose")

const retailershippingaddressSchema = new mongoose.Schema({
    retailerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    fname: {
        type: String,
        required: true
    },
    lname: {
        type: String,
        required: true
    },
    phoneNo: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    lat: {
        type: String,
        required: true
    },
    long: {
        type: String,
        required: true
    }    
}, {timestamps: true})
const RetailerShippingAddress = new mongoose.model("retailershippingaddress", retailershippingaddressSchema);

module.exports = RetailerShippingAddress;