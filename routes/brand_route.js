/** @format */

const router = require("express").Router();
const Brand = require("../models/brand");

router.get("/list", async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const brandList = await Brand.find({ isDelete: { $ne: true } })
      .skip(limit * (page - 1))
      .limit(limit)
      .sort({ createdAt: -1 });
    return res
      .status(200)
      .json({
        message: "Get list of available brands",
        status: 200,
        brandList,
      });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
