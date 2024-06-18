const mongoose = require('mongoose');
const reviewSchema = new mongoose.Schema({
    prodId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"products",
        required: true
    },
    comment:{
        type:String
    },
    rating:{
        type:Number,
        required: true,
        max: 5
    },
    // rating:{
    //     type:String,
    //     required: true
    // },
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required: true
    },
    user_type:{
        type:String
    },

}, {timestamps: true})

const Review = new mongoose.model("reviews",reviewSchema);

module.exports = Review;