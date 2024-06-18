const mongoose = require("mongoose")
const retailerexpenseSchema = new mongoose.Schema({
    retailerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    entryDate: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true
    }
}, {timestamps: true})
const RetailerExpense = new mongoose.model("retailerexpense", retailerexpenseSchema)

module.exports = RetailerExpense;