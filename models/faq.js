const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema({
    proId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"products",
        required: [true, "Please add product"]
    },
    question:{
        type:String,
        required: true
    },
    answer:{
        type:String,
        required: true
    },   
    status:{
        type:Boolean,
        default:true
    }
}, {timestamps: true})

const Faq = new mongoose.model("faq",faqSchema);

module.exports = Faq