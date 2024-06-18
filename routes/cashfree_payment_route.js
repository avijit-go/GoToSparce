require("dotenv").config();
const express = require("express");
const Cart = require("../models/cart");
const CashfreeRoute = express.Router();
const isAuthenticate = require("../middleware/authcheck");
const UserId  = require("../helper/getUserToken");
const axios = require('axios');

/**
 * Generate Cftoken for cashfree here
 */
CashfreeRoute.get("/generate-token", isAuthenticate, async(req,res) => {
    try{
        var headers = req.headers;
        var token = headers.authorization.split(' ')[1];

        var user = UserId(token)
        var userId = user.data._id;
        var userType = user.data.register_with;

        let CartData = await Cart.findOne({user_id:userId});
        if(!CartData) return res.status(200).send({error: true, message: "User cart is empty"})

        const orderId = `GTS${Date.now()}`
        const axiosData = await axios.post(process.env.CASHFREE_URL, {
            "orderId": orderId,
            "orderAmount": CartData.totalPrice,
            "orderCurrency":"INR"
        }, {
            headers: {
                "X-Client-Id": process.env.CASHFREE_CLIENT_ID,
                "X-Client-Secret": process.env.CASHFREE_CLIENT_SECRET
            }
        })

        message = {
            error: false,
            message:"My Cart Data",
            orderId,
            data: axiosData.data
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
})

CashfreeRoute.get("/generate-payment-session", isAuthenticate, async(req,res) => {
    try{
        var headers = req.headers;
        var token = headers.authorization.split(' ')[1];

        var user = UserId(token)
        var userId = user.data._id;
        var userType = user.data.register_with;

        let CartData = await Cart.findOne({user_id:userId}).populate([{path: "user_id"}]);
        console.log("CartData >>>>>>> ",CartData);
        if(!CartData) return res.status(200).send({error: true, message: "User cart is empty"})

        const orderId = `GTS${Date.now()}`
        const axiosData = await axios.post(process.env.CASHFREE_SESSION_URL, {
            customer_details: {
                customer_id: String(CartData?.user_id?._id),
                customer_email: CartData?.user_id?.email,
                customer_phone: CartData?.user_id?.mobile
            },
            order_amount: (CartData.totalPrice).toFixed(2),
            order_currency: 'INR',
            order_id: orderId
        }, {
            headers: {
                accept: 'application/json',
                "x-client-id": process.env.CASHFREE_CLIENT_ID,
                "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
                'x-api-version': process.env.CASHFREE_API_VERSION,
                'content-type': 'application/json'
            }
        })

        message = {
            error: false,
            message:"My Cart Data",
            orderId,
            data: axiosData.data
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
})

module.exports = CashfreeRoute