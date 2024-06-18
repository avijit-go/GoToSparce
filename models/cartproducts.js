const mongoose = require('mongoose');
const cartProductSchema = new mongoose.Schema({
    cartId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"carts"
    },
    user_id: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    },
    proId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"products"
    },
    quantity: {
        type: Number,
        required: true
    },
    /* Product Current Discounted Price Based On User Type (vehicleowner/wholesaler) */
    prodPrice: {
        type: Number,
        required: true
    },
     /* Product Current MRP Price Based On User Type (vehicleowner/wholesaler) */
    prodmrp: {
        type: Number,
        required: true
    },
    /* Quantity Counted Price */
    totalPrice: {
        type: Number,
        required: true
    },
    /* Quantity Counted MRP */
    totalmrp: {
        type: Number,
        required: true
    },
}, {timestamps:true});

const CartProduct = new mongoose.model("cartproducts",cartProductSchema);
module.exports = CartProduct