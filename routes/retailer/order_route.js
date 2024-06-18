require("dotenv").config();
const express = require('express');
const OrderRoute = express.Router();
const isAuthenticate = require("../../middleware/authcheck");
const User = require("../../helper/getUserToken");
const Product = require("../../models/product");
const RetailerOrder = require("../../models/retailerorder")
const RetailerStock = require("../../models/retailerstock");
const RetailerCustomerAddress = require("../../models/retailercustomeraddress");
const RetailerProduct = require("../../models/retailerproduct");
const Category = require("../../models/category");
// const SubCategory = require("../../models/subcategory");
const RetailerJournal = require("../../models/retailerjournal");
const moment = require("moment-timezone");

/*
########################## Order for retailer customers ##############################
*/


/*
** Create Order 
*/
OrderRoute.post("/create", isAuthenticate, async(req,res) => {
    try{
        let headers = req.headers;
        let token = headers.authorization.split(' ')[1];
        let user = User(token);

        if(!user.data.register_with || user.data.register_with != 'wholesaler'){
            message = {
                error: true,
                message: "You are not logged in as Retailer",
                data: {}
            }
            return res.status(200).send(message)
        }
        const retailerId = user.data._id;
        let orderDate = new Date();
        console.log("You logged in as Retailer Id: <"+retailerId+"> , email: <"+user.data.email+">");
        /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */  
        /*
        ** Check retailer customer address exists
        */
        var customerId = req.body.customerId;
        var addressId = "";
        
        if(customerId){
            
            let customeraddress = await RetailerCustomerAddress.findOne({
                "$and":[{"customerId":customerId},{"is_primary":true}]
            });

            
            
            if(customeraddress == null){
                console.log(customeraddress)
                message = {
                    error: true,
                    message: "No address found for customer",
                    data: {}
                }
                return res.status(200).send(message)
            }
            addressId = customeraddress._id;
            
        } 
        /* ++++++++++++++++++++++++++++++++++++++++++++++++++++ */
        var orderPrice = 0;
        let items = req.body.items;
        let orderDetailsArray = [];
        for(var i in items){
            let retailerPro = await RetailerProduct.findOne({_id: items[i].proId}).populate([{path: "proId", select: "title"}]);
            if(!retailerPro) return res.status(200).send({error: true, message: "Product is invalid."})

            let retailerProStock = await RetailerStock.find({proId: retailerPro._id});
            let totalCount = retailerProStock.reduce( ( sum, {stock_type, quantity} ) => {
                console.log(stock_type, quantity);
                if(stock_type == 'stock_out') {
                    return (sum-quantity)
                } else {
                    return (sum+quantity)
                }
            }, 0)

            if(totalCount <= 0) return res.status(200).send({error: true, message: `${retailerPro.proId?.title} is out of stock`});

            let proId = retailerPro.proId._id;
            console.log("proId",proId);
            let proData = await Product.findOne({_id: proId}).select('title partNo catId subcat0Id subcat1Id mrp images');
            console.log(proData);

            var price = proData.mrp;
            var proTitle = proData.title;
            var proImage = proData.images[i];

            var catId = proData.catId;
            let getCat = await Category.findOne({_id:catId}).select('title');
            var catTitle = getCat.title;

            var subcatId = proData.subcat0Id;
            // let getSubcat = await SubCategory.findOne({_id:subcatId}).select('title');
            // var subcatTitle = getSubcat.title;

            
            var totalPrice = price * items[i].quantity;    
            orderPrice += totalPrice;

            const orderDetails =  {
                "proId": items[i].proId,
                "proTitle": proTitle,
                "proImage": proImage,
                "catId": catId,
                "subcatId": subcatId,
                "catTitle": catTitle,
                // "subcatTitle": subcatTitle,
                "price": price,
                "proImage": proImage,
                "quantity": items[i].quantity ,
                "totalPrice": totalPrice
            }
            orderDetailsArray.push(orderDetails);
        }

        console.log("Total price:- "+orderPrice)
        console.log(orderDetailsArray)
        let reqOrderData = {
            "retailerId": retailerId,
            "customerId": customerId,
            "addressId": addressId,
            "orderDate": orderDate,
            "orderNo": Date.now(),
            "orderPrice": orderPrice,
            "items": orderDetailsArray
        }
        let result = await RetailerOrder.create(reqOrderData);

        /* Entry Stock Log ... multiple entry */
        for(var i in orderDetailsArray){
            let reqStockOut = {
                "retailerId": retailerId,
                "proId": orderDetailsArray[i].proId,
                "proTitle":orderDetailsArray[i].proTitle,
                "catId": orderDetailsArray[i].catId,
                "subcatId": orderDetailsArray[i].subcatId,
                "entryDate": orderDate,
                "stock_type": "stock_out",
                "quantity": orderDetailsArray[i].quantity,
                "reference_type": "customer_order",
                "customerorderId": result._id
            }
            await RetailerStock.create(reqStockOut)
        } 
        /* Entry Journal Log */
        let journalData = {
            retailerId: retailerId,
            orderId: result._id,
            type: "income",
            entryDate: orderDate,
            amount: orderPrice
        }  
        await RetailerJournal.create(journalData)     
        
        message = {
            error: false,
            message: "Order created for customer successfully",
            data: result
        }
        return res.status(200).send(message)

    }catch(err){
        message = {
            error: true,
            message: "Operation failed",
            data: err.toString()
        }
        return res.status(200).send(message)
    }
})

/*
** List Order 
*/
OrderRoute.get("/list", isAuthenticate, async(req,res) => {
    try{
        let headers = req.headers;
        let token = headers.authorization.split(' ')[1];
        let user = User(token);

        if(!user.data.register_with || user.data.register_with != 'wholesaler'){
            message = {
                error: true,
                message: "You are not logged in as Retailer",
                data: {}
            }
            return res.status(200).send(message)
        }
        const retailerId = user.data._id;
        console.log("You logged in as Retailer Id: <"+retailerId+"> email: <"+user.data.email+">");
        /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
        
        var searchText = req.query.search;
        var searchAnd = [
            {}
        ];
        if(searchText){
            searchAnd = [
                {fname: {$regex: searchText, $options: 'i'}},
                {lname: {$regex: searchText, $options: 'i'}},
                {email: {$regex: searchText, $options: 'i'}},
                {phoneNo: {$regex: searchText, $options: 'i'}}
            ]
        }
        let orderData = await RetailerOrder.find({retailerId:retailerId})
        .populate(
            [
                {
                    path:"customerId", 
                    select: "fname lname email phoneNo", 
                    match: { $or: searchAnd } 
                }
            ]
        )        
        .sort({_id:-1})
        /*.select("retailerId customerId orderDate orderNo amount items.proId items.proImage items.proTitle items.catTitle items.subcatTitle items.quantity items.price items.totalPrice")*/

        const resData = orderData.filter(e => {
            return e.customerId != null;
        })


        message = {
            error: false,
            message: "My all orders",
            data: resData
        }
        return res.status(200).send(message)
    }catch(err){
        message = {
            error: true,
            message: "Operation failed",
            data: err.toString()
        }
        return res.status(200).send(message)
    }
});


/*
** List Order by customerId
*/
OrderRoute.get("/list-by-customerId/:customerId", isAuthenticate, async(req,res) => {
    try{
        let headers = req.headers;
        let token = headers.authorization.split(' ')[1];
        let user = User(token);

        if(!user.data.register_with || user.data.register_with != 'wholesaler'){
            message = {
                error: true,
                message: "You are not logged in as Retailer",
                data: {}
            }
            return res.status(200).send(message)
        }
        const retailerId = user.data._id;
        console.log("You logged in as Retailer Id: <"+retailerId+"> email: <"+user.data.email+">");
        /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
        
        var searchText = req.query.search;
        var searchAnd = [
            {}
        ];
        if(searchText){
            searchAnd = [
                {fname: {$regex: searchText, $options: 'i'}},
                {lname: {$regex: searchText, $options: 'i'}},
                {email: {$regex: searchText, $options: 'i'}},
                {phoneNo: {$regex: searchText, $options: 'i'}}
            ]
        }
        let orderData = await RetailerOrder.find({$and:[{retailerId:retailerId},{customerId:req.params.customerId}]})
        .populate(
            [
                {
                    path:"customerId", 
                    select: "fname lname email phoneNo", 
                    match: { $or: searchAnd } 
                }
            ]
        )        
        .sort({_id:-1})
        /*.select("retailerId customerId orderDate orderNo amount items.proId items.proImage items.proTitle items.catTitle items.subcatTitle items.quantity items.price items.totalPrice")*/

        const resData = orderData.filter(e => {
            return e.customerId != null;
        })


        message = {
            error: false,
            message: "My all orders",
            data: resData
        }
        return res.status(200).send(message)
    }catch(err){
        message = {
            error: true,
            message: "Operation failed",
            data: err.toString()
        }
        return res.status(200).send(message)
    }
})

/*
** Details Order
*/
OrderRoute.get("/:id", isAuthenticate, async(req,res) => {
    try{
        let headers = req.headers;
        let token = headers.authorization.split(' ')[1];
        let user = User(token);

        /* +++++++++++Check logged in as retailer or not ++++++ */
        if(!user.data.register_with || user.data.register_with != 'wholesaler'){
            message = {
                error: true,
                message: "You are not logged in as Retailer",
                data: {}
            }
            return res.status(200).send(message)
        }
        const retailerId = user.data._id;
        let orderDate = new Date();
        console.log("You logged in as Retailer Id: <"+retailerId+"> , email: <"+user.data.email+">");
        /* +++++++++++++++++++++++++++++++++++++++++++++++++++ */
        let orderData = await RetailerOrder.findOne({_id:req.params.id}).populate(
            [
                {path: "customerId", select: "fname lname email phoneNo"},
                {path: "addressId", select: "phoneNo address"}
            ]
        );

        console.log(orderData?.createdAt);

        let delivary_date =  moment(orderData?.createdAt).add(48, 'hours').format();
        console.log(delivary_date);

        orderData = JSON.parse(JSON.stringify(orderData))
        orderData.delivary_date = delivary_date


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

/*
** Status change of an Order
*/
OrderRoute.patch("/status-change/:id", isAuthenticate, async(req,res) => {
    try{
        let headers = req.headers;
        let token = headers.authorization.split(' ')[1];
        let user = User(token);

        /* +++++++++++Check logged in as retailer or not ++++++ */
        if(!user.data.register_with || user.data.register_with != 'wholesaler'){
            message = {
                error: true,
                message: "You are not logged in as Retailer",
                data: {}
            }
            return res.status(200).send(message)
        }
        const retailerId = user.data._id;
        let orderDeliveryDate = new Date();
        console.log("You logged in as Retailer Id: <"+retailerId+"> , email: <"+user.data.email+">");
        /* +++++++++++++++++++++++++++++++++++++++++++++++++++ */
        let orderDataBody = {status: req.body.status};
        if (req.body.status == "completed") {
            orderDataBody = {orderDeliveryDate: orderDeliveryDate, status: req.body.status}
        }
        let orderData = await RetailerOrder.findOneAndUpdate({_id:req.params.id, retailerId: retailerId}, orderDataBody);

        console.log(orderData?.createdAt);

        let delivary_date =  moment(orderData?.createdAt).add(48, 'hours').format();
        console.log(delivary_date);

        orderData = JSON.parse(JSON.stringify(orderData))
        orderData.delivary_date = delivary_date


        message = {
            error: false,
            message: "Order status update"
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


/*
** Delete Order 
*  Delete Order and Order products 
*/
OrderRoute.delete("/:id", async(req,res) => {
    try{
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
        // const retailerId = user.data._id;
        // console.log("You logged in as Retailer Id: <"+retailerId+"> , email: <"+user.data.email+">");
        // /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
        
        // resultOrder = await RetailerOrder.deleteOne({_id:req.params.id});
        // resultStock = await RetailerStock.deleteMany({customerorderId:req.params.id});
        // resultJournal = await RetailerJournal.deleteOne({orderId:req.params.id});

        // if(resultOrder.deletedCount == 1){
        //     message = {
		// 		error: false,
		// 		message: "Order and order all items deleted successfully",
        //         data: {}
		// 	};
      
        //     return res.status(200).send(message);
        // }else{
        //     message = {
		// 		error: true,
		// 		message: "Order not found",
        //         data: {}
		// 	};
      
        //     return res.status(200).send(message);
        // }
        const result = await RetailerOrder.findByIdAndUpdate(
            req.params.id,
            { $set: { isDelete: true } },
            { new: true, strict: false }
        );
        // resultJournal = await RetailerJournal.updateOne({orderId:req.params.id});
        return res.status(200).json({message: "Deleted", status: 200, result})
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

module.exports = OrderRoute;