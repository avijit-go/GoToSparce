/** @format */

require("dotenv").config();
const express = require("express");
const RetailerProtfolio = require("../../models/retailerportfolio");
const RetailerProtfolioRoute = express.Router();
const isAuthenticate = require("../../middleware/authcheck");
const User = require("../../helper/getUserToken");
const Product = require("../../models/product");
const AdminNotification = require("../../models/adminNotification");
const ProductVechicle = require("../../models/product_vehicles");

/**
 * product search
 */

//  RetailerProtfolioRoute.post("/search-save",isAuthenticate, async(req,res) => {
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
//         let retailerId = user.data._id;
//         /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */

//         let searchText = req.query.search;
//         let saveText = req.query.save;

//         if(searchText){
//             let findprodMaster = await Product.findOne({$and:[{status:true},{partNo:searchText}]});

//             if(findprodMaster){
//                 message = {
//                     error: false,
//                     message: "Available Product",
//                     data:findprodMaster
//                 }
//                 return res.status(200).send(message)
//             } else {

//                 let checkExistedItems = await RetailerProtfolio.findOne({$and:[{retailerId:retailerId},{partNo:searchText}]});
//                 if(checkExistedItems){
//                     message = {
//                         error: true,
//                         message: "Already you requested the item",
//                         data:checkExistedItems
//                     }
//                     return res.status(200).send(message)

//                 } else {

//                     if(saveText && saveText == 'save'){
//                         let portfoliData = {
//                             'retailerId' : retailerId,
//                             'partNo': searchText,
//                             'title':req.body.title,
//                             'makeId':req.body.makeId,
//                             'modelId':req.body.modelId,
//                             'brandId':req.body.brandId
//                         }
//                         let retailerNotification =  await RetailerProtfolio.create(portfoliData);
//                         let retailerNotificationId = retailerNotification._id;
//                         let adminNotificationData = {
//                             'retailerId' : retailerId,
//                             'retailerNotificationId': retailerNotificationId,
//                             'message':   "Unavailable item for retailer"
//                         }
//                         await AdminNotification.create(adminNotificationData);
//                     }

//                     let listRequestedItems = await RetailerProtfolio.find({retailerId:retailerId}).populate([
//                         {
//                             path:"makeId",
//                             select:"title"
//                         },
//                         {
//                             path:"modelId",
//                             select:"title"
//                         },
//                         {
//                             path:"brandId",
//                             select:"title"
//                         }
//                     ]).sort({_id:-1});

//                     message = {
//                         error: false,
//                         message: "Your all saved items",
//                         data:listRequestedItems
//                     }
//                     return res.status(200).send(message)
//                 }

//             }
//         } else {
//             let listRequestedItems = await RetailerProtfolio.find({retailerId:retailerId}).populate([
//                 {
//                     path:"makeId",
//                     select:"title"
//                 },
//                 {
//                     path:"modelId",
//                     select:"title"
//                 },
//                 {
//                     path:"brandId",
//                     select:"title"
//                 }
//             ]).sort({_id:-1});

//             message = {
//                 error: false,
//                 message: "Your all saved items",
//                 data:listRequestedItems
//             }
//             return res.status(200).send(message)
//         }

//     }catch(err){
//         message = {
//             error: true,
//             message: "Operation failed",
//             data: err.toString()
//         }
//         return res.status(200).send(message)
//     }
// });

RetailerProtfolioRoute.post("/check", isAuthenticate, async (req, res) => {
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
    let retailerId = user.data._id;
    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
    let partNo = req.query.partNo;
    let makeId = req.query.makeId;
    let modelId = req.query.modelId;

    let isProdExist = true;
    let protfolioList = await RetailerProtfolio.find({
      $and: [
        { retailerId: retailerId },
        { partNo: partNo },
        { makeId: makeId },
        { modelId: modelId },
      ],
    });

    if (protfolioList.length > 0) {
      message = {
        error: true,
        message: "Product already exists in portfolio list",
        data: {},
      };
      return res.status(200).send(message);
    }

    let checkProd = await Product.findOne({ partNo: partNo });

    if (checkProd) {
      let checkProdVehMake = await ProductVechicle.find({
        $and: [{ prodId: checkProd._id }, { makeId: makeId }],
      });
      if (checkProdVehMake.length > 0) {
        let checkProdVehModel = await ProductVechicle.find({
          $and: [
            { prodId: checkProd._id },
            { makeId: makeId },
            { modelId: modelId },
          ],
        });
        if (checkProdVehModel.length > 0) {
          message = {
            error: true,
            message: "Product exists with same make model",
            data: {},
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

    if (!isProdExist) {
      let portfoliData = {
        retailerId: retailerId,
        partNo: partNo,
        title: req.body.title,
        makeId: makeId,
        modelId: modelId,
      };
      let result = await RetailerProtfolio.create(portfoliData);
      let portfolioList = await RetailerProtfolio.find({})
        .populate([
          {
            path: "makeId",
            select: "title",
          },
          {
            path: "modelId",
            select: "title",
          },
        ])
        .sort({ _id: -1 });

      let retailerNotificationId = result._id;
      let adminNotificationData = {
        retailerId: retailerId,
        retailerNotificationId: retailerNotificationId,
        message: "Unavailable item for retailer",
      };
      await AdminNotification.create(adminNotificationData);
      message = {
        error: false,
        message: " Your requirement has been sent successfully ",
        data: portfolioList,
      };
      return res.status(200).send(message);
    }
  } catch (err) {
    message = {
      error: true,
      message: "Operation Failed",
      data: err.toString(),
    };
    return res.status(200).send(message);
  }
});

RetailerProtfolioRoute.get("/list", async (req, res) => {
  try {
    let portfoliData = await RetailerProtfolio.find({ isDelete: { $ne: true } })
      .populate([
        {
          path: "makeId",
          select: "title",
        },
        {
          path: "modelId",
          select: "title",
        },
      ])
      .sort({ _id: -1 });

    message = {
      error: false,
      message: "List of portfolio",
      data: portfoliData,
    };
    res.status(200).send(message);
  } catch (err) {
    message = {
      error: true,
      message: "Operation Failed",
      data: err.toString(),
    };
    res.status(200).send(message);
  }
});

// RetailerProtfolioRoute.delete("/delete/:portfolioId",isAuthenticate, async (req, res) => {
//     try {
//         const result = await RetailerProtfolio.deleteOne({
//             _id: req.params.portfolioId
//         });
//         if (result.deletedCount == 1) {
//             message = {
//                 error: false,
//                 message: "RetailerProtfolio deleted successfully!",
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

module.exports = RetailerProtfolioRoute;
