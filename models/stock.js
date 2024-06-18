const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
    proId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"products",
        required: [true, "Product is required"]
    },    
    stock_type:{
        type:String,
        enum:{
            values:["stock_in","stock_out","initial"]
        },
        default: "initial"
    },
    count:{
        type:Number,
        default: 0
    },
    id_ref:{
        type:mongoose.Schema.Types.ObjectId,
        refPath:"id_type"
    },
    id_type:{
        type:String,
        enum:{
            values:["orders","suppliers","retailerprofile","admin"]
        },
        default: "admin"
    },
    date:{
        type:Date
    }
    
    
}, {timestamps: true})

const Stock = new mongoose.model("stocks",stockSchema);

module.exports = Stock