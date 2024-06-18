require("dotenv").config();
const express = require("express");
const User = require("../../models/user");
const Product = require("../../models/product");
const RetailerProduct = require("../../models/retailerproduct");
const RetailerOrderSupplier = require("../../models/retailerordersupplier");
const RetailerOrder = require("../../models/retailerorder");
const RetailerCustomer = require("../../models/retailercustomer");
const RetailerSupplier = require("../../models/retailersupplier");
const Order = require("../../models/order");
const DashboardRoute = express.Router();


DashboardRoute.get("/list",async(req,res)=>{
    try{
        let UserData = await User.find({status:true}).limit(5).sort({_id:-1});

        let wholesalerData = await User.find({$and:[{status:true},{register_with:"wholesaler"}]}).limit(5).sort({_id:-1});

        let vehicleownerData = await User.find({$and:[{status:true},{register_with:"vehicleowner"}]}).limit(5).sort({_id:-1});


        let productdata = await Product.find({status:true}).populate([
            {
                path:"catId", select: "title"
            },
            {
                path:"subcat0Id", select: "title"
            },
            {
                path:"subcat1Id", select: "title"
            },
            {
                path:"brandId", select: "title"
            },
        ]).limit(5).sort({_id:-1});

        let retailerProductData = await RetailerProduct.find({}).limit(5).sort({_id:-1});

        let retailerSupplierData = await RetailerSupplier.find({}).limit(5).sort({_id:-1});

        let retailerOrderSupplierData = await RetailerOrderSupplier.find({}).limit(5).sort({_id:-1});

        let retailerCustomerData = await RetailerCustomer.find({}).limit(5).sort({_id:-1});

        let retailerOrderData = await RetailerOrder.find({}).limit(5).sort({_id:-1});

        let orderData = await Order.find({}).limit(5).sort({_id:-1});

        //////////////////////////// count of all data //////////////////////////


        let Userlist = await User.find({status:true});

        let wholesalerlist = await User.find({$and:[{status:true},{register_with:"wholesaler"}]});

        let vehicleownerlist = await User.find({$and:[{status:true},{register_with:"vehicleowner"}]});

        let productlist = await Product.find({status:true});

        let retailerProductlist = await RetailerProduct.find({});

        let retailerSupplierlist = await RetailerSupplier.find({});

        let retailerOrderSupplierlist = await RetailerOrderSupplier.find({});

        let retailerCustomerlist = await RetailerCustomer.find({});

        let retailerOrderlist = await RetailerOrder.find({});

        let orderlist = await Order.find({});

       /////////////////////////////////////// monthly user count ///////////////////////////////


        let monthWiseUserCount = await User.aggregate([
            { "$match" : { status : true } },
            {$group: {
                _id: {$month: "$createdAt"}, 
                count: {$sum: 1} 
            }}
        ]);

        let months = [
            "jan",
            "feb",
            "mar",
            "apr",
            "may",
            "jun",
            "jul",
            "aug",
            "sep",
            "oct",
            "nov",
            "dec"
        ]

        let monthWiseUser = [];
            months.forEach((element, index) => {
                let monthData = monthWiseUserCount.find(e => e._id == index+1);
                // console.log(monthData);
                monthWiseUser[index] = {
                    month: element,
                    count: (monthData !== undefined) ? monthData?.count : 0
                }

            })


        ////////////////////////////////// monthly Order count//////////////////////////
        
        
        let monthWiseOrderCount = await Order.aggregate([
            { "$match" : { status : "pending" } },
            {$group: {
                _id: {$month: "$createdAt"}, 
                count: {$sum: "$amount"} 
            }}
        ]);

        let month = [
            "jan",
            "feb",
            "mar",
            "apr",
            "may",
            "jun",
            "jul",
            "aug",
            "sep",
            "oct",
            "nov",
            "dec"
        ]

        let monthWiseOrder = [];
        month.forEach((element, index) => {
            let monthData = monthWiseOrderCount.find(e => e._id == index+1);
            monthWiseOrder[index] = {
                month: element,
                count: (monthData !== undefined) ? monthData?.count : 0
            }

        })


        ////////////////////////////////// monthly retailer order count ///////////////////////////


        let monthWiseRetailerOrderCount = await RetailerOrder.aggregate([
            { "$match" : {status : "pending"} },
            {$group: {
                _id: {$month: "$createdAt"}, 
                count: {$sum: 1} 
            }}
        ]);

        let monthlist = [
            "jan",
            "feb",
            "mar",
            "apr",
            "may",
            "jun",
            "jul",
            "aug",
            "sep",
            "oct",
            "nov",
            "dec"
        ]

        let monthWiseRetailerOrder = [];
        monthlist.forEach((element, index) => {
                let monthData = monthWiseRetailerOrderCount.find(e => e._id == index+1);
                // console.log(monthData);
                monthWiseRetailerOrder[index] = {
                    month: element,
                    count: (monthData !== undefined) ? monthData?.count : 0
                }

            })


        //////////////////////// month wise retailer supplier Order count//////////////////

        let monthWiseRetailerSupplierOrderCount = await RetailerOrderSupplier.aggregate([
            { "$match" : {status : "pending"} },
            {$group: {
                _id: {$month: "$createdAt"}, 
                count: {$sum: 1} 
            }}
        ]);

        let monthwise = [
            "jan",
            "feb",
            "mar",
            "apr",
            "may",
            "jun",
            "jul",
            "aug",
            "sep",
            "oct",
            "nov",
            "dec"
        ]

        let monthWiseRetailerSupplierOrder = [];
        monthwise.forEach((element, index) => {
                let monthData = monthWiseRetailerSupplierOrderCount.find(e => e._id == index+1);
                // console.log(monthData);
                monthWiseRetailerSupplierOrder[index] = {
                    month: element,
                    count: (monthData !== undefined) ? monthData?.count : 0
                }

            })


        



        message = {
            error:false,
            message:"Dashboard Data",
            data: {
                latestUser:UserData,
                latestWholesaler:wholesalerData,
                latestVehicleowner:vehicleownerData,
                latestProduct:productdata,
                latesrRetailerProduct:retailerProductData,
                latestRetailerSupplier:retailerSupplierData,
                latesrRetailerOrderSupplier:retailerOrderSupplierData,
                latestRetailerCustomer:retailerCustomerData,
                latestRetailerOrder:retailerOrderData,
                latestOrder:orderData,
                totalUser:Userlist.length,
                totalWholesaler:wholesalerlist.length,
                totalVehicleowner:vehicleownerlist.length,
                totalProduct:productlist.length,
                totalRetailerProduct:retailerProductlist.length,
                totalRetailerSupplier:retailerSupplierlist.length,
                totalRetailerOrderSupplier:retailerOrderSupplierlist.length,
                totalRetailerCustomer:retailerCustomerlist.length,
                totalRetailerOrder:retailerOrderlist.length,
                totalOrder:orderlist.length,
            },
            monthData:{
                monthWiseUser,
               // monthWiseOrder,
                monthWiseRetailerOrder,
                monthWiseRetailerSupplierOrder
                
            }

        };
        return res.status(200).send(message);
    }catch(err){
        message = {
            error:true,
            message:"Operation Failed",
            data:err.toString()
        };
        return res.status(200).send(message);
    }
});

module.exports = DashboardRoute;