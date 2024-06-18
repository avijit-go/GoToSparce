require("dotenv").config();
const express = require("express");
const AdminNotification = require("../../models/adminNotification");
const AdminNotificationRoute = express.Router();
const isAuthenticate = require("../../middleware/authcheck");


/**
 * This Method is used to find list of admin notification
 */

 AdminNotificationRoute.get("/list",isAuthenticate, async (req, res) => {
    try {
        const AdminNotificationData = await AdminNotification.find({}).populate([
            {
                path:"retailerId",
                select:"fname lname"
            },
            {
                path:"retailerNotificationId",
                select: ""
            }
        ]).sort({_id:-1});
        message = {
            error: false,
            message: "All Notification list",
            data: AdminNotificationData,
        };
        res.status(200).send(message);
    } catch(err) {
        message = {
            error: true,
            message: "operation failed!",
            data: err,
        };
        res.status(400).send(message);
    }
});



// AdminNotificationRoute.delete("/delete/:id",isAuthenticate, async (req, res) => {
//     try {
//         const result = await AdminNotification.deleteOne({
//             _id: req.params.id
//         });
//         if (result.deletedCount == 1) {
//             message = {
//                 error: false,
//                 message: "AdminNotification deleted successfully!",
//             };
//             res.status(200).send(message);
//         } else {
//             message = {
//                 error: true,
//                 message: "Operation failed!",
//             };
//             res.status(200).send(message);
//         }
//     } catch (err) {
//         message = {
//             error: true,
//             message: "Operation Failed!",
//             data: err,
//         };
//         res.status(200).send(message);
//     }
// });



module.exports = AdminNotificationRoute;