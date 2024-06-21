require("dotenv").config();
const express = require('express');
const Model = require("../models/model");
const multer = require('multer');
const RetailerNotification = require("../models/retailernotification");
const TestProduct = require("../models/testproduct");
const TestRoute = express.Router()
const generateIndex = require("../helper/generateIndex");
const Product = require("../models/product");
const RetailerJournal = require("../models/retailerjournal");
const RetailerExpense = require("../models/retailerexpense");
const RetailerOrderSupplier = require("../models/retailerordersupplier");
const RetailerOrder = require("../models/retailerorder");
const RetailerProfile = require("../models/retailerprofile");
const RetailerProtfolio = require("../models/retailerportfolio");
const AdminNotification = require("../models/adminNotification");
const ProductVechicle = require("../models/product_vehicles");
// const moment = require("moment");
// const dateIndia = moment().utcOffset("+05:30").format()

/*
** Create dummy notification
*/
TestRoute.post("/create-notification", async(req,res) => {
    try{
        let notificationData = [
            {
                retailerId: "636a58fecad22b6a1c5a7485",
                type: "customer_order",
                entryDate: new Date,
                description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
            },
            {
                retailerId: "636a58fecad22b6a1c5a7485",
                type: "customer_order",
                entryDate: new Date,
                description: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book."
            },
            {
                retailerId: "636a58fecad22b6a1c5a7485",
                type: "customer_order",
                entryDate: new Date,
                description: "It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged."
            },
            {
                retailerId: "636a58fecad22b6a1c5a7485",
                type: "customer_order",
                entryDate: new Date,
                description: "It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
            }
        ];
        // result = await RetailerNotification.insertMany(notificationData);
        result = await RetailerNotification.find({retailerId:"636a58fecad22b6a1c5a7485"}).populate([
            {path:"retailerId", select: "fname lname email mobile"}
        ]);
        message = {
            error: false,
            message: "Created",
            data: result
        }      
        return res.status(201).send(message)
        

        return res.send(dateIndia);

    }catch(err){
        message = {
            error: true,
            message: "Operation failed",
            data: err.toString()
        }
        return res.status(200).send(message);
    }
})

TestRoute.get("/check", async(req,res) => {
    let partNo = req.query.partNo;
    let makeId = req.query.makeId;
    let modelId = req.query.modelId;

    let isProdExist = true;

    let checkProd = await Product.findOne({partNo:partNo});

    if(checkProd){
        let checkProdVehMake = await ProductVechicle.find({$and:[{prodId: checkProd._id},{makeId:makeId}]});
        if(checkProdVehMake.length > 0){
            let checkProdVehModel = await ProductVechicle.find({$and:[{prodId: checkProd._id},{makeId:makeId},{modelId:modelId}]});
            if(checkProdVehModel.length > 0){
                message = {
                    error: true,
                    message:"Product exists with same make model",
                    data: {}
                };
                return res.status(200).send(message);
            } else {
                isProdExist = false;
            }
        } else {
            isProdExist = false;
        }
    } else {
        isProdExist = false;
    }

    if(!isProdExist){
        message = {
            error: false,
            message:" Your requirement saved successfully ",
            data: {}
        };
        return res.status(200).send(message);
    }
})

/*
Test CSV File upload
*/

TestRoute.post("/upload-csv-products", (req,res) => {
    var storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/productcsv')
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname)
        },
    })
    var uploads = multer({ storage: storage })

})

TestRoute.post("/create-test-product", async(req,res) => {
    // var nonbrandModels = await Model.find({brandId:undefined});
    // var total = nonbrandModels.length
    // res.send({total,nonbrandModels});
    // res.send("Deleted");

    let x = Math.floor(Math.random()*90000000) + 10000000;
    console.log(x);
    let startNo = 1;
    let startWith = startNo.toString();   
    console.log(startWith)
    console.log(generateIndex(10,startWith));

    let products = await Product.find().sort({_id:1});
    products = JSON.parse(JSON.stringify(products));
    let countPro = products.length;



    res.send({countPro,products});


})

TestRoute.get("/get-journal", async(req,res) => {
    let journal = await RetailerJournal.find();
    journal = JSON.parse(JSON.stringify(journal))
    for(var i in journal){
        if(journal[i].expenseId){
            // console.log("Hi");
            var expenseId = journal[i].expenseId;
            let expenseData = await RetailerExpense.findOne({_id: expenseId});
            // console.log(expenseData);
            let expenseamount = expenseData.amount;
            // journal[i].expenseAmount = expenseamount;
            // await RetailerJournal.findOneAndUpdate({_id:journal[i]._id}, {amount: expenseamount }, {new: true})

        }
        if(journal[i].supplierorderId){
            var supplierorderId = journal[i].supplierorderId;
            let supplierOrderData = await RetailerOrderSupplier.findOne({_id:supplierorderId});
            let orderprice = supplierOrderData.orderPrice;
            // journal[i].orderprice = orderprice;
            // await RetailerJournal.findOneAndUpdate({_id:journal[i]._id}, {amount: orderprice }, {new: true})
        }
        if(journal[i].orderId){
            var orderId = journal[i].orderId;
            let orderData = await RetailerOrder.findOne({_id:orderId});
            let orderprice = orderData.orderPrice;
            // await RetailerJournal.findOneAndUpdate({_id:journal[i]._id}, {amount: orderprice }, {new: true})
        }
    }
    countData = journal.length;
    return res.send({countData,journal});
})

module.exports = TestRoute;