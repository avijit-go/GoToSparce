/** @format */

require("dotenv").config();
const express = require("express");
const Order = require("../models/order");
const Cart = require("../models/cart");
const CartProduct = require("../models/cartproducts");
const OrderRoute = express.Router();
const isAuthenticate = require("../middleware/authcheck"); /* For User (wholesaler or vehicle owener) */
const UserId = require("../helper/getUserToken");
const Stock = require("../models/stock");
const Address = require("../models/address");
const moment = require("moment-timezone");

/**
 * This method is used to create Order
 */
OrderRoute.post("/create", isAuthenticate, async (req, res) => {
  try {
    var headers = req.headers;
    var token = headers.authorization.split(" ")[1];

    var user = UserId(token);
    var userId = user.data._id;
    // let cartData = await Cart.find({user_id:userId});
    let cartProductData = await CartProduct.find({ user_id: userId });

    if (cartProductData.length == 0) {
      message = {
        error: false,
        message: "No cart items found",
        data: {},
      };
      return res.status(200).send(message);
    }

    let orderDetailsArray = [];
    let cartData = await Cart.findOne({ user_id: userId });
    let orderPrice = cartData.totalPrice;
    for (var i in cartProductData) {
      const orderDetails = {
        proId: cartProductData[i].proId,
        price: cartProductData[i].prodPrice,
        qty: cartProductData[i].quantity,
        total_pro_price: cartProductData[i].totalPrice,
      };
      orderDetailsArray.push(orderDetails);
    }
    var orderData = {
      userId: userId,
      addressId: req.body.addressId,
      order_price: orderPrice,
      order_details: orderDetailsArray,
    };
    let addressdata = await Address.findOne({ _id: req.body.addressId });
    if (addressdata) {
      if (addressdata.user_id == userId) {
        req.body.userId = userId;
        req.body.address = addressdata.address;
        req.body.lat = addressdata.lat;
        req.body.long = addressdata.long;
        req.body.land_mark = addressdata.land_mark;
        req.body.state = addressdata.state;
        req.body.city = addressdata.city;
        req.body.pin_code = addressdata.pin_code;
      } else {
        message = {
          error: true,
          message: "This address is not your",
          data: {},
        };
        return res.status(200).send(message);
      }
    } else {
      message = {
        error: true,
        message: "No address found",
        data: {},
      };
      return res.status(200).send(message);
    }

    console.log(orderDetailsArray);
    console.log(orderData);
    // return res.send('Hi');

    const result = await Order.create(orderData);
    /* delete cart data */
    await Cart.deleteOne({ user_id: userId });
    await CartProduct.deleteMany({ user_id: userId });

    /* stock out entry */
    for (var i in orderDetailsArray) {
      let stockoutData = {
        proId: orderDetailsArray[i].proId,
        stock_type: "stock_out",
        count: orderDetailsArray[i].quantity,
        id_ref: result._id,
        id_type: "orders",
        date: new Date(),
      };
      await Stock.create(stockoutData);
    }

    message = {
      error: false,
      message: "Order Added Successfully!",
      data: result,
    };
    return res.status(200).send(message);
  } catch (err) {
    message = {
      error: true,
      message: "Operation Failed",
      data: err.toString(),
    };
    return res.status(200).send(message);
  }
});

/**
 * Payment status change
 */
OrderRoute.patch("/payment-status", isAuthenticate, async (req, res) => {
  try {
    var headers = req.headers;
    var token = headers.authorization.split(" ")[1];

    var user = UserId(token);
    var userId = user.data._id;
    let paymentbody = {
      payment_status: "unpaid",
      paid_amount: 0,
      payment_gateway_id: req.body.amount,
    };
    if (req.body.status == true) {
      paymentbody = {
        payment_status: "paid",
        paid_amount: req.body.amount,
        payment_gateway_id: req.body.payment_gateway_id,
      };
    }

    const orderData = await Order.findOneAndUpdate(
      { _id: req.body.orderId },
      paymentbody,
      { new: true }
    );
    if (!orderData)
      return res.status(200).send({ error: true, message: "order not found" });
    return res
      .status(200)
      .send({
        error: false,
        message: "order payment status changed",
        orderData,
      });
  } catch (err) {
    message = {
      error: true,
      message: "Operation Failed",
      data: err.toString(),
    };
    return res.status(200).send(message);
  }
});

/*
 * Order History *
 */
OrderRoute.get("/list", isAuthenticate, async (req, res) => {
  try {
    var headers = req.headers;
    var token = headers.authorization.split(" ")[1];

    var user = UserId(token);
    var userId = user.data._id;

    var orderData = await Order.find(
      { userId: userId },
      { isDelete: { $ne: true } }
    )
      .populate([
        { path: "order_details.proId", select: "title partNo origin" },
        { path: "userId", select: "fname" },
      ])
      .sort({ _id: -1 });

    message = {
      error: false,
      message: "My orders",
      data: orderData,
    };
    return res.status(200).send(message);
  } catch (err) {
    message = {
      error: true,
      message: "Operation Failed",
      data: err.toString(),
    };
    return res.status(200).send(message);
  }
});
/*
 * Order Details *
 */
OrderRoute.get("/:orderId", isAuthenticate, async (req, res) => {
  try {
    var headers = req.headers;
    var token = headers.authorization.split(" ")[1];

    var user = UserId(token);
    var userId = user.data._id;

    var orderId = req.params.orderId;
    let orderData = await Order.findOne({ _id: orderId }).populate([
      {
        path: "order_details.proId",
        select: "",
        populate: [
          { path: "catId", select: "title" },
          { path: "subcat0Id", select: "title" },
          // {path:"makeId", select: "title" },
          { path: "brandId", select: "title" },
          // {path:"modelId", select: "title" },
          // {path:"yearId", select: "title" }
        ],
      },
      { path: "addressId", select: "" },
      {
        path: "userId",
        select: "fname lname address city pin_code",
      },
    ]);
    let totalMrp = 0;

    orderData.order_details.forEach((element, index) => {
      totalMrp += element.qty * element.proId?.mrp;
    });

    console.log(totalMrp);

    let total_discount_price = totalMrp - orderData?.order_price;

    console.log(total_discount_price);

    console.log(orderData?.createdAt);

    let delivary_date = moment(orderData?.createdAt).add(48, "hours").format();
    console.log(delivary_date);

    // if(orderData.userId != userId){
    //     message = {
    //         error: true,
    //         message: "This order is not yours",
    //         data: {}
    //     }
    //     return res.status(200).send(message);
    // }
    orderData = JSON.parse(JSON.stringify(orderData));
    orderData.totalMrp = totalMrp;
    orderData.total_discount_price = total_discount_price;
    orderData.delivary_date = delivary_date;

    message = {
      error: false,
      message: "Order Details",
      data: orderData,
    };

    return res.status(200).send(message);
  } catch (err) {
    message = {
      error: true,
      message: "Operation Failed",
      data: err.toString(),
    };
    return res.status(200).send(message);
  }
});

/*OrderRoute.post("/search", async(req,res) => {
    try{
        const searchText = req.body.searchText;
        var orderData = await Order.find({}).populate([
            { 
                path: 'userId', 
                select: 'fname lname email mobile register_with', 
                match: { $or: [
                    {"fname": {"$regex": searchText, $options: 'i'}},
                    {"lname": {"$regex": searchText, $options: 'i'}},
                    {"email": {"$regex": searchText, $options: 'i'}},
                    {"mobile": {"$regex": searchText, $options: 'i'}},
                    {"register_with": {"$regex": searchText, $options: 'i'}}
                ]}
            }
        ]);

        const results = orderData.filter(e => {
           return e.userId != null;
         });
        message = {
            error: false,
            message:"results",
            data:results 
        };
        return res.status(200).send(message);

    }catch(err){
        message = {
            error: true,
            message:"Operation Failed",
            data: err
        }
        return res.status(200).send(message);
    }
})*/

OrderRoute.patch("/update/:orderId", isAuthenticate, async (req, res) => {
  try {
    var headers = req.headers;
    var token = headers.authorization.split(" ")[1];

    var user = UserId(token);
    var userId = user.data._id;

    let orderDeliveryDate = new Date();
    let orderDataBody = { status: req.body.status };
    if (req.body.status == "delivered") {
      orderDataBody = {
        orderDeliveryDate: orderDeliveryDate,
        status: req.body.status,
      };
    }

    const orderData = await Order.findOneAndUpdate(
      { _id: req.params.orderId },
      orderDataBody,
      { new: true }
    );

    message = {
      error: true,
      message: "order status update",
      data: orderData,
    };
    return res.status(200).send(message);
  } catch (err) {
    message = {
      error: false,
      message: "Operation Failed",
      data: err,
    };
    return res.status(200).send(message);
  }
});

OrderRoute.delete("/delete/:id", async (req, res) => {
  const updatedOrder = await CartProduct.findByIdAndUpdate(
    req.params.id,
    { $set: { isDelete: true } },
    { new: true, strict: false }
  );
  return res
    .status(200)
    .json({ message: "Deleted order", status: 200, wishlist: updatedOrder });
});

module.exports = OrderRoute;
