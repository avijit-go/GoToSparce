/** @format */

require("dotenv").config();
const express = require("express");
const RetailerSupplier = require("../../models/retailersupplier");
const SupplierRoute = express.Router();
const isAuthenticate = require("../../middleware/authcheck");
const User = require("../../helper/getUserToken");

/*
 ** Create supplier
 */
SupplierRoute.post("/create", isAuthenticate, async (req, res) => {
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

    var retailerId = user.data._id;
    req.body.retailerId = retailerId;

    const result = await RetailerSupplier.create(req.body);
    message = {
      error: false,
      message: "Supplier created successfully",
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

/*
 ** Update supplier
 */
SupplierRoute.put("/:id", isAuthenticate, async (req, res) => {
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

    const result = await RetailerSupplier.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );

    message = {
      error: false,
      message: "Updated successfully",
      data: result,
    };

    return res.status(200).send(message);
  } catch (err) {
    if (err.name === "CastError") {
      let errors = "Unknown value '" + err.value + "' " + err.kind + " to map";

      message = {
        error: true,
        message: "Operation failed",
        data: errors,
      };

      return res.status(400).send(message);
    }
    return res.status(500).send(err.toString());
  }
});

/*
 ** List supplier
 */
// SupplierRoute.get("/test", async(req, res) => {
//     try {
//         const result = await Promise.allSettled([
//             RetailerSupplier.updateMany({"name": "GTS", "gstNo": "2121212", "email": "gts@test.com"}, {"isGTSSupplier": true}, {new: true})
//         ])
//         return res.status(200).send({result})
//     } catch (error) {
//         throw error;
//     }
// })
SupplierRoute.get("/list", isAuthenticate, async (req, res) => {
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

    var retailerId = user.data._id;
    var searchText = req.query.search;

    let result = [];

    if (searchText) {
      result = await RetailerSupplier.find({
        retailerId: retailerId,
        $or: [
          { name: { $regex: searchText, $options: "i" } },
          { phoneNo: { $regex: searchText, $options: "i" } },
          { email: { $regex: searchText, $options: "i" } },
          { city: { $regex: searchText, $options: "i" } },
        ],
      }).sort({ _id: -1 });
    } else {
      result = await RetailerSupplier.find([
        { retailerId: retailerId },
        { isDelete: { $ne: true } },
      ]).sort({ _id: -1 });
    }

    message = {
      error: false,
      message: "Supplier List",
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

/*
 ** Detailed supplier
 */
SupplierRoute.get("/:id", isAuthenticate, async (req, res) => {
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

    const result = await RetailerSupplier.findOne({ _id: req.params.id });

    message = {
      error: false,
      message: "Details supplier",
      data: result,
    };

    return res.status(200).send(message);
  } catch (err) {
    if (err.name === "CastError") {
      let errors = "Unknown value '" + err.value + "' " + err.kind + " to map";

      message = {
        error: true,
        message: "Operation failed",
        data: errors,
      };

      return res.status(400).send(message);
    }
    return res.status(500).send(err.toString());
  }
});

/*
 ** Delete supplier
 */
SupplierRoute.delete("/:id", async (req, res) => {
  try {
    // let headers = req.headers;
    // let token = headers.authorization.split(' ')[1];
    // let user = User(token);

    // if(!user.data.register_with || user.data.register_with != 'wholesaler'){
    //     message = {
    //         error: true,
    //         message: "You are not logged in as Retailer",
    //         data: {}
    //     }
    //     return res.status(200).send(message)
    // }
    // /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
    // const result = await RetailerSupplier.deleteOne({_id:req.params.id});

    // if(result.deletedCount == 1){
    //     message = {
    //         error: false,
    //         message: "Delete supplier successfully",
    //         data: result
    //     }

    //     return res.status(200).send(message)
    // } else {
    //     message = {
    //         error: true,
    //         message: "Not delete! Somethin went wrong",
    //         data: {}
    //     }

    //     return res.status(200).send(message)
    // }

    const result = await RetailerSupplier.findByIdAndUpdate(
      req.params.id,
      { $set: { isDelete: true } },
      { new: true, strict: false }
    );
    return res.status(200).json({ message: "Deleted", status: 200, result });
  } catch (err) {
    if (err.name === "CastError") {
      let errors = "Unknown value '" + err.value + "' " + err.kind + " to map";

      message = {
        error: true,
        message: "Operation failed",
        data: errors,
      };

      return res.status(400).send(message);
    }
    return res.status(500).send(err.toString());
  }
});

module.exports = SupplierRoute;
