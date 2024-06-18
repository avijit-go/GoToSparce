require("dotenv").config();
const express = require("express");
const Cart = require("../models/cart");
const CartRoute = express.Router();
const isAuthenticate = require("../middleware/authcheck");  /* For User (wholesaler or vehicle owener) */
const UserId  = require("../helper/getUserToken");
const Product = require("../models/product");


/**
 * This method is used to create cart
 */

 CartRoute.post("/create",isAuthenticate, async(req,res)=>{
    try{ 
        var headers = req.headers;
        var token = headers.authorization.split(' ')[1];

        var user = UserId(token)
        var userId = user.data._id;
        var userType = user.data.register_with;
        
        console.log(user);
        console.log(userId);
        console.log(userType);
        console.log(user.data.email);

        
        
        req.body.user_id = userId;
        req.body.user_type = userType;
        
        // if(req.body.ip_address == null || req.body.deviceId == null){
        //     message = {
        //         error: true,
        //         message:"user not found!"
        //     };
        //     return res.status(200).send(message);
        // }

        /* Exist cart product for user */
        const existCartProduct = await Cart.find({ $and: [{ user_id: userId }, { proId: req.body.proId }] });

        if(existCartProduct.length > 0){
            
            message = {
                error: true,
                message:"This product already added in your cart",
                data: {}
            };
            return res.status(200).send(message);
        }

        /* No product found */

        let proId =  req.body.proId;
        let proData = await Product.findOne({_id:proId});

        if(!proData){
            message = {
                error: true,
                message:"Product not found!"
            };
            return res.status(200).send(message);
        }
        
        if(userType == 'wholesaler'){
            req.body.price = proData.retailerDiscountedPrice * req.body.quantity;
            
        } else if (userType == 'vehicleowner'){
            req.body.price = proData.customerDiscountedPrice * req.body.quantity;
        }

        /* ============================ */
        console.log(proData)
        // console.log(req.body); return res.send("Hi");
        const CartData = new Cart(req.body);
        
        const result = await CartData.save();
        message = {
            error: false,
            message:"Cart Added Successfully!",
            data: result
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

/**
 * This method is used to find all cart data
 */ 

 CartRoute.get("/list",isAuthenticate, async(req,res)=>{
    try{
        // return res.send(isAuthenticate);
        var headers = req.headers;
        var token = headers.authorization.split(' ')[1];

        var user = UserId(token)
        var userId = user.data._id;
        var userType = user.data.register_with;

        console.log(user);
        console.log(userId);
        console.log(userType);
        
        req.body.user_id = userId;
        req.body.user_type = userType;

        let CartData = await Cart.find({$and: [{ user_id: userId }, {user_type:userType}]}).populate([
            {
                path:"proId",
                select:"",
                populate: [
                    {path:"catId", select: "title" },
                    {path:"subcat0Id", select: "title" },
                    //{path:"makeId", select: "title" },
                    {path:"brandId", select: "title" },
                    // {path:"modelId", select: "title" },
                    // {path:"yearId", select: "title" }
                ]
            },
            {
                path:"user_id",
                select:"fname lname"
            }
        ]).sort({_id:-1});

        message = {
            error: false,
            message: "All Cart data list",
            data: CartData
        };
        return res.status(200).send(message);
        
    }catch(err){
        message = {
            error: true,
            message: "operation failed!",
            data:err.toString(),
        }
        return res.status(200).send(message);
    }
    
 });

 /**
 * This method is used to find all cart data by userId
 */ 

CartRoute.get("/list-by-userId/:userId",isAuthenticate, async(req,res)=>{
    try{
        let CartData = await Cart.find({user_id:req.params.userId}).populate([
            {
                path:"proId",
                select:"title description portNo"
            },
            {
                path:"user_id",
                select:"fname lname"
            }
        ]).sort({_id:-1});

        message = {
            error: false,
            message: "All Cart data list",
            data: CartData
        };
        return res.status(200).send(message);
        
    }catch(err){
        message = {
            error: true,
            message: "operation failed!",
            data:err.toString(),
        }
        return res.status(200).send(message);
    }
    
});


 /**
 * This method is used to update cart data
 *   @param str cartId
 */

CartRoute.get("/detail/:cartId",isAuthenticate, async(req,res)=>{
    try{
        let CartData = await Cart.find({_id:req.params.cartId}).populate([
            {
                path:"proId", 
                select: "", 
                populate: [
                    {path:"catId", select: "title" },
                    {path:"subcat0Id", select: "title" },
                    {path:"makeId", select: "title" },
                    {path:"brandId", select: "title" },
                    {path:"modelId", select: "title" },
                    {path:"yearId", select: "title" }
                ]
            }
        ]).sort({_id:-1});

        message = {
            error: false,
            message: "Detail Cart data list",
            data: CartData
        };
        return res.status(200).send(message);
        
    }catch(err){
        message = {
            error: true,
            message: "operation failed!",
            data:err.toString(),
        }
        return res.status(200).send(message);
    }
    
});

 /**
 * This method is used to update cart data
 *   @param str cartId
 */

CartRoute.patch("/update/:cartId",isAuthenticate, async (req, res) => {
	try {
        var headers = req.headers;
        var token = headers.authorization.split(' ')[1];

        var user = UserId(token)
        var userId = user.data._id;
        var userType = user.data.register_with;
        //const result = await Cart.findOneAndUpdate({ _id: req.params.cartId }, req.body, {new: true});
        if(userType == 'wholesaler'){
            const result = await Cart.findOneAndUpdate({$and:[{user_id: userId},{ _id: req.params.cartId }, req.body, {new: true}]});
            price = price * req.body.quantity;
            
        } else if (userType == 'vehicleowner'){
            const result = await Cart.findOneAndUpdate({$and:[{user_id: userId},{ _id: req.params.cartId }, req.body, {new: true}]});
            price = price * req.body.quantity;
        }

		if (result) {
			message = {
				error: false,
				message: "Cart updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Cart not updated",
			};
			res.status(200).send(message);
		}
	} catch (err) {
		message = {
			error: true,
			message: "Operation Failed!",
			data: err.toString(),
		};
		res.status(200).send(message);
	}
});

/**
 * This method is used to delete cart data
 *   @param str cartId
 */

CartRoute.delete("/delete/:cartId",isAuthenticate, async (req, res) => {
    try {
        const result = await Cart.deleteOne({
            _id: req.params.cartId
        });
        if (result.deletedCount == 1) {
            message = {
                error: false,
                message: "Cart deleted successfully!",
            };
            res.status(200).send(message);
        } else {
            message = {
                error: true,
                message: "Operation failed!",
            };
            res.status(200).send(message);
        }
    } catch (err) {
        message = {
            error: true,
            message: "Operation Failed!",
            data: err,
        };
        res.status(200).send(message);
    }
});




module.exports = CartRoute;

