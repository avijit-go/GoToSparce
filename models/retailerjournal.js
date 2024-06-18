const mongoose = require("mongoose")
const retailerjournalSchema = new mongoose.Schema({
    retailerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    type: {
        type: String,
        default: "income",
        enum: {
            values:["income","expense"],
            message:'please select between -income/expense'
        }
    },
    entryDate: {
        type: Date,
        required: true
    },
    expenseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "retailerexpense"
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "retailerorder"
    },
    supplierorderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "retailerordersupplier"
    },
    amount: {
        type: Number
    }

}, {timestamps: true})
const RetailerJournal = new mongoose.model("retailerjournal", retailerjournalSchema)

module.exports = RetailerJournal;