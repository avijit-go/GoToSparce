/** @format */

require("dotenv").config();
const express = require("express");
const Make = require("../../models/make");
const MakeRoute = express.Router();
const isAuthenticate = require("../../middleware/authcheck"); /* For GTS Admin */

/**
 * This method is to create category
 */
MakeRoute.post("/create", isAuthenticate, async (req, res) => {
  try {
    const checkMake = await Make.find({
      title: { $regex: req.body.title, $options: "i" },
    });
    if (checkMake.length) {
      for (let index = 0; index < checkMake.length; index++) {
        if (
          checkMake[index].title.toLowerCase() == req.body.title.toLowerCase()
        ) {
          return res
            .status(200)
            .send({
              error: true,
              message: "An Make already exists with this title!",
            });
        }
      }
    }
    const MakeData = new Make(req.body);
    const result = await MakeData.save();
    message = {
      error: false,
      message: "MakeData Added Successfully!",
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
 * This method is to find all make
 */
MakeRoute.get("/list", isAuthenticate, async (req, res) => {
  try {
    let searchText = req.query.search;
    let searchVal = {};
    if (searchText) {
      searchVal = {
        $or: [{ title: { $regex: searchText, $options: "i" } }],
      };
    }
    let MakeData = await Make.find(searchVal)
      .find({ isDelete: { $ne: true } })
      .sort({ _id: -1 });

    message = {
      error: false,
      message: "All Make list",
      data: MakeData,
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
 * This method is to find all make web view
 */
MakeRoute.get("/allMake-list", async (req, res) => {
  try {
    let searchText = req.query.search;
    let searchVal = {};
    if (searchText) {
      searchVal = {
        $or: [{ title: { $regex: searchText, $options: "i" } }],
      };
    }
    let MakeData = await Make.find(searchVal).sort({ _id: -1 });

    message = {
      error: false,
      message: "All Make list",
      data: MakeData,
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
 * This method is to detail make  list
 *  @param str makeId
 */
MakeRoute.get("/detail/:makeId", isAuthenticate, async (req, res) => {
  try {
    let MakeData = await Make.findOne({ _id: req.params.makeId });

    message = {
      error: false,
      message: "Detail Make list",
      data: MakeData,
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
 * * @param str makeId
 */

MakeRoute.patch("/update/:makeId", isAuthenticate, async (req, res) => {
  try {
    const checkMake = await Make.find({
      title: { $regex: req.body.title, $options: "i" },
    });
    if (checkMake.length) {
      for (let index = 0; index < checkMake.length; index++) {
        if (
          checkMake[index].title.toLowerCase() == req.body.title.toLowerCase()
        ) {
          return res
            .status(200)
            .send({
              error: true,
              message: "An Make already exists with this title!",
            });
        }
      }
    }
    const result = await Make.findOneAndUpdate(
      { _id: req.params.makeId },
      req.body,
      { new: true }
    );
    if (result) {
      message = {
        error: false,
        message: "Make updated successfully!",
        result,
      };
      res.status(200).send(message);
    } else {
      message = {
        error: true,
        message: "Make not updated",
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
 * This method is to update popular make
 * * @param str makeId
 */

MakeRoute.patch(
  "/updatePopularMake/:makeId",
  isAuthenticate,
  async (req, res) => {
    try {
      const result = await Make.findOneAndUpdate(
        { _id: req.params.makeId },
        { makeAsPopular: req.body.makeAsPopular },
        { new: true }
      );
      if (result) {
        message = {
          error: false,
          message: "Popular Make updated successfully!",
          result,
        };
        res.status(200).send(message);
      } else {
        message = {
          error: true,
          message: "Popular Make not updated",
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
MakeRoute.delete("/delete/:makeIdId", async (req, res) => {
  try {
    // const result = await Make.deleteOne({
    //     _id: req.params.makeIdId
    // });
    // if (result.deletedCount == 1) {
    //     message = {
    //         error: false,
    //         message: "Make deleted successfully!",
    //     };
    //     res.status(200).send(message);
    // } else {
    //     message = {
    //         error: true,
    //         message: "Operation failed!",
    //     };
    //     res.status(200).send(message);
    // }
    const result = await Make.findByIdAndUpdate(
      req.params.makeIdId,
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
 ** Status Change query param makeId
 */
MakeRoute.get("/changestatus/:makeId", isAuthenticate, async (req, res) => {
  try {
    let makeData = await Make.findOne({ _id: req.params.makeId });

    if (makeData.status == true) {
      await Make.findOneAndUpdate(
        { _id: req.params.makeId },
        { status: false },
        { new: true }
      );

      message = {
        error: false,
        message: "Make status changed to inactive",
        data: {},
      };
      res.status(200).send(message);
    } else {
      await Make.findOneAndUpdate(
        { _id: req.params.makeId },
        { status: true },
        { new: true }
      );

      message = {
        error: false,
        message: "Make status changed to active",
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

module.exports = MakeRoute;
