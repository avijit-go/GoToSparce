const mongoose = require("mongoose");

const modelYearSchema = new mongoose.Schema({
    makeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "make",
      required: true
    },
    yearId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "year",
        required: true
    },
    modelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "model",
        required: true
    },
    status:{
      type:Boolean,
      default:true
    }
}, {timestamps: true})

const ModelYear = new mongoose.model("modelYears",modelYearSchema);

module.exports = ModelYear