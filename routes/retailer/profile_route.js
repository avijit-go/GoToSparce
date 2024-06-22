/** @format */

require("dotenv").config();
const express = require("express");
const ProfileRoute = express.Router();
const isAuthenticate = require("../../middleware/authcheck");
const User = require("../../helper/getUserToken");
const RetailerProfile = require("../../models/retailerprofile");
const RetailerShippingAddress = require("../../models/retailershippingaddress");

/*
 ** Save Profile ( Create / Update )
 */
ProfileRoute.post("/save", isAuthenticate, async (req, res) => {
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
    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
    const retailerId = user.data._id;
    req.body.retailerId = retailerId;
    // console.log(req.body);
    // return res.send(req.body);
    let existProfile = await RetailerProfile.findOne({
      retailerId: retailerId,
    });

    if (existProfile) {
      let resProfile = await RetailerProfile.findOneAndUpdate(
        { retailerId: retailerId },
        req.body,
        { new: true }
      );

      message = {
        error: false,
        message: "Profile saved successfully",
        data: resProfile,
      };

      return res.status(200).send(message);
    } else {
      let resProfile = await RetailerProfile.create(req.body);
      message = {
        error: false,
        message: "Profile saved successfully",
        data: resProfile,
      };

      return res.status(200).send(message);
    }
  } catch (err) {
    let errors = {};
    if (err.name === "ValidationError") {
      Object.keys(err.errors).forEach((key) => {
        errors[key] = err.errors[key].message;
      });

      message = {
        error: true,
        message: "Operation failed",
        data: errors,
      };

      return res.status(400).send(message);
    }
    return res.status(500).send("Something went wrong");
  }
});
/*
 ** View My Profile
 */
ProfileRoute.get("/view", isAuthenticate, async (req, res) => {
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
    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
    const retailerId = user.data._id;

    let profile = await RetailerProfile.findOne({
      $and: [{ retailerId: retailerId }, { isDelete: { $ne: true } }],
    }); //
    message = {
      error: false,
      message: "My profile",
      data: profile,
    };
    return res.status(200).send(message);
  } catch (err) {
    message = {
      error: true,
      message: "Operation failed",
      data: err,
    };
    return res.status(200).send(message);
  }
});
/*
 ** Add Shipping Address
 */
ProfileRoute.post("/add-shipping-address", isAuthenticate, async (req, res) => {
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
    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
    const retailerId = user.data._id;
    req.body.retailerId = retailerId;

    /*  Check exist same address retailer */
    let existSameAddress = await RetailerShippingAddress.findOne({
      retailerId: retailerId,
      $and: [
        { address: req.body.address },
        { lat: req.body.lat },
        { long: req.body.long },
      ],
    });

    if (existSameAddress) {
      message = {
        error: true,
        message: "Same address exist ",
        data: {},
      };
      return res.status(200).send(message);
    }

    let result = await RetailerShippingAddress.create(req.body);

    message = {
      error: false,
      message: "Shipping address created successfully",
      data: result,
    };
    return res.status(200).send(message);
  } catch (err) {
    let errors = {};
    if (err.name === "ValidationError") {
      Object.keys(err.errors).forEach((key) => {
        errors[key] = err.errors[key].message;
      });

      message = {
        error: true,
        message: "Operation failed",
        data: errors,
      };

      return res.status(400).send(message);
    }
    return res.status(500).send("Something went wrong");
  }
});
/*
 ** Edit Shipping Address
 */
ProfileRoute.put(
  "/edit-shipping-address/:id",
  isAuthenticate,
  async (req, res) => {
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
      /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
      const retailerId = user.data._id;
      req.body.retailerId = retailerId;

      /* Check address */
      let addressData = await RetailerShippingAddress.findOne({
        _id: req.params.id,
      });
      if (addressData.retailerId != retailerId) {
        message = {
          error: true,
          message: "This shipping address is not your",
          data: {},
        };
        return res.status(200).send(message);
      }

      /* Check same address */
      let sameAddressData = await RetailerShippingAddress.find({
        _id: { $ne: req.params.id },
        retailerId: retailerId,
        $and: [
          { address: req.body.address },
          { lat: req.body.lat },
          { long: req.body.long },
        ],
      });

      if (sameAddressData.length > 0) {
        message = {
          error: true,
          message: "Already same address exists",
          data: {},
        };
        return res.status(200).send(message);
      }

      /* Update */

      let result = await RetailerShippingAddress.findOneAndUpdate(
        { _id: req.params.id },
        req.body,
        { new: true }
      );

      message = {
        error: false,
        message: "Shipping address updated successfully",
        data: result,
      };

      return res.status(200).send(message);
    } catch (err) {
      let errors = {};
      if (err.name === "ValidationError") {
        Object.keys(err.errors).forEach((key) => {
          errors[key] = err.errors[key].message;
        });

        message = {
          error: true,
          message: "Operation failed",
          data: errors,
        };

        return res.status(400).send(message);
      }
      if (err.name === "CastError") {
        let errors =
          "Unknown value '" + err.value + "' " + err.kind + " to map";

        message = {
          error: true,
          message: "Operation failed",
          data: errors,
        };

        return res.status(400).send(message);
      }
      return res.status(500).send(err.toString());
    }
  }
);
/*
 ** List Shipping Address
 */
ProfileRoute.get("/list-shipping-address", isAuthenticate, async (req, res) => {
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
    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
    const retailerId = user.data._id;
    req.body.retailerId = retailerId;

    let result = await RetailerShippingAddress.find({
      retailerId: retailerId,
    }).sort({ _id: -1 });

    message = {
      error: false,
      message: "All Shipping Address",
      data: result,
    };

    return res.status(200).send(message);
  } catch (err) {
    message = {
      error: true,
      message: "Operation failed",
      data: err,
    };

    return res.status(200).send(message);
  }
});

/*
 ** Detail Shipping Address
 */
ProfileRoute.get(
  "/detail-shipping-address/:shippingaddressId",
  isAuthenticate,
  async (req, res) => {
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
      /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
      const retailerId = user.data._id;
      req.body.retailerId = retailerId;

      let result = await RetailerShippingAddress.findOne({
        _id: req.params.shippingaddressId,
      }).sort({ _id: -1 });

      message = {
        error: false,
        message: "All Shipping Address",
        data: result,
      };

      return res.status(200).send(message);
    } catch (err) {
      message = {
        error: true,
        message: "Operation failed",
        data: err,
      };

      return res.status(200).send(message);
    }
  }
);

/*
 ** Delete Shipping Address
 */
ProfileRoute.delete("/delete-shipping-address/:id", async (req, res) => {
  try {
    // let headers = req.headers;
    // let token = headers.authorization.split(' ')[1];
    // let user = User(token);

    // if(!user.data.register_with || user.data.register_with != 'wholesaler'){
    //     message = {
    //         error: true,
    //         message: "You are not logged in as Retailer",
    //         data: {}
    //     }
    //     return res.status(200).send(message)
    // }
    // /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
    // const retailerId = user.data._id;

    // /* Check address */
    // let addressData = await RetailerShippingAddress.findOne({_id:req.params.id});
    // if(addressData.retailerId != retailerId){
    //     message = {
    //         error: true,
    //         message: "This shipping address is not your",
    //         data: {}
    //     }
    //     return res.status(200).send(message)
    // }

    // /* Delete Address */
    // let deleteAddress = await RetailerShippingAddress.deleteOne({_id:req.params.id});

    // if(deleteAddress.deletedCount == 1){
    //     message = {
    // 		error: false,
    // 		message: "Address Deleted Successfully",
    //         data: {}
    // 	};

    //     return res.status(200).send(message);
    // } else {
    //     message = {
    // 		error: true,
    // 		message: "No address found",
    //         data: {}
    // 	};

    //     return res.status(400).send(message);
    // }
    const result = await RetailerShippingAddress.findByIdAndUpdate(
      req.params.id,
      { $set: { isDelete: true } },
      { new: true, strict: false }
    );
    return res
      .status(200)
      .json({ message: "Deleted user", status: 200, result });
  } catch (err) {
    if (err.name === "CastError") {
      let errors = "Unknown value '" + err.value + "' " + err.kind + " to map";

      message = {
        error: true,
        message: "Operation failed",
        data: errors,
      };

      return res.status(400).send(message);
    }
    return res.status(500).send(err.toString());
  }
});

module.exports = ProfileRoute;
