/** @format */

require("dotenv").config();
const express = require("express");
const ProductVechicle = require("../../models/product_vehicles");
const isAuthenticate = require("../../middleware/authcheck");
const ProductVechicleRoute = express.Router();

ProductVechicleRoute.get("/list-product", async (req, res) => {
  try {
    const productVechicleList = await ProductVechicle.find({
      isDelete: { $ne: true },
    });

    console.log(productVechicleList);

    message = {
      error: false,
      message: "All product list",
      // data: {countData,prodList},
      data: productVechicleList,
    };

    return res.status(200).send(message);
  } catch (err) {
    message = {
      error: true,
      message: "Operation failed",
      data: err.toString(),
    };
    return res.status(200).send(message);
  }
});

module.exports = ProductVechicleRoute;
