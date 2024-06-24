/** @format */

require("dotenv").config();
const express = require("express");
const Category = require("../../models/category");
const CategoryRoute = express.Router();
const isAuthenticate = require("../../middleware/authcheck");

/**
 * This method is to create category
 */
CategoryRoute.post("/create", isAuthenticate, async (req, res) => {
  try {
    const checkCategory = await Category.find({
      $and: [
        { title: { $regex: req.body.title, $options: "i" } },
        { layer: "c" },
      ],
    });
    if (checkCategory.length) {
      for (let index = 0; index < checkCategory.length; index++) {
        if (
          checkCategory[index].title.toLowerCase() ==
          req.body.title.toLowerCase()
        ) {
          return res
            .status(200)
            .send({ error: true, message: "Category exists with this title!" });
        }
      }
    }
    const CategoryData = new Category(req.body);
    const result = await CategoryData.save();
    if (req.body.parentId) {
      const checkCategory = await Category.find({
        $and: [
          { title: { $regex: req.body.title, $options: "i" } },
          { layer: "sc" },
        ],
      });
      if (checkCategory.length) {
        for (let index = 0; index < checkCategory.length; index++) {
          if (
            checkCategory[index].title.toLowerCase() ==
            req.body.title.toLowerCase()
          ) {
            return res
              .status(200)
              .send({
                error: true,
                message: "SubCategory exists with this title!",
              });
          }
        }
      }
      message = {
        error: false,
        message: "Sub-category Create Successfully!",
        data: result,
      };
      return res.status(200).send(message);
    } else {
      message = {
        error: false,
        message: "Category Create Successfully!",
        data: result,
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
/**
 * This method is to find all category
 */
CategoryRoute.get("/list", async (req, res) => {
  try {
    let searchText = req.query.search;
    let searchVal = { parentId: undefined };
    if (searchText) {
      searchVal = {
        $and: [
          { parentId: undefined },
          { title: { $regex: searchText, $options: "i" } },
        ],
      };
    }
    let CategoryData = await Category.find(searchVal).find({ isDelete: { $ne: true } }).sort({ _id: -1 });

    message = {
      error: false,
      message: "All category list",
      data: CategoryData,
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
CategoryRoute.get("/detail/:categoryId", isAuthenticate, async (req, res) => {
  try {
    let categoryData = await Category.findOne({
      _id: req.params.categoryId,
      parentId: undefined,
    });

    categoryData = JSON.parse(JSON.stringify(categoryData));

    let subCategories = await Category.find({
      parentId: req.params.categoryId,
    });

    subCategories = JSON.parse(JSON.stringify(subCategories));

    for (var i in subCategories) {
      let subcatData1 = await Category.find({ parentId: subCategories[i]._id });
      subcatData1 = JSON.parse(JSON.stringify(subcatData1));

      if (subcatData1.length > 0) subCategories[i].child1 = subcatData1;

      for (var j in subcatData1) {
        let subcatData2 = await Category.find({ parentId: subcatData1[j]._id });
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
/*
 ** Details Category
 */
CategoryRoute.get("/:categoryId", isAuthenticate, async (req, res) => {
  try {
    let categoryData = await Category.findOne({ _id: req.params.categoryId });

    message = {
      error: false,
      message: "Detailed category",
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
/**
 * This method is to update Category
 * * @param str categoryId
 */
CategoryRoute.patch("/update/:categoryId", isAuthenticate, async (req, res) => {
  try {
    const result = await Category.findOneAndUpdate(
      { _id: req.params.categoryId },
      req.body,
      { new: true }
    );
    if (result) {
      message = {
        error: false,
        message: "category updated successfully!",
        result,
      };
      res.status(200).send(message);
    } else {
      message = {
        error: true,
        message: "category not updated",
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
 * This method is to delete category
 * @param str categoryId
 */
CategoryRoute.delete("/delete/:categoryId", async (req, res) => {
  try {
    // const result = await Category.deleteOne({
    //     _id: req.params.categoryId
    // });
    // if (result.deletedCount == 1) {
    //     message = {
    //         error: false,
    //         message: "category deleted successfully!",
    //     };
    //     res.status(200).send(message);
    // } else {
    //     message = {
    //         error: true,
    //         message: "Operation failed!",
    //     };
    //     res.status(200).send(message);
    // }
    const result = await Category.findByIdAndUpdate(
      req.params.categoryId,
      { $set: { isDelete: true } },
      { new: true, strict: false }
    );
    return res
      .status(200)
      .json({ message: "Deleted user", status: 200, result });
  } catch (err) {
    message = {
      error: true,
      message: "Operation Failed!",
      data: err,
    };
    res.status(200).send(message);
  }
});
/*
 ** Status Change query param categoryId
 */
CategoryRoute.get(
  "/changestatus/:categoryId",
  isAuthenticate,
  async (req, res) => {
    try {
      let catData = await Category.findOne({ _id: req.params.categoryId });

      if (catData.status == true) {
        await Category.findOneAndUpdate(
          { _id: req.params.categoryId },
          { status: false },
          { new: true }
        );

        message = {
          error: false,
          message: "Status changed to inactive",
          data: {},
        };
        res.status(200).send(message);
      } else {
        await Category.findOneAndUpdate(
          { _id: req.params.categoryId },
          { status: true },
          { new: true }
        );

        message = {
          error: false,
          message: "Status changed to active",
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

module.exports = CategoryRoute;
