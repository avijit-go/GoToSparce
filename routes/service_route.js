const router = require("express").Router();
const mongoose = require("mongoose");
const Service = require("../models/service_model")

/* Create a new service */
router.post("/create", async(req, res, next) => {
    try {
       let totalPrice = 0;
       let productList = [];
    //    for(let i=0; i<req.body.products.length; i++) {
    //     totalPrice += req.body.products[i].price;
    //     productList.push(req.body.products[i]._id);
    //    } 
    /* Calculate GST */
    // const result = (totalPrice * Number(process.env.GST_AMOUNT)) / 100;
    const newService = Service({
        _id: new mongoose.Types.ObjectId(),
        user: req.body.user,
        car: req.body.car,
        brand: req.body.brand,
        service_date: req.body.service_date,
        service_time: req.body.service_time,
        location: req.body.location,
        pickup_drop: req.body.pickup_drop
    });
    let serviceData = await newService.save();
    serviceData = await serviceData.populate({path: "user", select: "fname lname email mobile"})
    serviceData = await serviceData.populate({path: "car", select: "title image brand_name"});
    // serviceData = await serviceData.populate("products");
    return res.status(200).json({message: "A new service has been created", status: 201, service: serviceData})
    } catch (error) {
       next(error) 
    }
});

/* Get list of all services */
router.get("/list", async(req, res, next) => {
    try {
       const page = Number(req.query.page) || 1;
       const limit = Number(req.query.limit)|| 10;
       const searchType = req.query.searchType ? {status: req.query.searchType} : {};
       
       const data = await Service.find({$and: [searchType, {user: req.params.userId}]})
        .populate({path: "user", select: "fname lname email mobile"})
        .populate({path: "car", select: "title image brand_name"})
        .populate("products")
        .sort({createdAt: -1})
        .limit(limit)
        .skip(limit*(page-1));
        return res.status(200).json({message: "Get list of services", status: 200, services: data});
    } catch (error) {
       next(error) 
    }
})

/* Get list of user services */
router.get("/user-list/:userId", async(req, res, next) => {
    try {
        if(!req.params.userId) {
            return res.status(200).json({message: 'Request parameter is not present'});
        }
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit)|| 10;
        const searchType = req.query.searchType ? {status: req.query.searchType} : {};
        const query = { $and: [searchType, { user: req.params.userId }] };
        const data = await Service.find(query)
        .populate({path: "user", select: "fname lname email mobile"})
        .populate({path: "car", select: "title image brand_name"})
        .populate("products")
        .sort({createdAt: -1})
        .limit(limit)
        .skip(limit*(page-1));
         return res.status(200).json({message: "Get list of user services", status: 200, services: data})
    } catch (error) {
       next(error) 
    }
});

/* Update service status */
router.put("/status/:serviceId", async(req, res, next) => {
    try {
        if(!req.params.serviceId) {
            return res.status(200).json({message: 'Invalid service id', status: 400});
        }
        if(!req.query.status) {
            return res.status(200).json({message: 'Invalid sstatus type', status: 400});
        }
        const data = await Service.findByIdAndUpdate(req.params.serviceId, {$set: {status: req.query.status}}, {new: true});
        return res.status(200).json({message: "Service status has been updated", status: 200, service: data})
    } catch (error) {
       next(error) 
    }
});

/* Search service */
router.get("/search-service", async(req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit)|| 10;
        const searchKey = req.query.vehicle_number ? { vehicle_number: { $regex: req.query.vehicle_number, $options: "i" } } : {};
        
        const data = await Service.find({searchKey})
         .populate({path: "user", select: "fname lname email mobile"})
         .populate({path: "car", select: "title image brand_name"})
         .populate("products")
         .sort({createdAt: -1})
         .limit(limit)
         .skip(limit*(page-1));
    } catch (error) {
       next(error) 
    }
});

/* Create a service price */
router.post("/create-price", async(req, res, next) => {
    try {
        const {products, pickup} = req.body;
        let total_product_cost = 0;
        for(let i=0; i<products.length; i++) {
            total_product_cost += products[i].price;
        }
        total_product_cost = Number(total_product_cost.toFixed(2));
        let GST_COST = ((total_product_cost * Number(process.env.GST_AMOUNT)) / 100);
        GST_COST = Number(GST_COST.toFixed(2));
        let total_cost = 0;
        if(pickup) {
            total_cost = total_product_cost + GST_COST + Number(process.env.SERVICE_CHARGE) + 100;
        } else {
            total_cost = total_product_cost + GST_COST + Number(process.env.SERVICE_CHARGE);
        }
        return res.status(200).json({message: "Total product cost", status: 200, cost: {"product_cost": total_product_cost, "GST_cost": GST_COST, "Total_cost": total_cost, "Pickup_charge": 100, "Service_charge": Number(process.env.SERVICE_CHARGE)}});

    } catch (error) {
        next(error);
    }
});

module.exports = router;