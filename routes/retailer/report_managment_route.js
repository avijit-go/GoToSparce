/** @format */

require("dotenv").config();
const express = require("express");
const ReportManagmentRoute = express.Router();
const isAuthenticate = require("../../middleware/authcheck");
const User = require("../../helper/getUserToken");
const RetailerOrder = require("../../models/retailerorder");
const RetailerSales = require("../../models/retailersales");
const RetailerStock = require("../../models/retailerstock");
const { query } = require("express");
const moment = require("moment-timezone");

/**
 * Sales list
 */

ReportManagmentRoute.get("/sales/list", isAuthenticate, async (req, res) => {
  try {
    let headers = req.headers;
    let token = headers.authorization.split(" ")[1];
    let user = User(token);

    if (!user.data.register_with || user.data.register_with != "wholesaler") {
      message = {
        error: true,
        message: "You are not logged in as Retailer",
        data: {},
      };
      return res.status(200).send(message);
    }
    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
    const retailerId = user.data._id;
    // return res.send(retailerId)

    //let searchBy = {}
    // let type = req.query.type;
    // let from = req.query.from;
    // let to = req.query.to;
    let from = req.query.from
      ? moment(new Date(req.query.from)).tz("Asia/Kolkata").format()
      : undefined;
    let to = req.query.to
      ? moment(new Date(req.query.to))
          .tz("Asia/Kolkata")
          .add(1, "days")
          .format()
      : undefined;
    let proId = req.query.proId;
    let catId = req.query.catId;
    let subcatId = req.query.subcatId;

    let findData = {
      $and: [{ retailerId: retailerId }, { isDelete: { $ne: true } }],
    };

    if (from && to) {
      findData.$and.push({ orderDate: { $gte: from, $lt: to } });
    }
    if (proId) {
      findData.$and.push({ "items.proId": proId });
    }
    if (catId) {
      findData.$and.push({ "items.catId": catId });
    }
    if (subcatId) {
      findData.$and.push({ "items.subcatId": subcatId });
    }

    let result = await RetailerOrder.find(findData)
      .populate([
        {
          path: "retailerId",
          select: "fname lname",
        },
        {
          path: "items.proId",
          select: "proTitle",
        },
        {
          path: "items.catId",
          select: "title",
        },
        {
          path: "items.subcatId",
          select: "title",
        },
      ])
      .select("orderNo orderDate orderPrice items.price items.quantity")
      .sort({ _id: -1 });

    // let ItemData = result.map(e=>e.items);
    // console.log("ItemData",ItemData);

    message = {
      error: false,
      message: "sales report",
      data: result,
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

/**
 * Sales list
 */

ReportManagmentRoute.get(
  "/sales-report/list",
  isAuthenticate,
  async (req, res) => {
    try {
      let headers = req.headers;
      let token = headers.authorization.split(" ")[1];
      let user = User(token);

      if (!user.data.register_with || user.data.register_with != "wholesaler") {
        message = {
          error: true,
          message: "You are not logged in as Retailer",
          data: {},
        };
        return res.status(200).send(message);
      }
      /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
      const retailerId = user.data._id;
      // return res.send(retailerId)

      //let searchBy = {}
      // let type = req.query.type;
      let from = req.query.from;
      let to = req.query.to;
      let proId = req.query.proId;
      let catId = req.query.catId;
      let subcatId = req.query.subcatId;

      let findData = {
        $and: [{ retailerId: retailerId }],
      };

      if (from && to) {
        findData.$and.push({ orderDate: { $gte: from, $lte: to } });
      }
      if (proId) {
        findData.$and.push({ proId: proId });
      }
      if (catId) {
        findData.$and.push({ catId: catId });
      }
      if (subcatId) {
        findData.$and.push({ subcatId: subcatId });
      }

      let result = await RetailerSales.find(findData)
        .populate([
          {
            path: "retailerId",
            select: "fname lname",
          },
          {
            path: "proId",
            select: "proTitle price",
            // populate:{
            //     path:"proId",
            //     select:"title"
            // }
          },
          {
            path: "catId",
            select: "title",
          },
          {
            path: "subcatId",
            select: "title",
          },
        ]) /*.select("orderNo orderDate orderPrice items.price items.quantity")*/
        .sort({ _id: -1 });

      let count = result.length;

      message = {
        error: false,
        message: "Sales report",
        data: result,
        count,
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
  }
);

/**
 * Stock list
 */

ReportManagmentRoute.get("/stock/list", isAuthenticate, async (req, res) => {
  try {
    let headers = req.headers;
    let token = headers.authorization.split(" ")[1];
    let user = User(token);

    if (!user.data.register_with || user.data.register_with != "wholesaler") {
      message = {
        error: true,
        message: "You are not logged in as Retailer",
        data: {},
      };
      return res.status(200).send(message);
    }
    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
    const retailerId = user.data._id;
    // return res.send(retailerId)

    //let searchBy = {}
    // let type = req.query.type;
    // let from = req.query.from;
    // let to = req.query.to;
    let from = req.query.from
      ? moment(new Date(req.query.from)).tz("Asia/Kolkata").format()
      : undefined;
    let to = req.query.to
      ? moment(new Date(req.query.to))
          .tz("Asia/Kolkata")
          .add(1, "days")
          .format()
      : undefined;
    let proId = req.query.proId;
    let catId = req.query.catId;
    let subcatId = req.query.subcatId;

    let findData = {
      $and: [{ retailerId: retailerId }],
    };

    if (from && to) {
      findData.$and.push({ entryDate: { $gte: from, $lt: to } });
    }
    if (proId) {
      findData.$and.push({ proId: proId });
    }
    if (catId) {
      findData.$and.push({ catId: catId });
    }
    if (subcatId) {
      findData.$and.push({ subcatId: subcatId });
    }

    let result = await RetailerStock.find(findData)
      .populate([
        {
          path: "retailerId",
          select: "fname lname",
        },
        {
          path: "proId",
          select: "proTitle price",
          // populate:{
          //     path:"proId",
          //     select:"title mrp"
          // }
        },
        {
          path: "catId",
          select: "title",
        },
        {
          path: "subcatId",
          select: "title",
        },
        {
          path: "customerorderId",
          select: "orderNo",
        },
        {
          path: "supplierorderId",
          select: "orderNo",
        },
      ])
      .select(
        "entryDate quantity customerorderId supplierorderId reference_type stock_type"
      )
      .sort({ _id: -1 });

    message = {
      error: false,
      message: "Stock report",
      data: result,
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

ReportManagmentRoute.delete("/delete/:salesId", async (req, res) => {
  try {
    // const result = await RetailerSales.deleteOne({ _id: req.params.salesId });
    // if (result.deletedCount == 1) {
    // 	message = {
    // 		error: false,
    // 		message: "Sales deleted successfully!",
    // 	};
    // 	res.status(200).send(message);
    // } else {
    // 	message = {
    // 		error: true,
    // 		message: "Operation failed!",
    // 	};
    // 	res.status(200).send(message);
    // }
    const result = await RetailerSales.findByIdAndUpdate(
      req.params.salesId,
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

module.exports = ReportManagmentRoute;
