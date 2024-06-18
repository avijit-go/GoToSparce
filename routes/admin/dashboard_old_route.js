// require("dotenv").config();
// const express = require("express");
// const User = require("../../models/user");
// const Product = require("../../models/product");
// const RetailerProduct = require("../../models/retailerproduct");
// const RetailerOrderSupplier = require("../../models/retailerordersupplier");
// const RetailerOrder = require("../../models/retailerorder");
// const RetailerCustomer = require("../../models/retailercustomer");
// const RetailerSupplier = require("../../models/retailersupplier");
// const Order = require("../../models/order");
// const DashboardRoute = express.Router();

// DashboardRoute.get("/list",async(req,res)=>{
//     try{
//         ///////////////////// latest 5 list of data //////////////////////////////

//         let UserData = await User.find({status:true}).limit(5).sort({_id:-1});

//         let wholesalerData = await User.find({$and:[{status:true},{register_with:"wholesaler"}]}).limit(5).sort({_id:-1});

//         let vehicleownerData = await User.find({$and:[{status:true},{register_with:"vehicleowner"}]}).limit(5).sort({_id:-1});


//         let productdata = await Product.find({status:true}).populate([
//             {
//                 path:"catId", select: "title"
//             },
//             {
//                 path:"subcat0Id", select: "title"
//             },
//             {
//                 path:"subcat1Id", select: "title"
//             },
//             {
//                 path:"brandId", select: "title"
//             },
//         ]).limit(5).sort({_id:-1});

//         let retailerProductData = await RetailerProduct.find({}).limit(5).sort({_id:-1});

//         let retailerSupplierData = await RetailerSupplier.find({}).limit(5).sort({_id:-1});

//         let retailerOrderSupplierData = await RetailerOrderSupplier.find({}).limit(5).sort({_id:-1});

//         let retailerCustomerData = await RetailerCustomer.find({}).limit(5).sort({_id:-1});

//         let retailerOrderData = await RetailerOrder.find({}).limit(5).sort({_id:-1});

//         let orderData = await Order.find({}).limit(5).sort({_id:-1});

//         //////////////////////////// count of all data //////////////////////////


//         let Userlist = await User.find({status:true});

//         let wholesalerlist = await User.find({$and:[{status:true},{register_with:"wholesaler"}]});

//         let vehicleownerlist = await User.find({$and:[{status:true},{register_with:"vehicleowner"}]});

//         let productlist = await Product.find({status:true});

//         let retailerProductlist = await RetailerProduct.find({});

//         let retailerSupplierlist = await RetailerSupplier.find({});

//         let retailerOrderSupplierlist = await RetailerOrderSupplier.find({});

//         let retailerCustomerlist = await RetailerCustomer.find({});

//         let retailerOrderlist = await RetailerOrder.find({});

//         let orderlist = await Order.find({});

//         //////////////////////////////// monthly user count ////////////////////////

//         let monthWiseUserCount = await User.aggregate([
//             { "$match" : { status : true } },
//             {$group: {
//                 _id: {$month: "$createdAt"}, 
//                 count: {$sum: 1} 
//             }}
//         ]);

//         let months = [
//             "jan",
//             "feb",
//             "mar",
//             "apr",
//             "may",
//             "jun",
//             "jul",
//             "aug",
//             "sep",
//             "oct",
//             "nov",
//             "dec"
//         ]

//         let monthWiseUser = [];
//             months.forEach((element, index) => {
//                 let monthData = monthWiseUserCount.find(e => e._id == index+1);
//                 // console.log(monthData);
//                 monthWiseUser[index] = {
//                     month: element,
//                     count: (monthData !== undefined) ? monthData?.count : 0
//                 }

//             }),
//       ////////////////////////////////// monthly withdrawl count//////////////////////////



//         message = {
//             error:false,
//             message:"Dashboard data",
//             data:{
//                 latestUser:UserData,
//                 latestWholesaler:wholesalerData,
//                 latestVehicleowner:vehicleownerData,
//                 latestProduct:productdata,
//                 latesrRetailerProduct:retailerProductData,
//                 latestRetailerSupplier:retailerSupplierData,
//                 latesrRetailerOrderSupplier:retailerOrderSupplierData,
//                 latestRetailerCustomer:retailerCustomerData,
//                 latestRetailerOrder:retailerOrderData,
//                 latestOrder:orderData,
//                 totalUser:Userlist.length,
//                 totalWholesaler:wholesalerlist.length,
//                 totalVehicleowner:vehicleownerlist.length,
//                 totalProduct:productlist.length,
//                 totalRetailerProduct:retailerProductlist.length,
//                 totalRetailerSupplier:retailerSupplierlist.length,
//                 totalRetailerOrderSupplier:retailerOrderSupplierlist.length,
//                 totalRetailerCustomer:retailerCustomerlist.length,
//                 totalRetailerOrder:retailerOrderlist.length,
//                 totalOrder:orderlist.length,

//             },
//             monthWiseData:{
//                 monthWiseUser,
//                 monthWiseOrder,
//                 monthWiseOrder,
//                 // accountTypeCount
                
//             }
            
//         }
//         return res.status(200).send(message);
//     }catch(err){
//         message = {
//             error:true,
//             message:"Operation failed",
//             data:err.toString()
//         }
//         return res.status(200).send(message);
//     }
// });


// module.exports = DashboardRoute;