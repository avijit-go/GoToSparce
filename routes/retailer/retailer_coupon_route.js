require("dotenv").config();
const express = require("express");
const RetailerCoupon = require("../../models/retailer_coupon");
const RetailerCouponRoute = express.Router();
const isAuthenticate = require("../../middleware/authcheck");


/**
 * This Method is used to find list of reatiler coupon
 */

 RetailerCouponRoute.get("/list",isAuthenticate, async (req, res) => {
    try {
        const CouponData = await RetailerCoupon.find({}).sort({_id:-1});
        message = {
            error: false,
            message: "All Coupons list",
            data: CouponData,
        };
        res.status(200).send(message);
    } catch(err) {
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
 * This Method is used to find detail reatiler coupon
 * @param {String} couponId
 */

 RetailerCouponRoute.get("/detail/:couponId",isAuthenticate, async (req, res) => {
    try {
        var CouponData = await RetailerCoupon.findOne({
			$or: [
				{_id: req.params.couponId}
			]
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
				message: "coupon not found"
			};
		}
        res.status(200).send(message);
    } catch(err) {
        message = {
            error: true,
            message: "operation failed!",
            data: err,
        };
        res.status(400).send(message);
    }
});

/**
 * This Method is used to create reatiler coupon
 */

 RetailerCouponRoute.post("/create",isAuthenticate, async (req, res) => {
	try {
        const CouponData = new RetailerCoupon(req.body);
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
 * This Method is used to update reatiler coupon
 */

 RetailerCouponRoute.patch("/update/:CouponId",isAuthenticate, async (req, res) => {
	try {
		const result = await RetailerCoupon.findOneAndUpdate({ _id: req.params.CouponId }, req.body, { new: true });
		if (result) {
            message = {
                error: false,
                message: "Coupon Updated Successfully!",
                data: result
            };
            return res.status(200).send(message);
        } else {
            message = {
                error: true,
                message: "Coupon not found!"
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
});

/**
 * This Method is used to for block/unblock reatiler coupon
 */

 RetailerCouponRoute.patch("/toggle-status/:CouponId",isAuthenticate, async (req, res) => {
	try {
		const result = await RetailerCoupon.findOneAndUpdate({ _id: req.params.CouponId }, {status: req.body.status});
		if (result) {
            message = {
                error: false,
                message: "Coupon Status Updated!"
            };
            return res.status(200).send(message);
        } else {
            message = {
                error: true,
                message: "Coupon not found!"
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
});

/**
 * This Method is used to delete reatiler coupon
 */

 RetailerCouponRoute.delete("/delete/:CouponId",isAuthenticate, async (req, res) => {
	try {
		const result = await RetailerCoupon.deleteOne({ _id: req.params.CouponId });
		if (result.deletedCount == 1) {
			message = {
				error: false,
				message: "Coupon deleted successfully!",
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Operation failed!",
			};
			res.status(200).send(message);
		}
	} catch (err) {
		message = {
			error: true,
			message: "Operation Failed!",
			data: err,
		};
		res.status(200).send(message);
	}
});

module.exports = RetailerCouponRoute;

