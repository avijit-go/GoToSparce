require("dotenv").config();
const express = require('express');
const RetailerJournal = require("../../models/retailerjournal");
const JournalRoute = express.Router();
const isAuthenticate = require("../../middleware/authcheck");
const User = require("../../helper/getUserToken");
const { query } = require("express");
const moment = require("moment-timezone");

/*
** List
*/
// JournalRoute.get("/list", isAuthenticate, async(req,res) => {
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
//         // return res.send(retailerId)

//         // var type =  req.query.type;
//         // if(!type){
//         //     type = "income"
//         // }

//         // console.log(type);

//         let searchBy = {}
//         let type = req.query.type;
//         if(type){
//             searchBy = {type:type}
//         }

//         // return res.send("Hi")
//         let journalData = await RetailerJournal.find({
//             retailerId:retailerId,
//             $and: [{searchBy},]
//         }).populate([
//             {
//                 path:"orderId",
//                 select:"orderPrice status"
//             },
//             {
//                 path:"supplierorderId",
//                 select:"orderPrice status"
//             }
//         ]).sort({_id:-1});

//         message = {
//             error: false,
//             message: "Journal",
//             data: journalData
//         }
//         return res.status(200).send(message);
        

//     }catch(err){
//         message = {
//             error: true,
//             message: "Operation failed",
//             data: err
//         }
//         return res.status(200).send(message);
//     }
// });




/*
** List
*/
// JournalRoute.get("/date-wise-list", isAuthenticate, async(req,res) => {
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
//         // return res.send(retailerId)

//        // var type =  req.query.type;
//         // if(!type){
//         //     type = "income"
//         // }

//         // console.log(type);

//         // return res.send("Hi")
//         let journalData = await RetailerJournal.find({
//             retailerId:retailerId,
//             $and: [{entryDate:{ $gte: req.query.from, $lte: req.query.to }},{type:req.query.type}]
//         }).populate([
//             {
//                 path:"orderId",
//                 select:"orderPrice status"
//             },
//             {
//                 path:"supplierorderId",
//                 select:"orderPrice status"
//             }
//         ]).sort({_id:-1});

//         message = {
//             error: false,
//             message: "Journal",
//             data: journalData
//         }
//         return res.status(200).send(message);
        

//     }catch(err){
//         message = {
//             error: true,
//             message: "Operation failed",
//             data: err
//         }
//         return res.status(200).send(message);
//     }
// })


/*
** List by date type
*/

JournalRoute.get("/list", isAuthenticate, async(req,res) => {
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
        // return res.send(retailerId)

        //let searchBy = {}
        let type = req.query.type;
        let from = req.query.from ? moment(new Date(req.query.from)).tz('Asia/Kolkata').format() : undefined;
        let to = req.query.to ? moment(new Date(req.query.to)).tz('Asia/Kolkata').add(1, 'days').format() : undefined;

        // console.log(`form >>>>>>>>>>>>> ${moment(new Date(from)).tz('Asia/Kolkata').format()} to >>>>>>>>>>>>>> ${moment(new Date(to)).tz('Asia/Kolkata').add(1, 'days').format()}`);

        let findData = {
            $and:[
                {retailerId:retailerId}
            ]
        }

        if(type){
            findData.$and.push({type:type})
        }
        if(from && to){
            findData.$and.push( {entryDate:{ $gte: from, $lt: to }} )
        }
        

        let result = await RetailerJournal.find(findData)
                    .populate([
                        {
                            path:"retailerId",
                            select:"fname lname",
                        },
                        {
                            path:"orderId",
                            select:"orderPrice status",
                            populate:{
                                path:"customerId",
                                select:"fname lname"
                            }
                        },
                        {
                            path:"supplierorderId",
                            select:"orderPrice status",
                            populate:{
                                path:"supplierId",
                                select:"name"
                            }
                        }
                    ])
                    .sort({_id:-1});
        result = JSON.parse(JSON.stringify(result))
        result = result.map(e => {
            e.entryDate = e.entryDate ? moment(e.entryDate).tz('Asia/Kolkata').format() : e.entryDate
            return e
        })
        message = {
            error: false,
            message: "Journal",
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
});





module.exports = JournalRoute;