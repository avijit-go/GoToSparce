const mongoose = require("mongoose");

const ServiceCenterSchema = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId},
    address: {type: String},
    phone: {type: String},
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {timestamps: true});

module.exports = mongoose.model("ServiceCenter", ServiceCenterSchema)