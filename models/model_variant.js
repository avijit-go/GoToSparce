const mongoose = require("mongoose");

const modelVariantSchema = new mongoose.Schema({
    makeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "make",
      required: true
    },
    modelyearId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "modelYears",
        required: true
    },
    modelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "model",
        required: true
    },
    variantId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "variants",
        required: true
    },
    status:{
      type:Boolean,
      default:true
    }
}, {timestamps: true})

const ModelVariant = new mongoose.model("modelVariants",modelVariantSchema);

module.exports = ModelVariant