/** @format */

require("dotenv").config();
const express = require("express");
const Supplier = require("../../models/supplier");
const SupplierRoute = express.Router();
const isAuthenticate = require("../../middleware/authcheck"); /* For GTS Admin */

/**
 * This method is to create supplier via admin
 */
SupplierRoute.post("/create", isAuthenticate, async (req, res) => {
  try {
    const SupplierData = new Supplier(req.body);
    const result = await SupplierData.save();
    message = {
      error: false,
      message: "Supplier Created Successfully!",
      data: result,
    };
    return res.status(200).send(message);
  } catch (err) {
    message = {
      error: true,
      message: "operation Failed!",
      data: err,
    };
    return res.status(200).send(message);
  }
});

/**
 * This method is to find all supplier
 */
SupplierRoute.get("/list", isAuthenticate, async (req, res) => {
  try {
    let searchText = req.query.search;
    let searchVal = {};
    if (searchText) {
      searchVal = {
        $or: [
          { name: { $regex: searchText, $options: "i" } },
          { phone: { $regex: searchText, $options: "i" } },
          { whatsapp: { $regex: searchText, $options: "i" } },
          { email: { $regex: searchText, $options: "i" } },
        ],
      };
    }

    let SupplierData = await Supplier.find(searchVal)
      .find({ isDelete: { $ne: true } })
      .sort({ _id: -1 });

    message = {
      error: false,
      message: "All Supplier list",
      data: SupplierData,
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
 * This method is to detail supplier
 *  @param str makeId
 */
SupplierRoute.get("/detail/:id", isAuthenticate, async (req, res) => {
  try {
    let SupplierData = await Supplier.findOne({ _id: req.params.id });

    message = {
      error: false,
      message: "Supplier Details",
      data: SupplierData,
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
 * This method is to update Supplier
 * * @param str id
 */

SupplierRoute.put("/update/:id", isAuthenticate, async (req, res) => {
  try {
    const result = await Supplier.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    if (result) {
      message = {
        error: false,
        message: "Supplier updated successfully!",
        result,
      };
      res.status(200).send(message);
    } else {
      message = {
        error: true,
        message: "Supplier not updated",
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
 * This method is to delete Supplier
 * @param str id
 */
SupplierRoute.delete("/delete/:id", async (req, res) => {
  try {
    // const result = await Supplier.deleteOne({
    //     _id: req.params.id
    // });
    // if (result.deletedCount == 1) {
    //     message = {
    //         error: false,
    //         message: "Supplier deleted successfully!",
    //     };
    //     res.status(200).send(message);
    // } else {
    //     message = {
    //         error: true,
    //         message: "Operation failed!",
    //     };
    //     res.status(200).send(message);
    // }
    const result = await Supplier.findByIdAndUpdate(
      req.params.id,
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

/**
 * This method is used to search Supplier
 * @param str id
 */

SupplierRoute.post("/search", isAuthenticate, async (req, res) => {
  try {
    const searchText = req.body.searchText;
    const result = await Supplier.find({
      $or: [
        { name: { $regex: searchText, $options: "i" } },
        { phone: { $regex: searchText, $options: "i" } },
        { whatsapp: { $regex: searchText, $options: "i" } },
        { email: { $regex: searchText, $options: "i" } },
      ],
    });

    if (result) {
      message = {
        error: false,
        message: "Supplier search successfully!",
        data: result,
      };

      res.status(200).send(message);
    } else {
      message = {
        error: true,
        message: "Supplier search failed",
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

module.exports = SupplierRoute;
