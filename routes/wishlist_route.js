/** @format */

require("dotenv").config();
const express = require("express");
const Wishlist = require("../models/wishlist");
const WishlistRoute = express.Router();
const isAuthenticate = require("../middleware/authcheck"); /* For User (wholesaler or vehicle owener) */
const UserId = require("../helper/getUserToken");

/**
 * This method is used to create wishlist
 */

WishlistRoute.post("/create", isAuthenticate, async (req, res) => {
  try {
    var headers = req.headers;
    var token = headers.authorization.split(" ")[1];

    var user = UserId(token);
    var userId = user.data._id;
    var userType = user.data.register_with;

    console.log(user);
    console.log(userId);
    console.log(userType);

    // const WishlistData = new Wishlist(req.body)
    // if(req.body.ip_address == null || req.body.deviceId == null){
    //     message = {
    //         error: true,
    //         message:"user not found!"
    //     };
    //     return res.status(200).send(message);
    // }

    const existWishlistProduct = await Wishlist.findOne({
      $and: [{ user_id: userId }, { proId: req.body.proId }],
    });

    if (existWishlistProduct) {
      await Wishlist.deleteOne({ user_id: userId, proId: req.body.proId });
      message = {
        error: false,
        message: "Product Removed from your wishlist",
        data: {},
      };
      return res.status(200).send(message);
    } else {
      req.body.user_id = userId;
      req.body.user_type = userType;
      await Wishlist.create(req.body);
      message = {
        error: false,
        message: "Product Added to your wishlist",
        data: {},
      };
      return res.status(200).send(message);
    }
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
 * This method is used to find all wishlist  data
 */

WishlistRoute.get("/list", isAuthenticate, async (req, res) => {
  try {
    var headers = req.headers;
    var token = headers.authorization.split(" ")[1];

    var user = UserId(token);
    var userId = user.data._id;
    var userType = user.data.register_with;

    console.log(user);
    console.log(userId);
    console.log(userType);

    let WishlistData = await Wishlist.find({
      $and: [{ user_id: userId }, { user_type: userType }],
    })
      .populate([
        {
          path: "proId",
          populate: [
            {
              path: "catId",
              select: "title",
            },
            {
              path: "subcat0Id",
              select: "title",
            },
            {
              path: "subcat1Id",
              select: "title",
            },
          ],
        },
      ])
      .sort({ _id: -1 });

    message = {
      error: false,
      message: "All Wishlist data list",
      data: WishlistData,
    };
    return res.status(200).send(message);
  } catch (err) {
    message = {
      error: true,
      message: "operation failed!",
      data: err,
    };
    return res.status(200).send(message);
  }
});

/**
 * This method is used to detail wishlist data
 *   @param str wishlistId
 */

//   WishlistRoute.get("/detail/:wishlistId",isAuthenticate, async(req,res)=>{
//     try{
//         let WishlistData = await Wishlist.find({_id:req.params.wishlistId}).populate([
//             {
//                 path:"proId",
//                 select:"title description portNo"
//             },
//             {
//                 path:"user_id",
//                 select:"fname lname"
//             }
//         ]).sort({_id:-1});

//         message = {
//             error: false,
//             message: "Detail Wishlist data list",
//             data: WishlistData
//         };
//         return res.status(200).send(message);

//     }catch(err){
//         message = {
//             error: true,
//             message: "operation failed!",
//             data:err,
//         }
//         return res.status(200).send(message);
//     }

//  });

/**
 * This method is used to update wishlist data
 *   @param str wishlistId
 */

//   WishlistRoute.patch("/update/:wishlistId",isAuthenticate, async (req, res) => {
// 	try {
// 		const result = await Wishlist.findOneAndUpdate({ _id: req.params.wishlistId }, req.body, {new: true});
// 		if (result) {
// 			message = {
// 				error: false,
// 				message: "Wishlist updated successfully!",
// 				result
// 			};
// 			res.status(200).send(message);
// 		} else {
// 			message = {
// 				error: true,
// 				message: "Wishlist not updated",
// 			};
// 			res.status(200).send(message);
// 		}
// 	} catch (err) {
// 		message = {
// 			error: true,
// 			message: "Operation Failed!",
// 			data: err,
// 		};
// 		res.status(200).send(message);
// 	}
// });

/**
 * This method is used to delete wishlist data
 *   @param str wishlistId
 */

WishlistRoute.delete("/delete/:wishlistId", async (req, res) => {
  try {
    // const result = await Wishlist.deleteOne({
    //     _id: req.params.wishlistId
    // });
    // if (result.deletedCount == 1) {
    //     message = {
    //         error: false,
    //         message: "Wishlist deleted successfully!",
    //     };
    //     res.status(200).send(message);
    // } else {
    //     message = {
    //         error: true,
    //         message: "Operation failed!",
    //     };
    //     res.status(200).send(message);
    // }
    const updatedishlist = await Wishlist.findByIdAndUpdate(
      req.params.wishlistId,
      { $set: { isDelete: true } },
      { new: true, strict: false }
    );
    return res
      .status(200)
      .json({ message: "Deleted", status: 200, wishlist: updatedishlist });
  } catch (err) {
    message = {
      error: true,
      message: "Operation Failed!",
      data: err,
    };
    res.status(200).send(message);
  }
});

module.exports = WishlistRoute;
