require("dotenv").config();
const express = require("express");
const Cart = require("../models/cart");
const CartRoute = express.Router();
const isAuthenticate = require("../middleware/authcheck");  /* For User (wholesaler or vehicle owener) */
const UserId  = require("../helper/getUserToken");
const Product = require("../models/product");
const CartProduct = require("../models/cartproducts");

/* Save Item to Cart */
CartRoute.post("/save", isAuthenticate, async(req,res) => {
    try{
        var headers = req.headers;
        var token = headers.authorization.split(' ')[1];

        var user = UserId(token)
        var userId = user.data._id;
        var userType = user.data.register_with;
        
        // console.log(user);
        console.log(userId);
        console.log(userType);
        // console.log(user.data.email);

        if(!req.body.proId){
            message = {
                error: true,
                message:"proId is required",
                data: {}
            }
            return res.status(200).send(message);
        }
        if(!req.body.quantity){
            message = {
                error: true,
                message:"quantity is required",
                data: {}
            }
            return res.status(200).send(message);
        }

        if((req.body.quantity) && (req.body.quantity == 0)){
            message = {
                error: true,
                message:"Quantity minimum value should be one otherwise you can remove item directly",
                data: {}
            }
            return res.status(200).send(message);
        }

        
        let productData = await Product.findOne({_id:req.body.proId});

        if(!productData){
            message = {
                error: true,
                message:"No product found",
                data: {}
            }
            return res.status(200).send(message);
        }

        prodmrp = productData.mrp;

        if(userType == 'wholesaler'){
            prodPrice = productData.retailerDiscountedPrice;            
            
        } else if (userType == 'vehicleowner'){
            prodPrice = productData.customerDiscountedPrice;
        }

        const existCart = await Cart.findOne({ user_id:userId });
        let quantity = req.body.quantity;
        

        if(existCart){
            let cartId = existCart._id;
            
            let existCartProduct = await CartProduct.findOne({$and:[{cartId:cartId},{proId:req.body.proId}]});

            if(existCartProduct){

                await CartProduct.findOneAndUpdate({$and:[{cartId:cartId},{proId:req.body.proId}]},{
                    proId: req.body.proId,
                    quantity: quantity,
                    prodPrice: prodPrice,
                    prodmrp: prodmrp,
                    totalPrice: (prodPrice*quantity),
                    totalmrp: (quantity*prodmrp)
                },{new:true})

            }else{
                let cartProdData = {
                    cartId: cartId,
                    user_id: userId,
                    proId: req.body.proId,
                    quantity: quantity,
                    prodPrice: prodPrice,
                    prodmrp: prodmrp,
                    totalPrice: (prodPrice*quantity),
                    totalmrp: (prodmrp*quantity)
                }
                await CartProduct.create(cartProdData);
                
            }

            let totalCartProducts = await CartProduct.find({cartId:cartId});
            totalCartProducts = JSON.parse(JSON.stringify(totalCartProducts));
            let totalPrice = 0;
            let totalQuantity = 0;
            let totalmrp = 0;
            for(var i in totalCartProducts){
                totalPrice += totalCartProducts[i].totalPrice;
                totalQuantity += totalCartProducts[i].quantity;
                totalmrp += totalCartProducts[i].totalmrp;
            }

            console.log("totalPrice:- "+totalPrice)
            console.log("totalQuantity:- "+totalQuantity)

            await Cart.findOneAndUpdate({_id:cartId},{
                totalQuantity:totalQuantity,
                totalPrice: totalPrice,
                totalmrp: totalmrp
            },{new:true});

        }else{
            totalQuantity = req.body.quantity;
            totalPrice = (quantity*prodPrice);
            totalmrp = (quantity*prodmrp);
            let cartData = {
                user_id: userId,
                user_type: userType,
                deviceId: req.body.deviceId,
                ip_address: req.body.ip_address,
                totalQuantity: totalQuantity,
                totalPrice: totalPrice,
                totalmrp: totalmrp
            }

            console.log(cartData);
            let cart = await Cart.create(cartData);
            let cartId = cart._id;

            let cartProdData = {
                cartId: cartId,
                user_id: userId,
                proId: req.body.proId,
                quantity: quantity,
                prodPrice: prodPrice,
                prodmrp: prodmrp,
                totalPrice: totalPrice,
                totalmrp: totalmrp
            }
            await CartProduct.create(cartProdData);
        }

        let CartData = await Cart.findOne({user_id:userId});
        CartData = JSON.parse(JSON.stringify(CartData));
        if(CartData){
            CartData.products = await CartProduct.find({cartId:CartData._id}).populate([
                {
                    path: "proId", select: "partNo title pro_no retailerPricePercentage customerPricePercentage"
                }
            ]);
        }
        
        message = {
            error: false,
            message:"Cart Added Successfully!",
            data: CartData
        };
        return res.status(200).send(message);

    } catch(err) {
        message = {
            error: true,
            message:"Operation Failed",
            data: err.toString()
        }
        return res.status(200).send(message);
    }
});
/* Remove Items */
CartRoute.post("/remove-item", isAuthenticate, async(req,res)=>{
    try{
        var headers = req.headers;
        var token = headers.authorization.split(' ')[1];

        var user = UserId(token)
        var userId = user.data._id;
        var userType = user.data.register_with;

        if(!req.body.proId){
            message = {
                error: true,
                message:"proId is required",
                data: {}
            }
            return res.status(200).send(message);
        }

        let existCartProduct = await CartProduct.findOne({$and:[{proId:req.body.proId},{user_id:userId}]});

        if(existCartProduct){
            await CartProduct.findOneAndDelete({$and:[{user_id:userId},{proId:req.body.proId}]});
            let totalCartProducts = await CartProduct.find({user_id:userId});
            totalCartProducts = JSON.parse(JSON.stringify(totalCartProducts));
            if(totalCartProducts.length > 0){
                let totalPrice = 0;
                let totalQuantity = 0;
                let totalmrp = 0;
                for(var i in totalCartProducts){
                    totalPrice += totalCartProducts[i].totalPrice;
                    totalQuantity += totalCartProducts[i].quantity;
                    totalmrp += totalCartProducts[i].totalmrp;
                }

                console.log("totalPrice:- "+totalPrice)
                console.log("totalQuantity:- "+totalQuantity)
                console.log("totalmrp:- "+totalmrp)

                await Cart.findOneAndUpdate({user_id:userId},{
                    totalQuantity:totalQuantity,
                    totalPrice: totalPrice,
                    totalmrp: totalmrp
                },{new:true});
            } else{
                await Cart.findOneAndDelete({user_id:userId})
            }
            

            let CartData = await Cart.findOne({user_id:userId});
            CartData = JSON.parse(JSON.stringify(CartData));
            if(CartData){
                CartData.products = await CartProduct.find({cartId:CartData._id})
                .populate([
                    {
                        path: "proId", select: "partNo title pro_no retailerPricePercentage customerPricePercentage"
                    }
                ]);
            }

            if(!CartData){
                CartData = {}
            }
            
            message = {
                error: false,
                message:"Cart Item Removed Successfully!",
                data: CartData
            };
            return res.status(200).send(message);

        }else{
            message = {
                error: true,
                message:"Product not found in cart",
                data: {}
            }
            return res.status(200).send(message);
        }


    }catch(err){
        message = {
            error: true,
            message:"Operation Failed",
            data: err.toString()
        }
        return res.status(200).send(message);
    }
})

/* View Cart */
CartRoute.get("/view", isAuthenticate, async(req,res) => {
    try{
        var headers = req.headers;
        var token = headers.authorization.split(' ')[1];

        var user = UserId(token)
        var userId = user.data._id;
        var userType = user.data.register_with;

        let CartData = await Cart.findOne({user_id:userId});
        CartData = JSON.parse(JSON.stringify(CartData));
        if(CartData){
            CartData.products = await CartProduct.find({cartId:CartData._id}).populate([
                {
                    path: "proId", select: "partNo title pro_no retailerPricePercentage customerPricePercentage images"
                }
            ]);
        }
        if(!CartData){
            CartData = {}
        }
        message = {
            error: false,
            message:"My Cart Data",
            data: CartData
        };
        return res.status(200).send(message);
    }catch(err){
        message = {
            error: true,
            message:"Operation Failed",
            data: err.toString()
        }
        return res.status(200).send(message);
    }
});

CartRoute.delete("/delete/:id", async(req, res) => {
    const result = await Cart.findByIdAndUpdate(
        req.params.id,
        { $set: { isDelete: true } },
        { new: true, strict: false }
    );
    return res.status(200).json({message: "Deleted", status: 200, result})
})


module.exports = CartRoute;

