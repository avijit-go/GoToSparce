/** @format */

require("dotenv").config();
const express = require("express");
const Variant = require("../../models/variant");
const isAuthenticate = require("../../middleware/authcheck");
const VariantRoute = express.Router();

/**
 * This API is used for create
 */

VariantRoute.post("/create", isAuthenticate, async (req, res) => {
  try {
    const VariantData = new Variant(req.body);
    const result = await VariantData.save();

    message = {
      error: false,
      message: "Variant create successfully",
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
 * This API is used for list
 */

VariantRoute.get("/list", isAuthenticate, async (req, res) => {
  try {
    let VariantData = await Variant.find({ isDelete: { $ne: true } }).sort({
      _id: -1,
    });

    message = {
      error: false,
      message: "List of all variant",
      data: VariantData,
    };
    res.status(200).send(message);
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
 * This API is used for list of variant web view
 */

VariantRoute.get("/allVariant-list", async (req, res) => {
  try {
    let VariantData = await Variant.find({}).sort({ _id: -1 });

    message = {
      error: false,
      message: "List of all variant",
      data: VariantData,
    };
    res.status(200).send(message);
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
 * This API is used for detail
 */

VariantRoute.get("/detail/:variantid", isAuthenticate, async (req, res) => {
  try {
    let VariantData = await Variant.findOne({ _id: req.params.variantid }).sort(
      { _id: -1 }
    );

    message = {
      error: false,
      message: "Detail of variant",
      data: VariantData,
    };
    res.status(200).send(message);
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
 * This API is used for update
 */

VariantRoute.patch("/update/:variantid", isAuthenticate, async (req, res) => {
  try {
    const result = await Variant.findOneAndUpdate(
      { _id: req.params.variantid },
      req.body,
      { new: true }
    );
    if (result) {
      message = {
        error: false,
        message: "Variant updated successfully!",
        result,
      };
      res.status(200).send(message);
    } else {
      message = {
        error: true,
        message: "Variant not updated",
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
 * change status
 */

VariantRoute.get(
  "/changestatus/:variantid",
  isAuthenticate,
  async (req, res) => {
    try {
      let variantData = await Variant.findOne({ _id: req.params.variantid });

      if (variantData.status == true) {
        await Variant.findOneAndUpdate(
          { _id: req.params.variantid },
          { status: false },
          { new: true }
        );

        message = {
          error: false,
          message: "Variant status changed to inactive",
          data: {},
        };
        res.status(200).send(message);
      } else {
        await Variant.findOneAndUpdate(
          { _id: req.params.variantid },
          { status: true },
          { new: true }
        );

        message = {
          error: false,
          message: "Model status changed to active",
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
  }
);

/**
 * This method is to delete make
 * @param str makeIdId
 */

VariantRoute.delete("/delete/:variantid", async (req, res) => {
  try {
    // const result = await Variant.deleteOne({
    //     _id: req.params.variantid
    // });
    // if (result.deletedCount == 1) {
    //     message = {
    //         error: false,
    //         message: "Variant deleted successfully!",
    //     };
    //     res.status(200).send(message);
    // } else {
    //     message = {
    //         error: true,
    //         message: "Operation failed!",
    //     };
    //     res.status(200).send(message);
    // }
    const result = await Variant.findByIdAndUpdate(
      req.params.variantid,
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

module.exports = VariantRoute;
