const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
    title:{
        type:String,
        required: true,
        unique: true
    },
    status:{
        type:Boolean,
        default:true
    }
},{timestamps:true});

const Variant = new mongoose.model("variants",variantSchema);

module.exports = Variant