const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    proId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"products",
        required: true
    },
    deviceId:{
        type:String
    },
    ip_address:{
        type:String
    },
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    },
    user_type:{
        type:String,        
    },    
    
},{timestamps: true})

const Wishlist = new mongoose.model("wishlist",wishlistSchema);

module.exports = Wishlist