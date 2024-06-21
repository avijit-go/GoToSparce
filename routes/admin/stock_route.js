require("dotenv").config();
const express = require("express");
const Stock = require("../../models/stock");
const Category = require("../../models/category");
const RetailerStock = require("../../models/retailerstock");
const StockRoute = express.Router();
const isAuthenticate = require("../../middleware/authcheck");  /* For GTS Admin */
const Product = require("../../models/product");
const { json } = require("body-parser");


StockRoute.get("/list",isAuthenticate, async(req,res)=>{
    try{
        let searchByProId = {}
        let messageText = "All stock list";
        let proId = req.query.proId;
        if(proId){
            searchByProId = {proId:proId}
            messageText = "Product wise stock list"
        }
        // console.log(proId)
        // return res.send(req.params);
        
        let StockData = await Stock.find(searchByProId).populate([
            {
                path:"proId",
                select:"title catId subcat0Id subcat1Id subcat2Id",
                populate: [
                    {
                        path: "catId",
                        select: "title"
                    },
                    {
                        path: "subcat0Id",
                        select: "title"
                    },
                    {
                        path: "subcat1Id",
                        select: "title"
                    },
                    {
                        path: "subcat2Id",
                        select: "title"
                    }
                ]
            }
        ]).sort({_id:-1});
        StockData = JSON.parse(JSON.stringify(StockData)).map(e => {
            e.productId = e.proId?._id
            e.count = e.stock_type === 'stock_out' ? -e.count : e.count
            return e
        })

        let customStockData = Array() 

        for (let index = 0; index < StockData.length; index++) {
            const stockElement = StockData[index];
            const stockIndex = customStockData.findIndex(e => e.productId === stockElement.productId)
            if (stockIndex > -1) {
                customStockData[stockIndex].count += stockElement.count
            } else {
                customStockData.push(stockElement)
            }
        }
        message = {
            error: false,
            message: messageText,
            data: customStockData
        }
        res.status(200).send(message);
    } catch(err) {
        message = {
            error: true,
            message: "Operation Failed",
            data:err.toString()
        }
        res.status(200).send(message);
    }

});


StockRoute.post("/create-bulk",isAuthenticate, async(req,res)=>{
    try{
        const productData = await Product.find({status: true})
        const stockData = Array()
        for (let index = 0; index < productData.length; index++) {
            const element = productData[index];
            stockData.push({
                proId: productData[index]._id,
                stock_type: "initial"
            })
        }
        const result = await Stock.insertMany(stockData);
        message = {
            error: false,
            message: "Bulk stock added successfully",
            data:result
        }
        res.status(200).send(message);
    }catch(err){
        message = {
            error: true,
            message: "Operation Failed",
            data:err
        }
        res.status(200).send(message);
    }

});

StockRoute.post("/create",isAuthenticate, async(req,res)=>{
    try{
        const StockData = new Stock(req.body);
        const result = await StockData.save();
        message = {
            error: false,
            message: "stock added successfully",
            data:result
        }
        res.status(200).send(message);
    }catch(err){
        message = {
            error: true,
            message: "Operation Failed",
            data:err
        }
        res.status(200).send(message);
    }

});

// StockRoute.get("/list", isAuthenticate, async(req,res) => {
//     try{
//         let stockData = [];
        
//         console.log(req.query);
        
//         var searchText = req.query.search
//         var catId = req.query.catId;
//         var subcatId = req.query.subcatId;
//         console.log(searchText)
//         var concatAnd = subconcatAnd = searchAnd = {};
//         if(catId){
//             concatAnd = { catId:catId }
//         }
//         if(subcatId){
//             subconcatAnd = { subcatId:subcatId }
//         }
//         if(searchText){
//             searchAnd = {title: {$regex: searchText, $options: 'i'}}
//         }
        
//         console.log(subconcatAnd);
        
//         stockData = await RetailerStock.find({
//             $and:[
//                 concatAnd , subconcatAnd
//             ]
//             }).populate(
//             [
//                 {
//                     path: "proId", 
//                     select: "proTitle price",
//                     // populate:{
//                     //     path:"proId",
//                     //     select:"title"
//                     // },
//                     match: { $or: [
//                         searchAnd
//                     ]}
//                 },
//                 {   
//                     path: "catId", 
//                     select: "title",
//                 },
//                 {
//                     path: "subcatId", 
//                     select: "title",
//                 }
//             ]
//         ).distinct("proId"); 

//         stockData = JSON.parse(JSON.stringify(stockData))
      
//       //  console.log("stockData",stockData);

//         let productStockData = [];

//         for(var i in stockData){
//             var proId = stockData[i];

//             let result = await RetailerStock.find({proId:proId}).populate(
//                 [
//                     {
//                         path: "proId", 
//                         select: "proTitle price",
//                     },
//                     {   
//                         path: "catId", 
//                         select: "title",
//                     },
//                     {
//                         path: "subcatId", 
//                         select: "title",
//                     }
//                 ]
//             );


//             let stockInData = await RetailerStock.find({
//                 $and:[
//                    // {retailerId:retailerId},
//                     {proId:proId},
//                     {stock_type:"stock_in"}
//                 ]
//             }).populate(
//                     [
//                         {
//                             path: "proId", 
//                             select: "proTitle price",
//                         },
//                         {   
//                             path: "catId", 
//                             select: "title",
//                         },
//                         {
//                             path: "subcatId", 
//                             select: "title",
//                         }
//                     ]
//                 );

//                 // console.log("stockInData",stockInData[0]?.proId.proTitle);
//                 var catId = stockInData[0]?.catId?._id;
//                 let getCat = await Category.findOne({_id:catId});
//                 var catTitle = getCat?.title;

//                  var subcatId =  stockInData[0]?.subcatId?._id
//                  let getSubcat = await Category.findOne({_id:subcatId});
//                  var subcatTitle = getSubcat?.title;

    
//                //console.log("stockInData", stockInData[0]?.catId?._id);

//             let stockOutData = await RetailerStock.find({$and:[//{retailerId:retailerId},
//                 {proId:proId},
//                 {stock_type:"stock_out"}]});

//             let stockinitialData = await RetailerStock.find({$and:[//{retailerId:retailerId},
//                 {proId:proId},
//                 {stock_type:"initial"}]}).populate([
//                     {
//                         path: "proId", 
//                         select: "proTitle price",
//                     },
//                     {   
//                         path: "catId", 
//                         select: "title",
//                     },
//                     {
//                         path: "subcatId", 
//                         select: "title",
//                     }
//                 ]);

//            //console.log("stockinitialData",stockinitialData);


//             stockinitialData = JSON.parse(JSON.stringify(stockinitialData));
//             let initial = 0;
//             for(var i in stockinitialData){
//                 initial += stockinitialData[i].quantity;
//             }
//             // console.log("initial",initial);

//             stockInData = JSON.parse(JSON.stringify(stockInData));
//             let sumIn = 0;
//             for(var i in stockInData){
//                 sumIn += stockInData[i].quantity;
//             }

//             // console.log("sumIn",sumIn);

//             stockOutData = JSON.parse(JSON.stringify(stockOutData));
//             let sumOUT = 0;
//             for(var i in stockOutData){
//                 sumOUT += stockOutData[i].quantity;
//             }

            
//             let balance = initial+(sumIn - sumOUT);

//             const stockDetails =  {
//                 "proId": result[0]?.proId?._id,
//                 "proTitle":result[0]?.proId.proTitle,
//                 "catId":result[0]?.catId?._id,
//                 "catTitle":result[0]?.catId?.title,
//                 "subcatId":result[0]?.subcatId?._id,
//                 "subcatTitle":result[0]?.subcatId?.title,
//                 //"quantity":result[0]?.quantity,
//                 "balance":balance,
//                 "price":result[0]?.proId.price
//             }
//             productStockData.push(stockDetails);
//         }

//         console.log("productStockData",productStockData);
        

//         const resData = stockData.filter(e => {
//             return e.proId != null;
//         })
                
//         message = {
//             error: false,
//             message: "My All Stocks",
//             data: productStockData               
            
//         }

//         return res.status(200).send(message);
//     }catch(err){
//         message = {
//             error: true,
//             message: "Operation failed",
//             data: err.toString()
//         }

//         return res.status(200).send(message);
//     }
// });

/**
 * Update stock
 */

StockRoute.get("/detail/:proId", isAuthenticate, async(req,res) => {
    try{
        var proId = req.params.proId;
        let stockData = await Stock.find({proId:proId}).populate(
            [
                { path: "proId", select: "title" }
            ]
        ).sort({_id:-1});
        

        message = {
            error: false,
            message: "Product stock logs for admin",
            data: stockData
        }

        return res.status(200).send(message);


    }catch(err){
            message = {
				error: true,
				message: "Operation failed",
                data: String(err)
			};
      
            return res.status(400).send(message);
        }
});


StockRoute.delete("/delete/:id", async (req, res) => {
    try {
        const result = await Stock.findByIdAndUpdate(
            req.params.id,
            { $set: { isDelete: true } },
            { new: true, strict: false }
        );
        return res.status(200).json({ message: "Deleted", status: 200, result });
    } catch (err) {
        message = {
            error: true,
            message: "Operation Failed!",
            data: err,
        };
        res.status(200).send(message);
    }
});




module.exports = StockRoute;