const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema({
    makeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "make",
      required: true
    },
    // brandId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "brand",
    //   required: true
    // },
    title:{
      type:String,
      required: true
    },
    desc:{
      type:String,
    },
    image:{
      type:String,
    },
    status:{
      type:Boolean,
      default:true
    }
}, {timestamps: true})

const Model = new mongoose.model("model",modelSchema);

module.exports = Model