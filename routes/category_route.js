/** @format */

require("dotenv").config();
const express = require("express");
const CategoryRoute = express.Router();
const isAuthenticate = require("../middleware/authcheck"); /* For User (wholesaler or vehicle owener) */
const UserId = require("../helper/getUserToken");
const Category = require("../models/category");

/**
 * This method is to find all category
 */
CategoryRoute.get("/list", async (req, res) => {
  try {
    let CategoryData = await Category.find({ parentId: undefined })
      .select("title description image slug")
      .sort({ _id: -1 });

    let countData = CategoryData.length;
    message = {
      error: false,
      message: "All category list",
      data: { countData, CategoryData },
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
 * This method is to detail category  list
 *  @param str categoryId
 */
CategoryRoute.get("/detail/:categoryId", async (req, res) => {
  try {
    let categoryData = await Category.findOne({
      _id: req.params.categoryId,
      parentId: undefined,
    });

    categoryData = JSON.parse(JSON.stringify(categoryData));

    let subCategories = await Category.find({
      parentId: req.params.categoryId,
    }).select("title slug parentId image");

    subCategories = JSON.parse(JSON.stringify(subCategories));

    for (var i in subCategories) {
      let subcatData1 = await Category.find({
        parentId: subCategories[i]._id,
      }).select("title slug parentId image");
      subcatData1 = JSON.parse(JSON.stringify(subcatData1));

      if (subcatData1.length > 0) subCategories[i].child1 = subcatData1;

      for (var j in subcatData1) {
        let subcatData2 = await Category.find({
          parentId: subcatData1[j]._id,
        }).select("title slug parentId");
        subcatData2 = JSON.parse(JSON.stringify(subcatData2));
        if (subcatData2.length > 0) subcatData1[i].child2 = subcatData2;
      }
    }

    categoryData.child0 = subCategories;

    message = {
      error: false,
      message: "Category details",
      data: categoryData,
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

CategoryRoute.put("/edit/:categoryId", async (req, res) => {
  try {
    if (!req.params.categoryId) {
      message = {
        error: true,
        message: "Request parameter is not valid",
        data: err,
      };
      res.status(200).send(message);
    }
    const updateCategory = await Category.findByIdAndUpdate(
      req.params.categoryId,
      req.body,
      { new: true }
    );
    message = {
      error: false,
      message: "Category details updated",
      data: updateCategory,
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

CategoryRoute.delete("/delete/:categoryId", async (req, res) => {
  try {
    // if (!req.params.categoryId) {
    //   message = {
    //     error: true,
    //     message: "Request parameter is not valid",
    //     data: err,
    //   };
    //   res.status(200).send(message);
    // }
    // const deletedCategory = await Category.findByIdAndDelete(
    //   req.params.categoryId
    // );
    // message = {
    //   error: false,
    //   message: "Category details deleted",
    //   data: deletedCategory,
    // };
    // res.status(200).send(message);
    const result = await CategoryRoute.findByIdAndUpdate(
      req.params.categoryId,
      { $set: { isDelete: true } },
      { new: true, strict: false }
  );
  return res.status(200).json({message: "Deleted catagory", status: 200, catagory: result})
  } catch (err) {
    message = {
      error: true,
      message: "operation failed!",
      data: err,
    };
    res.status(200).send(message);
  }
});

module.exports = CategoryRoute;
