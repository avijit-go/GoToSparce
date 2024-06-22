/** @format */

require("dotenv").config();
const express = require("express");
const Address = require("../models/address");
const AddressRoute = express.Router();
const isAuthenticate = require("../middleware/authcheck"); /* For User (wholesaler or vehicle owener) */
const UserId = require("../helper/getUserToken");
const e = require("express");

/**
 * This method is used to create address
 */
AddressRoute.post("/create", isAuthenticate, async (req, res) => {
  try {
    var headers = req.headers;
    var token = headers.authorization.split(" ")[1];

    var user = UserId(token);
    var userId = user.data._id;
    var userType = user.data.register_with;

    req.body.user_id = userId;
    req.body.user_type = userType;

    const AddressData = new Address(req.body);
    const result = await AddressData.save();

    message = {
      error: false,
      message: "Address created successfully",
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
AddressRoute.get("/list", isAuthenticate, async (req, res) => {
  try {
    var headers = req.headers;
    var token = headers.authorization.split(" ")[1];

    var user = UserId(token);
    var userId = user.data._id;
    var userType = user.data.register_with;

    let AddressData = await Address.find({
      $and: [
        { user_id: userId },
        { user_type: userType },
        { isDelete: { $ne: true } },
      ],
    });
    message = {
      error: false,
      message: "List of Address",
      data: AddressData,
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
 * This method is to detail address
 * * @param str addressId
 */

AddressRoute.get("/detail/:addressId", isAuthenticate, async (req, res) => {
  try {
    let addressData = await Address.findOne({ _id: req.params.addressId });

    message = {
      error: false,
      message: "Address Details",
      data: addressData,
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
 * This method is to update address
 * * @param str addressId
 */
AddressRoute.patch("/update/:addressId", isAuthenticate, async (req, res) => {
  try {
    const result = await Address.findOneAndUpdate(
      { _id: req.params.addressId },
      req.body,
      { new: true }
    );
    if (result) {
      message = {
        error: false,
        message: "Address updated successfully",
        data: result,
      };
      return res.status(200).send(message);
    } else {
      message = {
        error: true,
        message: "Address not updated",
      };
      res.status(200).send(message);
    }
  } catch (err) {
    message = {
      error: true,
      message: "Operation Failed",
      data: err,
    };
    res.status(200).send(message);
  }
});
/**
 * This method is to set address as primary
 * * @param str addressId
 */
AddressRoute.get(
  "/set-address/:userId/:addressId",
  isAuthenticate,
  async (req, res) => {
    try {
      // var userId;
      var headers = req.headers;
      var token = headers.authorization.split(" ")[1];

      var user = UserId(token);
      var userId = user.data._id;

      // let data = await Address.find({user_id:userId});

      // if(data.length == 0){
      //     message = {
      //         error: true,
      //         message:"This is not your address",
      //         data:{}
      //     }
      //     return res.status(200).send(message);
      // }

      const result = await Address.findOne({ _id: req.params.addressId });

      // console.log("addressData",addressData);

      //  let statusdata = result?.is_primary

      console.log(result?.is_primary);

      var addressData;

      if (result?.is_primary == true) {
        addressData = await Address.findOneAndUpdate(
          { _id: req.params.addressId },
          { is_primary: false },
          { new: true }
        );
      } else {
        addressData = await Address.findOneAndUpdate(
          { _id: req.params.addressId },
          { is_primary: true },
          { new: true }
        );
      }

      let allAddress = await Address.find({}).sort({ _id: -1 });
      message = {
        error: false,
        message: "Primary Address update successfully",
        data: allAddress,
      };
      return res.status(200).send(message);
    } catch (err) {
      message = {
        error: true,
        message: "Operation Failed",
        data: err.toString(),
      };
      res.status(200).send(message);
    }
  }
);

/**
 * This Method is used to delete address
 */

AddressRoute.delete("/delete/:addressId", async (req, res) => {
  try {
    // const result = await Address.deleteOne({ _id: req.params.addressId });
    // if (result.deletedCount == 1) {
    // 	message = {
    // 		error: false,
    // 		message: "Address deleted successfully!",
    // 	};
    // 	res.status(200).send(message);
    // } else {
    // 	message = {
    // 		error: true,
    // 		message: "Operation failed!",
    // 	};
    // 	res.status(200).send(message);
    // }
    const result = await Address.findByIdAndUpdate(
      req.params.addressId,
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

module.exports = AddressRoute;
