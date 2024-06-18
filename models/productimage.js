const mongoose = require('mongoose');

const proimageSchema = new mongoose.Schema({
    proId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products"
    },
    image: {
        type: String,
        required: true
    }
})

const ProductImage = new mongoose.model("productimages", proimageSchema);

module.exports = ProductImage;