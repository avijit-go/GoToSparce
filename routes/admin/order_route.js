require("dotenv").config();
const express = require("express");
const Order = require("../../models/order");
const OrderRoute = express.Router();
const isAuthenticate = require("../../middleware/authcheck");  /* GTS Admin */
const RetailerOrderSupplier = require("../../models/retailerordersupplier");
const RetailerSupplier = require("../../models/retailersupplier")

/*
** List Orders
*/
OrderRoute.get("/list", isAuthenticate, async(req,res) => {
    try{
        let searchText = req.query.search;
        let customerType = req.query.customerType;
        let searchOrderNo = searchCustomer = {}
        if(searchText && customerType){
            
            searchCustomer = {
                $or:[
                    {"fname": {"$regex": searchText, $options: 'i'}},
                    {"lname": {"$regex": searchText, $options: 'i'}},
                    {"email": {"$regex": searchText, $options: 'i'}},
                    {"mobile": {"$regex": searchText, $options: 'i'}},
                ],
                $and:[
                    {"register_with": {"$regex": customerType, $options: 'i'}},
                ]
            }
        }
        if(!searchText && customerType){
            searchCustomer = {
                $and:[
                    {register_with:customerType},
                ]
            }
        }
        
        let orderData = await Order.find().populate(
            [
                {
                    path: "userId", 
                    select: "fname lname email register_with mobile ",
                    match: searchCustomer
                }
            ]
        ).select('order_no createdAt order_price status').sort({_id:-1});

        const results = orderData.filter(e => {
            return e.userId != null;
        });
        
        message = {
            error: false,
            message: "All orders",
            data: results
        }
        return res.status(200).send(message)
    }catch(err){
        message = {
            error: true,
            message: "Operation failed",
            data: err
        }
        return res.status(200).send(message)
    }
});

OrderRoute.get("/prolist",isAuthenticate,async(req,res)=>{
    try{
        let supplierData = await RetailerSupplier.find({name:"GTS"});
        //console.log(supplierData);

        // let gtsId = supplierData?._id;
        // console.log(gtsId);

        let gtsIds = [];
        supplierData = JSON.parse(JSON.stringify(supplierData));
                       
        for(var i in supplierData){
            gtsIds.push(supplierData[i]._id);
        }
        let orderData = await RetailerOrderSupplier.find({supplierId:{$in:gtsIds}}).populate([
            {
                path:"supplierId",
                select:"name"
            },
            {
                path:"retailerId",
                select:"email mobile shopName"
            }
        ]).sort({_id: -1});

        message = {
            error:false,
            message:"All Order List",
            data:orderData
        }
        return res.status(200).send(message)
    } catch(err) {
        message = {
            error:true,
            message:"Operation Failed",
            data:err.toString()
        }
        return res.status(200).send(message)
    }
})

/*
Order Details
*/
OrderRoute.get("/:id", isAuthenticate, async(req,res) => {
    try{
        let orderData = await Order.findOne({_id:req.params.id}).populate([
            {
                path:"order_details.proId",
                select:"title catId",
                populate :{
                    path:"catId",
                    select:"title"
                }
            },
            {
                path:"userId",
                select:"fname lname register_with email mobile",
            }
        ]);
        
        message = {
            error: false,
            message: "Order details",
            data: orderData
        }
        return res.status(200).send(message)
    }catch(err){
        if(err.name === "CastError"){
            let errors = "Unknown value '"+err.value+"' "+err.kind+" to map";
      
            message = {
				error: true,
				message: "Operation failed",
                data: errors
			};
      
            return res.status(400).send(message);
        }        
        return res.status(500).send(err);
    }
})

/**
 * Order status update by admin
 */
OrderRoute.patch("/update/:orderId",isAuthenticate,async(req,res)=>{
    try{
        let orderDeliveryDate = new Date();
        let orderDataBody = {status: req.body.status};
        if (req.body.status == "delivered") {
            orderDataBody = {orderDeliveryDate: orderDeliveryDate, status: req.body.status}
        }

        const orderData = await Order.findOneAndUpdate({_id:req.params.orderId}, orderDataBody, {new:true});

        message = {
            error:true,
            message:"order status update",
            data:orderData
        }
        return res.status(200).send(message);

    }catch(err){
        message = {
            error:false,
            message:"Operation Failed",
            data:err
        }
        return res.status(200).send(message);
    }
})

OrderRoute.delete("/delete/:id",async(req,res)=>{
    try{
        const updatedUser = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: { isDelete: true } },
            { new: true, strict: false }
        );
        return res.status(200).json({message: "Deleted user", status: 200, wishlist: updatedUser})
    }catch(err){
        message = {
            error:false,
            message:"Operation Failed",
            data:err
        }
        return res.status(200).send(message);
    }
})

module.exports = OrderRoute;