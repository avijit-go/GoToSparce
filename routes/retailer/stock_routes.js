/** @format */

require("dotenv").config();
const express = require("express");
const StockRoute = express.Router();
const isAuthenticate = require("../../middleware/authcheck");
const User = require("../../helper/getUserToken");
const RetailerStock = require("../../models/retailerstock");
const Category = require("../../models/category");
const RetailerProduct = require("../../models/retailerproduct");

/*
 ** List Stock
 */
StockRoute.get("/list", isAuthenticate, async (req, res) => {
  try {
    let headers = req.headers;
    let token = headers.authorization.split(" ")[1];
    let user = User(token);

    if (!user.data.register_with || user.data.register_with != "wholesaler") {
      message = {
        error: true,
        message: "You are not logged in as Retailer",
        data: {},
      };
      return res.status(200).send(message);
    }
    const retailerId = user.data._id;
    let orderDate = new Date();
    console.log(
      "You logged in as Retailer Id: <" +
        retailerId +
        "> , email: <" +
        user.data.email +
        ">"
    );
    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
    let stockData = [];

    console.log(req.query);

    var searchText = req.query.search;
    var catId = req.query.catId;
    var subcatId = req.query.subcatId;
    //console.log(searchText)
    var concatAnd = (subconcatAnd = searchAnd = {});
    if (catId) {
      concatAnd = { catId: catId };
    }
    if (subcatId) {
      subconcatAnd = { subcatId: subcatId };
    }
    if (searchText) {
      searchAnd = { proTitle: { $regex: searchText, $options: "i" } };
    }

    //console.log(subconcatAnd);

    stockData = await RetailerStock.find({
      retailerId: retailerId,
      $and: [concatAnd, subconcatAnd, searchAnd, { isDelete: { $ne: true } }],
    })
      .populate([
        {
          path: "proId",
          select: "proTitle price",
          // populate:{
          //     path:"proId",
          //     select:"title"
          // },
          // match: { $or: [
          //     searchAnd
          // ]}
        },
        {
          path: "catId",
          select: "title",
        },
        {
          path: "subcatId",
          select: "title",
        },
      ])
      .distinct("proId");

    stockData = JSON.parse(JSON.stringify(stockData));

    //  console.log("stockData",stockData);

    let productStockData = [];

    for (var i in stockData) {
      var proId = stockData[i];

      let result = await RetailerStock.find({
        $and: [{ retailerId: retailerId }, { proId: proId }],
      }).populate([
        {
          path: "proId",
          select: "proTitle price",
        },
        {
          path: "catId",
          select: "title",
        },
        {
          path: "subcatId",
          select: "title",
        },
      ]);

      let stockInData = await RetailerStock.find({
        $and: [
          { retailerId: retailerId },
          { proId: proId },
          { stock_type: "stock_in" },
        ],
      }).populate([
        {
          path: "proId",
          select: "proTitle price",
        },
        {
          path: "catId",
          select: "title",
        },
        {
          path: "subcatId",
          select: "title",
        },
      ]);

      // console.log("stockInData",stockInData[0]?.proId.proTitle);
      var catId = stockInData[0]?.catId?._id;
      let getCat = await Category.findOne({ _id: catId });
      var catTitle = getCat?.title;

      var subcatId = stockInData[0]?.subcatId?._id;
      let getSubcat = await Category.findOne({ _id: subcatId });
      var subcatTitle = getSubcat?.title;

      //console.log("stockInData", stockInData[0]?.catId?._id);

      let stockOutData = await RetailerStock.find({
        $and: [
          { retailerId: retailerId },
          { proId: proId },
          { stock_type: "stock_out" },
        ],
      });

      let stockinitialData = await RetailerStock.find({
        $and: [
          { retailerId: retailerId },
          { proId: proId },
          { stock_type: "initial" },
        ],
      }).populate([
        {
          path: "proId",
          select: "proTitle price",
        },
        {
          path: "catId",
          select: "title",
        },
        {
          path: "subcatId",
          select: "title",
        },
      ]);

      //   console.log("stockinitialData",stockinitialData);

      stockinitialData = JSON.parse(JSON.stringify(stockinitialData));
      let initial = 0;
      for (var i in stockinitialData) {
        initial += stockinitialData[i].quantity;
      }
      // console.log("initial",initial);

      stockInData = JSON.parse(JSON.stringify(stockInData));
      let sumIn = 0;
      for (var i in stockInData) {
        sumIn += stockInData[i].quantity;
      }

      // console.log("sumIn",sumIn);

      stockOutData = JSON.parse(JSON.stringify(stockOutData));
      let sumOUT = 0;
      for (var i in stockOutData) {
        sumOUT += stockOutData[i].quantity;
      }

      let balance = initial + (sumIn - sumOUT);

      const stockDetails = {
        proId: result[0]?.proId?._id,
        proTitle: result[0]?.proId.proTitle,
        catId: result[0]?.catId?._id,
        catTitle: result[0]?.catId?.title,
        subcatId: result[0]?.subcatId?._id,
        subcatTitle: result[0]?.subcatId?.title,
        //"quantity":result[0]?.quantity,
        balance: balance,
        price: result[0]?.proId.price,
      };
      productStockData.push(stockDetails);
    }

    // console.log("productStockData",productStockData);

    const resData = stockData.filter((e) => {
      return e.proId != null;
    });

    message = {
      error: false,
      message: "My All Stocks",
      data: productStockData,
    };

    return res.status(200).send(message);
  } catch (err) {
    message = {
      error: true,
      message: "Operation failed",
      data: err.toString(),
    };

    return res.status(200).send(message);
  }
});

// StockRoute.get("/data",isAuthenticate,async(req,res)=>{
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
//         const retailerId = user.data._id;

//         const stockData = await RetailerStock.find({retailerId:retailerId}).sort({_id:-1})

//         message = {
//             error:false,
//             message:"list of stock",
//             data:stockData,
//         }
//         return res.status(200).send(message)

//     }catch(err){
//         message = {
//             error:true,
//             message:"Operation Failed",
//             data:err,
//         }
//     }
// })
/*
 ** Product wise stock log
 */
StockRoute.get("/:proId", isAuthenticate, async (req, res) => {
  try {
    let headers = req.headers;
    let token = headers.authorization.split(" ")[1];
    let user = User(token);

    if (!user.data.register_with || user.data.register_with != "wholesaler") {
      message = {
        error: true,
        message: "You are not logged in as Retailer",
        data: {},
      };
      return res.status(200).send(message);
    }
    const retailerId = user.data._id;
    let orderDate = new Date();
    console.log(
      "You logged in as Retailer Id: <" +
        retailerId +
        "> , email: <" +
        user.data.email +
        ">"
    );
    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */

    var proId = req.params.proId;
    let stockData = await RetailerStock.find({
      retailerId: retailerId,
      proId: proId,
    })
      .populate([
        { path: "proId", select: "proTitle" },
        { path: "catId", select: "title" },
        { path: "subcatId", select: "title" },
        { path: "customerorderId", select: "orderNo" },
        { path: "supplierorderId", select: "orderNo" },
      ])
      .sort({ _id: -1 });

    message = {
      error: false,
      message: "Product stock logs",
      data: stockData,
    };

    return res.status(200).send(message);
  } catch (err) {
    if (err.name === "CastError") {
      let errors =
        "Unknown value '" +
        err.value +
        "' " +
        err.kind +
        " as product " +
        err.path +
        " to map";

      message = {
        error: true,
        message: "Operation failed",
        data: errors,
      };

      return res.status(400).send(message);
    }
    return res.status(500).send(err);
  }
});

StockRoute.delete("/delete/:stockId", async (req, res) => {
  try {
    // const result = await RetailerStock.deleteOne({ _id: req.params.stockId });
    // if (result.deletedCount == 1) {
    // 	message = {
    // 		error: false,
    // 		message: "Stock deleted successfully!",
    // 	};
    // 	res.status(200).send(message);
    // } else {
    // 	message = {
    // 		error: true,
    // 		message: "Operation failed!",
    // 	};
    // 	res.status(200).send(message);
    // }
    const result = await RetailerStock.findByIdAndUpdate(
      req.params.stockId,
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
