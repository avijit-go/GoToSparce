/** @format */

require("dotenv").config();
const express = require("express");
const AdminCoupon = require("../../models/admin_coupon");
const AdminCouponRoute = express.Router();
const isAuthenticate = require("../../middleware/authcheck");

/**
 * This Method is used to find list of admin coupon
 */

AdminCouponRoute.get("/list", isAuthenticate, async (req, res) => {
  try {
    const CouponData = await AdminCoupon.find({ isDelete: { $ne: true } }).sort(
      { _id: -1 }
    );
    message = {
      error: false,
      message: "All Coupons list",
      data: CouponData,
    };
    res.status(200).send(message);
  } catch (err) {
    message = {
      error: true,
      message: "operation failed!",
      data: err,
    };
    res.status(400).send(message);
  }
});

/**
 * /**
 * This Method is used to create admin coupon
 * @param {String} couponId
 */

AdminCouponRoute.get("/detail/:couponId", isAuthenticate, async (req, res) => {
  try {
    var CouponData = await AdminCoupon.findOne({
      $or: [{ _id: req.params.couponId }],
    });
    if (CouponData) {
      message = {
        error: false,
        message: "Coupon detail found",
        data: CouponData,
      };
    } else {
      message = {
        error: true,
        message: "coupon not found",
      };
    }
    res.status(200).send(message);
  } catch (err) {
    message = {
      error: true,
      message: "operation failed!",
      data: err,
    };
    res.status(400).send(message);
  }
});

/**
 * This Method is used to create admin coupon
 */

AdminCouponRoute.post("/create", isAuthenticate, async (req, res) => {
  try {
    const CouponData = new AdminCoupon(req.body);
    const result = await CouponData.save();
    message = {
      error: false,
      message: "Coupon Added Successfully!",
      data: result,
    };
    return res.status(200).send(message);
  } catch (err) {
    message = {
      error: true,
      message: "Operation Failed!",
      data: err,
    };
    return res.status(200).send(message);
  }
});

/**
 * This Method is used to update admin coupon
 */

AdminCouponRoute.patch(
  "/update/:CouponId",
  isAuthenticate,
  async (req, res) => {
    try {
      const result = await AdminCoupon.findOneAndUpdate(
        { _id: req.params.CouponId },
        req.body,
        { new: true }
      );
      if (result) {
        message = {
          error: false,
          message: "Coupon Updated Successfully!",
          data: result,
        };
        return res.status(200).send(message);
      } else {
        message = {
          error: true,
          message: "Coupon not found!",
        };
        return res.status(200).send(message);
      }
    } catch (err) {
      message = {
        error: true,
        message: "Operation Failed!",
        data: err,
      };
      return res.status(400).send(message);
    }
  }
);

/**
 * This Method is used to for block/unblock admin coupon
 */

AdminCouponRoute.patch(
  "/toggle-status/:CouponId",
  isAuthenticate,
  async (req, res) => {
    try {
      const result = await AdminCoupon.findOneAndUpdate(
        { _id: req.params.CouponId },
        { status: req.body.status }
      );
      if (result) {
        message = {
          error: false,
          message: "Coupon Status Updated!",
        };
        return res.status(200).send(message);
      } else {
        message = {
          error: true,
          message: "Coupon not found!",
        };
        return res.status(200).send(message);
      }
    } catch (err) {
      message = {
        error: true,
        message: "Operation Failed!",
        data: err,
      };
      return res.status(400).send(message);
    }
  }
);

/**
 * This Method is used to delete admin coupon
 */

AdminCouponRoute.delete("/delete/:CouponId", async (req, res) => {
  try {
    // const result = await AdminCoupon.deleteOne({ _id: req.params.CouponId });
    // if (result.deletedCount == 1) {
    // 	message = {
    // 		error: false,
    // 		message: "Coupon deleted successfully!",
    // 	};
    // 	res.status(200).send(message);
    // } else {
    // 	message = {
    // 		error: true,
    // 		message: "Operation failed!",
    // 	};
    // 	res.status(200).send(message);
    // }
    const result = await AdminCoupon.findByIdAndUpdate(
      req.params.CouponId,
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

module.exports = AdminCouponRoute;
