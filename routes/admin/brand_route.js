/** @format */

require("dotenv").config();
const express = require("express");
const Brand = require("../../models/brand");
const BrandRoute = express.Router();
const isAuthenticate = require("../../middleware/authcheck"); /* For GTS Admin */
const errorMessage = require("../../helper/errorMessage");

/**
 * This method is to create brand
 */
BrandRoute.post("/create", isAuthenticate, async (req, res) => {
  try {
    const checkBrand = await Brand.find({
      title: { $regex: req.body.title, $options: "i" },
    });
    if (checkBrand.length) {
      for (let index = 0; index < checkBrand.length; index++) {
        if (
          checkBrand[index].title.toLowerCase() == req.body.title.toLowerCase()
        ) {
          return res
            .status(200)
            .send({
              error: true,
              message: "An Brand already exists with this title!",
            });
        }
      }
    }
    const BrandData = new Brand(req.body);
    const result = await BrandData.save();
    message = {
      error: false,
      message: "Brand Added Successfully!",
      data: result,
    };
    return res.status(200).send(message);
  } catch (err) {
    message = {
      error: true,
      message: "operation Failed!",
      data: errorMessage(err),
    };
    return res.status(200).send(message);
  }
});

/**
 * This method is to find all brand
 */
BrandRoute.get("/list", isAuthenticate, async (req, res) => {
  try {
    let searchText = req.query.search;
    let searchVal = {};
    if (searchText) {
      searchVal = {
        $or: [{ title: { $regex: searchText, $options: "i" } }],
      };
    }
    let BrandData = await Brand.find(searchVal)
      .find({ isDelete: { $ne: true } })
      .sort({ _id: -1 });

    message = {
      error: false,
      message: "All Brand list",
      data: BrandData,
    };
    res.status(200).send(message);
  } catch (err) {
    message = {
      error: true,
      message: "operation failed!",
      data: err,
    };
    res.status(200).send(message);
  }
});

/**
 * This method is to detail brand  list
 *  @param str brandId
 */
BrandRoute.get("/detail/:brandId", isAuthenticate, async (req, res) => {
  try {
    let BrandData = await Brand.findOne({ _id: req.params.brandId });

    message = {
      error: false,
      message: "Detail Brand list",
      data: BrandData,
    };
    res.status(200).send(message);
  } catch (err) {
    message = {
      error: true,
      message: "operation failed!",
      data: err,
    };
    res.status(200).send(message);
  }
});

/**
 * This method is to update Make
 * * @param str brandId
 */

BrandRoute.patch("/update/:brandId", isAuthenticate, async (req, res) => {
  try {
    const checkBrand = await Brand.find({
      title: { $regex: req.body.title, $options: "i" },
    });
    if (checkBrand.length) {
      for (let index = 0; index < checkBrand.length; index++) {
        if (
          checkBrand[index].title.toLowerCase() == req.body.title.toLowerCase()
        ) {
          return res
            .status(200)
            .send({
              error: true,
              message: "An Brand already exists with this title!",
            });
        }
      }
    }
    const result = await Brand.findOneAndUpdate(
      { _id: req.params.brandId },
      req.body,
      { new: true }
    );
    if (result) {
      message = {
        error: false,
        message: "Brand updated successfully!",
        result,
      };
      res.status(200).send(message);
    } else {
      message = {
        error: true,
        message: "Brand not updated",
      };
      res.status(200).send(message);
    }
  } catch (err) {
    message = {
      error: true,
      message: "Operation Failed!",
      data: err.toString(),
    };
    res.status(200).send(message);
  }
});

/**
 * This method is to update popular brand
 * * @param str brandId
 */

BrandRoute.patch(
  "/updatePopularBrand/:brandId",
  isAuthenticate,
  async (req, res) => {
    try {
      const result = await Brand.findOneAndUpdate(
        { _id: req.params.brandId },
        { brandAsPopular: req.body.brandAsPopular },
        { new: true }
      );
      if (result) {
        message = {
          error: false,
          message: "Popular Brand updated successfully!",
          result,
        };
        res.status(200).send(message);
      } else {
        message = {
          error: true,
          message: "Popular Brand not updated",
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
  }
);

/*
 ** Status Change query param brandId
 */
BrandRoute.get("/changestatus/:brandId", isAuthenticate, async (req, res) => {
  try {
    let brandData = await Brand.findOne({ _id: req.params.brandId });

    if (brandData.status == true) {
      await Brand.findOneAndUpdate(
        { _id: req.params.brandId },
        { status: false },
        { new: true }
      );

      message = {
        error: false,
        message: "Brand status changed to inactive",
        data: {},
      };
      res.status(200).send(message);
    } else {
      await Brand.findOneAndUpdate(
        { _id: req.params.brandId },
        { status: true },
        { new: true }
      );

      message = {
        error: false,
        message: "Brand status changed to active",
        data: {},
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

/**
 * This method is to delete brand
 * @param str brandId
 */
BrandRoute.delete("/delete/:brandId", async (req, res) => {
  try {
    // const result = await Brand.deleteOne({
    //     _id: req.params.brandId
    // });
    // if (result.deletedCount == 1) {
    //     message = {
    //         error: false,
    //         message: "Brand deleted successfully!",
    //     };
    //     res.status(200).send(message);
    // } else {
    //     message = {
    //         error: true,
    //         message: "Operation failed!",
    //     };
    //     res.status(200).send(message);
    // }
    const result = await Brand.findByIdAndUpdate(
      req.params.brandId,
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

module.exports = BrandRoute;
