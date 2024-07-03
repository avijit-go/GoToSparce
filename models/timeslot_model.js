const mongoose = require("mongoose");

const TimeslotSchema = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId},
    timeSlot: {type: String},
    booking: [{type: mongoose.Schema.Types.ObjectId, ref: "Service"}],
    status: {type: String, enum: ["active", "inactive"], default: "active"}
}, {timestamps: true});

module.exports = mongoose.model("Timeslot", TimeslotSchema)