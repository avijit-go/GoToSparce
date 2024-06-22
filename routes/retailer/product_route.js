/** @format */

require("dotenv").config();
const express = require("express");
const ProductRoute = express.Router();
const isAuthenticate = require("../../middleware/authcheck");
const User = require("../../helper/getUserToken");
const Product = require("../../models/product");
const Category = require("../../models/category");
const RetailerProduct = require("../../models/retailerproduct");
const RetailerStock = require("../../models/retailerstock");
const Order = require("../../models/order");

/*
 ** Create Product
 */
ProductRoute.post("/create", isAuthenticate, async (req, res) => {
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
    var retailerId = user.data._id;
    req.body.retailerId = retailerId;

    var proId = req.body.proId;
    var quantity = req.body.quantity;

    let checkGTSPro = await RetailerProduct.findOne({
      retailerId: retailerId,
      proId: proId,
    });
    if (checkGTSPro) {
      message = {
        error: true,
        message: "You have already added this GTS product",
        data: {},
      };
      return res.status(200).send(message);
    }
    let gtsProData = await Product.findOne({ _id: proId, status: true }).select(
      "title partNo catId subcat0Id subcat1Id mrp"
    );

    var price = gtsProData.mrp;
    var proTitle = gtsProData.title;
    // var proImage = gtsProData.image;

    var catId = gtsProData.catId;
    let getCat = await Category.findOne({ _id: catId }).select("title");
    var catTitle = getCat.title;

    var subcatId = gtsProData.subcat0Id;
    let getSubat = await Category.findOne({ _id: subcatId }).select("title");
    var subcatTitle = getSubat.title;
    if (gtsProData) {
      partNo = gtsProData.partNo;
      let proData = {
        retailerId: retailerId,
        proId: proId,
        partNo: partNo,
        proTitle: proTitle,
        catId: catId,
        catTitle: catTitle,
        subcatId: subcatId,
        subcatTitle: subcatTitle,
        price: price,
        quantity: quantity,
      };

      //console.log(proData);

      const result = await RetailerProduct.create(proData);

      // let pid = result?._id

      // let productData = await RetailerProduct.findOne({_id:pid}).populate([
      //     {
      //         path:"proId",
      //         select:""
      //     }
      // ])

      /* Entry Stock Log */

      var entryDate = result.createdAt;
      let reqStock = {
        retailerId: retailerId,
        proId: result._id,
        proTitle: result.proTitle,
        catId: result.catId,
        subcatId: result.subcatId,
        entryDate: entryDate,
        stock_type: "initial",
        quantity: result.quantity,
        reference_type: "retailer",
        // "retailerorderId": result._id
      };
      await RetailerStock.create(reqStock);

      // console.log("reqStock",reqStock);

      message = {
        error: false,
        message: "Product created successfully",
        data: result,
      };

      return res.status(200).send(message);
    } else {
      message = {
        error: true,
        message: "No product found",
        data: {},
      };
      return res.status(200).send(message);
    }
  } catch (err) {
    message = {
      error: true,
      message: "Operation failed",
      data: err.toString(),
    };
    return res.status(400).send(message);
  }
});

/*
 ** Update Product
 */
ProductRoute.put("/:id", isAuthenticate, async (req, res) => {
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
    var retailerId = user.data._id;
    req.body.retailerId = retailerId;

    const result = await RetailerProduct.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    if (result) {
      message = {
        error: false,
        message: "Product updated successfully",
        data: result,
      };
      return res.status(200).send(message);
    } else {
      message = {
        error: true,
        message: "Product not updated",
        data: {},
      };
      res.status(200).send(message);
      return res.status(200).send(message);
    }
  } catch (err) {
    if (err.name === "ValidationError") {
      let errors = {};

      Object.keys(err.errors).forEach((key) => {
        errors[key] = err.errors[key].message;
      });

      message = {
        error: true,
        message: "Operation failed",
        data: errors,
      };

      return res.status(400).send(message);
    } else if (err.name === "CastError") {
      let errors =
        "Unknown value '" +
        err.value +
        "' " +
        err.kind +
        " as product " +
        err.path +
        " to map";

      message = {
        error: true,
        message: "Operation failed",
        data: errors,
      };

      return res.status(400).send(message);
    }
    return res.status(500).send(err);
  }
});
/**
 * This method is to find all category
 */
ProductRoute.get("/categorylist", isAuthenticate, async (req, res) => {
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
    let CategoryData = await Category.find(searchVal).sort({ _id: -1 });

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
      data: err.toString(),
    };
    res.status(200).send(message);
  }
});
/**
 * This method is to detail category  list
 *  @param str categoryId
 */
ProductRoute.get(
  "/childcategories/:categoryId",
  isAuthenticate,
  async (req, res) => {
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

      if (categoryData) {
        categoryData.child0 = subCategories;
      } else {
        categoryData = {};
      }

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
        data: err.toString(),
      };
      res.status(200).send(message);
    }
  }
);
/*
 ** Get GTS Product List
 */
ProductRoute.get("/gts", isAuthenticate, async (req, res) => {
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

    /* query params for search or filter */
    let searchText = req.query.search;
    let catId = req.query.catId;
    let subcat0Id = req.query.subcat0Id;
    let subcat1Id = req.query.subcat1Id;

    let searchBy = {
      $and: [{ status: true }],
    };
    if (searchText) {
      searchBy.$and.push({
        $or: [
          { title: { $regex: searchText, $options: "i" } },
          { partNo: { $regex: searchText, $options: "i" } },
        ],
      });
    }

    if (catId) {
      searchBy.$and.push({ catId: catId });
    }
    if (subcat0Id) {
      searchBy.$and.push({ subcat0Id: subcat0Id });
    }
    if (subcat1Id) {
      searchBy.$and.push({ subcat1Id: subcat1Id });
    }

    console.log(searchBy);

    let prodList = await Product.find(searchBy)
      .select(
        "title partNo catId subcat0Id subcat1Id retailerPrice retailerDiscountedPrice "
      )
      .sort({ _id: -1 });

    let countData = prodList.length;

    message = {
      error: false,
      message: "GTS Product List",
      data: { countData, prodList },
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

ProductRoute.get("/gts2", async (req, res) => {
  try {
    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */

    /* query params for search or filter */
    let searchText = req.query.search;
    let catId = req.query.catId;
    let subcat0Id = req.query.subcat0Id;
    let subcat1Id = req.query.subcat1Id;

    let searchBy = {
      $and: [{ status: true }],
    };
    if (searchText) {
      searchBy.$and.push({
        $or: [
          { title: { $regex: searchText, $options: "i" } },
          { partNo: { $regex: searchText, $options: "i" } },
        ],
      });
    }

    if (catId) {
      searchBy.$and.push({ catId: catId });
    }
    if (subcat0Id) {
      searchBy.$and.push({ subcat0Id: subcat0Id });
    }
    if (subcat1Id) {
      searchBy.$and.push({ subcat1Id: subcat1Id });
    }

    console.log(searchBy);

    let prodList = await Product.find(searchBy)
      .select(
        "title partNo catId subcat0Id subcat1Id retailerPrice retailerDiscountedPrice "
      )
      .sort({ _id: -1 });

    let countData = prodList.length;

    message = {
      error: false,
      message: "GTS Product List",
      data: { countData, prodList },
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
 ** List Product
 */
ProductRoute.get("/list", isAuthenticate, async (req, res) => {
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
    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */

    let searchText = req.query.search;
    let catId = req.query.catId;
    let subcat0Id = req.query.subcat0Id;
    let subcat1Id = req.query.subcat1Id;

    let searchBy = {
      $and: [{ status: true }, { isDelete: { $ne: true } }],
    };
    if (searchText) {
      searchBy.$and.push({
        $or: [
          { title: { $regex: searchText, $options: "i" } },
          { partNo: { $regex: searchText, $options: "i" } },
        ],
      });
    }

    if (catId) {
      searchBy.$and.push({ catId: catId });
    }
    if (subcat0Id) {
      searchBy.$and.push({ subcat0Id: subcat0Id });
    }
    if (subcat1Id) {
      searchBy.$and.push({ subcat1Id: subcat1Id });
    }

    // const proData = await Product.find(searchBy);

    // let prodIds = proData.map(e => e._id.toString());
    // console.log("prodIds",prodIds);

    let proids = [];
    if (searchBy) {
      let proData = await Product.find(searchBy);
      //console.log(proData.length);
      proData = JSON.parse(JSON.stringify(proData));

      for (var i in proData) {
        proids.push(proData[i]._id);
      }
    }

    // console.log("proids",proids);

    if (proids.length > 0) {
      let product = await RetailerProduct.find({
        $and: [{ retailerId: retailerId }, { proId: { $in: proids } }],
      })
        .populate([
          {
            path: "proId",
            select:
              "title catId subcat0Id subcat1Id mrp retailerDiscountedPrice retailerPricePercentage customerDiscountedPrice customerPricePercentage partNo pro_no images",
            populate: [
              {
                path: "catId",
                select: "title",
              },
              {
                path: "subcat0Id",
                select: "title",
              },
              {
                path: "subcat1Id",
                select: "title",
              },
            ],
          },
        ])
        .sort({ _id: -1 });

      let OrderData = await Order.find({ status: "delivered" });

      const allData = [...product, ...OrderData];

      message = {
        error: false,
        message: "My all products",
        data: allData,
      };
      return res.status(200).send(message);
    } else {
      message = {
        error: true,
        message: "Product not found",
        data: {},
      };
      return res.status(200).send(message);
    }
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
 ** List Product respect to brandID
 */

ProductRoute.get("/listby-brandId", isAuthenticate, async (req, res) => {
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
    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */

    let brandId = req.query.brandId;

    let searchBy = {
      $and: [{ status: true }],
    };
    if (brandId) {
      searchBy.$and.push({ brandId: brandId });
    }

    let proids = [];
    if (searchBy) {
      let proData = await Product.find(searchBy);
      //console.log(proData.length);
      proData = JSON.parse(JSON.stringify(proData));

      for (var i in proData) {
        proids.push(proData[i]._id);
      }
    }
    if (proids.length > 0) {
      let product = await RetailerProduct.find({
        $and: [{ retailerId: retailerId }, { proId: { $in: proids } }],
      })
        .populate([
          {
            path: "proId",
            select:
              "title catId subcat0Id subcat1Id mrp retailerDiscountedPrice retailerPricePercentage customerDiscountedPrice customerPricePercentage partNo pro_no images brandId",
            populate: [
              {
                path: "catId",
                select: "title",
              },
              {
                path: "subcat0Id",
                select: "title",
              },
              {
                path: "subcat1Id",
                select: "title",
              },
              {
                path: "brandId",
                select: "title",
              },
            ],
          },
        ])
        .sort({ _id: -1 });

      message = {
        error: false,
        message: "product list",
        data: product,
      };
      return res.status(200).send(message);
    } else {
      message = {
        error: true,
        message: "Product not found",
        data: {},
      };
      return res.status(200).send(message);
    }
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
 ** Details Product
 */
ProductRoute.get("/:id", isAuthenticate, async (req, res) => {
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
    const product = await RetailerProduct.findOne({ _id: req.params.id });
    message = {
      error: false,
      message: "Product details",
      data: product,
    };
    return res.status(200).send(message);
  } catch (err) {
    if (err.name === "CastError") {
      let errors =
        "Unknown value '" +
        err.value +
        "' " +
        err.kind +
        " as product " +
        err.path +
        " to map";

      message = {
        error: true,
        message: "Operation failed",
        data: errors,
      };

      return res.status(400).send(message);
    }
    return res.status(500).send(err);
  }
});

// /*
// ** Delete Product
// */
ProductRoute.delete("/delete/:id", isAuthenticate, async (req, res) => {
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

    // const result = await RetailerProduct.deleteOne({_id:req.params.id});
    // resultStock = await RetailerStock.deleteMany({proId:req.params.id});

    // if(result.deletedCount == 1){
    //     message = {
    //         error: false,
    //         message: "Product deleted successfully",
    //         data: {}
    //     }
    //     return res.status(200).send(message)
    // } else {
    //     message = {
    //         error: true,
    //         message: "No product found",
    //         data: {}
    //     }
    //     return res.status(200).send(message)
    // }
    const result = await RetailerProduct.findByIdAndUpdate(
      req.params.id,
      { $set: { isDelete: true } },
      { new: true, strict: false }
    );
    await RetailerStock.deleteMany({ proId: req.params.id });
    return res.status(200).json({ message: "Deleted", status: 200, result });
  } catch (err) {
    if (err.name === "CastError") {
      let errors =
        "Unknown value '" +
        err.value +
        "' " +
        err.kind +
        " as product " +
        err.path +
        " to map";

      message = {
        error: true,
        message: "Operation failed",
        data: errors,
      };

      return res.status(400).send(message);
    }
    return res.status(500).send(err);
  }
});

module.exports = ProductRoute;
