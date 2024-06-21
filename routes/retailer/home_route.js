require("dotenv").config();
const express = require('express');
// const RetailerJournal = require("../../models/retailerjournal");
const HomeRoute = express.Router();
const isAuthenticate = require("../../middleware/authcheck");
const User = require("../../helper/getUserToken");
const RetailerOrder = require("../../models/retailerorder");
const RetailerOrderSupplier = require("../../models/retailerordersupplier");
const RetailerSupplier = require("../../models/retailersupplier");
const RetailerCustomer = require("../../models/retailercustomer");
const RetailerNotification = require("../../models/retailernotification");

/*
**  Home Page
*/
HomeRoute.get("/index", isAuthenticate, async(req,res) => {
    
    try{
        let headers = req.headers;
        let token = headers.authorization.split(' ')[1];
        let user = User(token);

        if(!user.data.register_with || user.data.register_with != 'wholesaler'){
            message = {
                error: true,
                message: "You are not logged in as Retailer",
                data: {}
            }
            return res.status(200).send(message)
        }
        /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
        const retailerId = user.data._id;
        console.log("retailerId:- "+retailerId)

        let total_orders = await RetailerOrder.find({retailerId:retailerId}).count();

        let total_amount = await RetailerOrder.aggregate(
            [
                {
                    $group: {
                        _id:"$id",
                        total: { $sum: "$orderPrice" }
                    }
                }
            ]
        );    
        var iterator = total_amount.values();
        let totalOrderAmount = 0;
        for (let elements of iterator) {
            totalOrderAmount = elements.total;
        }
        let today_orders = await RetailerOrder.find({
            retailerId: retailerId,
            orderDate: {
                $gte: new Date(2022, 10, 25), 
                $lte: new Date(2022, 10, 27)
            }
        }).count()

        console.log(new Date(2022, 10, 27))

        let gts_supplier = await RetailerSupplier.findOne({retailerId:retailerId,$and:[{name:"GTS"}]})
        let gts_supplier_id = gts_supplier._id;        
        let gts_orders_count = await RetailerOrderSupplier.find({retailerId:retailerId,supplierId:gts_supplier_id}).count();

        let customerCount = await RetailerCustomer.find({retailerId:retailerId}).count();

        let recentorders = await RetailerOrder.find({retailerId:retailerId}).limit(5);
        
        result = {
            total_orders: total_orders, /* count */
            total_amount: totalOrderAmount, /* amount */
            gts_orders: gts_orders_count, /* count */
            today_orders: today_orders, /* count */
            today_sell: 10, /* amount */
            own_customers: customerCount, /* count */
            recent_orders: recentorders,
            yearly_sales: [],
            notifications: []  /* last 10 notifications*/
        }
        message = {
            error: false,
            message: "My dashboard",
            data: result
        }

        return res.status(200).send(message);

    }catch(err){
        message = {
            error: true,
            message: "Operation failed",
            data: err.toString()
        }
        return res.status(200).send(message);
    }
})
/*
** Notification List
*/
HomeRoute.get("/notification", isAuthenticate, async(req,res) => {
    try{
        let headers = req.headers;
        let token = headers.authorization.split(' ')[1];
        let user = User(token);

        if(!user.data.register_with || user.data.register_with != 'wholesaler'){
            message = {
                error: true,
                message: "You are not logged in as Retailer",
                data: {}
            }
            return res.status(200).send(message)
        }
        /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
        const retailerId = user.data._id;

        let notification = await RetailerNotification.find({retailerId:retailerId}).sort({_id:-1});

        message = {
            error: false,
            message: "My all notifications",
            data: notification
        }
        return res.status(200).send(message)
    }catch(err){
        message = {
            error: true,
            message: "Operation failed",
            data: err
        }
        return res.status(200).send(message)
    }
})

module.exports = HomeRoute;