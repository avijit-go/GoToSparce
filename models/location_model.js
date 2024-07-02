const mongoose = require("mongoose");

const LocationSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String },
    address: { type: String },
    phone: { type: String }
}, {timestamps: true});

module.exports = mongoose.model("Location", LocationSchema)