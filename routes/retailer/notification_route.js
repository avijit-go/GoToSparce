require("dotenv").config();
const express = require('express');
const RetailerNotification = require("../../models/retailernotification");
const NotificationRoute = express.Router();
const isAuthenticate = require("../../middleware/authcheck");
const User = require("../../helper/getUserToken");
const { query } = require("express");

NotificationRoute.get("/list", isAuthenticate, async(req,res) => {
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

        let resultData = await RetailerNotification.find({retailerId:retailerId}).sort({_id:-1});
        message = {
            error: false,
            message: "My Notifications",
            data: resultData
        }
        return res.status(200).send(message);
    } catch (err) {

        message = {
            error: true,
            message: "Operation failed",
            data: err.toString()
        }
        return res.status(200).send(message);
    }
});


// NotificationRoute.get("/available/list", isAuthenticate, async(req,res) => {
//     try{
//         let headers = req.headers;
//         let token = headers.authorization.split(' ')[1];
//         let user = User(token);

//         if(!user.data.register_with || user.data.register_with != 'wholesaler'){
//             message = {
//                 error: true,
//                 message: "You are not logged in as Retailer",
//                 data: {}
//             }
//             return res.status(200).send(message)
//         }
//         /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
//         const retailerId = user.data._id;

//         let resultData = await RetailerNotification.find({}).populate([
//             {
//                 path:"prodId",
//                 select:"title"
//             }
//         ]).sort({_id:-1});
//         message = {
//             error: false,
//             message: "My Notifications",
//             data: resultData
//         }
//         return res.status(200).send(message);
//     } catch (err) {

//         message = {
//             error: true,
//             message: "Operation failed",
//             data: err.toString()
//         }
//         return res.status(200).send(message);
//     }
// });





module.exports = NotificationRoute;