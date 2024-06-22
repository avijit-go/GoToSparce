/** @format */

require("dotenv").config();
const express = require("express");
const Review = require("../models/review");
const ReviewRoute = express.Router();
const isAuthenticate = require("../middleware/authcheck"); /* For User (wholesaler or vehicle owener) */
const UserId = require("../helper/getUserToken");

/**
 * This method is to create review
 */

ReviewRoute.post("/create", isAuthenticate, async (req, res) => {
  try {
    var headers = req.headers;
    var token = headers.authorization.split(" ")[1];

    var user = UserId(token);
    var userId = user.data._id;
    var userType = user.data.register_with;

    console.log(user);
    console.log(userId);
    console.log(userType);

    req.body.user_id = userId;
    req.body.user_type = userType;
    const ReviewData = new Review(req.body);
    const result = await ReviewData.save();
    message = {
      error: false,
      message: "Review created successfully",
      data: result,
    };
    return res.status(200).send(message);
  } catch (err) {
    message = {
      error: true,
      message: "Operation Failed",
      data: err,
    };
    return res.status(200).send(message);
  }
});

/**
 * This method is to list all review
 */

ReviewRoute.get("/list", isAuthenticate, async (req, res) => {
  try {
    var headers = req.headers;
    var token = headers.authorization.split(" ")[1];

    var user = UserId(token);
    var userId = user.data._id;
    var userType = user.data.register_with;

    console.log(user);
    console.log(userId);
    console.log(userType);

    let ReviewData = await Review.find({
      $and: [
        { user_id: userId },
        { user_type: userType },
        { isDelete: { $ne: true } },
      ],
    })
      .populate([
        {
          path: "prodId",
          select: "title description portNo",
        },
        {
          path: "user_id",
          select: "fname lname",
        },
      ])
      .sort({ _id: -1 });
    message = {
      error: false,
      message: "All Review list",
      data: ReviewData,
    };
    return res.status(200).send(message);
  } catch (err) {
    message = {
      error: true,
      message: "Operation Failed",
      data: err.toString(),
    };
    return res.status(200).send(message);
  }
});

/**
 * This method is to find all review by productId
 * @param str productId
 */

//  ReviewRoute.get("/list-by-prodId/:productId",isAuthenticate, async(req,res)=>{
//     try{
//         let ReviewData = await Review.find({prodId:req.params.productId}).populate([
//             {
//                 path:"prodId",
//                 select:"title description portNo"
//             },
//             {
//                 path:"user_id",
//                 select:"fname lname"
//             }
//         ]).sort({_id:-1});

//         message = {
//             error: false,
//             message: "Review list",
//             data: ReviewData
//         }
//         return res.status(200).send(message);
//     }catch(err){
//         message = {
//             error: true,
//             message: "Operation Failed",
//             data:err
//         }
//     }

//  });

/**
 * This method is to delete review
 * @param str id
 */

ReviewRoute.delete("/delete/:id", async (req, res) => {
  try {
    // var headers = req.headers;
    // var token = headers.authorization.split(' ')[1];

    // var user = UserId(token)
    // var userId = user.data._id;
    // let reviewData = await Review.findOne({_id:req.params.id});

    // if(reviewData != null && reviewData.user_id != userId){
    //     message = {
    //         error: true,
    //         message: "This review is not yours",
    //     };
    //     res.status(200).send(message);
    // }

    // const result = await Review.deleteOne({
    //     _id: req.params.reviewId
    // });
    // if (result.deletedCount == 1) {
    //     message = {
    //         error: false,
    //         message: "Review deleted successfully!",
    //         data: result
    //     };
    //     res.status(200).send(message);
    // } else {
    //     message = {
    //         error: true,
    //         message: "Operation failed!",
    //     };
    //     res.status(200).send(message);
    // }
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      { $set: { isDelete: true } },
      { new: true, strict: false }
    );
    return res
      .status(200)
      .json({
        message: "Deleted review",
        status: 200,
        wishlist: updatedReview,
      });
  } catch (err) {
    message = {
      error: true,
      message: "Operation Failed!",
      data: err,
    };
    res.status(200).send(message);
  }
});

module.exports = ReviewRoute;
