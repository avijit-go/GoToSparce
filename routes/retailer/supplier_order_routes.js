require("dotenv").config();
const express = require('express');
const SupplierOrderRoute = express.Router();
const isAuthenticate = require("../../middleware/authcheck");
const User = require("../../helper/getUserToken");
const RetailerProduct = require("../../models/retailerproduct");
const Product = require("../../models/product");
const Category = require("../../models/category");
// const SubCategory = require("../../models/subcategory");
const RetailerOrderSupplier = require("../../models/retailerordersupplier");
const RetailerStock = require("../../models/retailerstock");
const RetailerJournal = require("../../models/retailerjournal");
const RetailerSales = require("../../models/retailersales");
const moment = require("moment-timezone");
const Stock = require("../../models/stock");
const RetailerOrderComplaint = require("../../models/retailerordersupplier_complaint");
const RetailerSupplier = require("../../models/retailersupplier");
const path = require("path");
const fs = require("fs");
const { generateInvoicePdf } = require('../../utils/pdf-generator');
const nodemailer = require('nodemailer');

/*
** Create Order request for Supplier
*/
SupplierOrderRoute.post("/create", isAuthenticate, async(req,res) => {
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
        var orderPrice = 0;
        //let items = req.body.items;
        let orderDetailsArray = [];

        // Checking the supplier is GTS or non-GTS
        const supplierData = await RetailerSupplier.findOne({_id: req.body.supplierId})
        if(!supplierData) return res.status(200).send({error: true, message: 'Reatiler not found'})

        var items = req.body.items;
        items = JSON.parse(JSON.stringify(items));
        for(var i in items){
            let retailerPro = await RetailerProduct.findOne({_id:items[i].proId});
            let proId = retailerPro.proId;
            console.log("proId",proId);
            let proData = await Product.findOne({_id: proId}).select('title partNo catId subcat0Id subcat1Id mrp retailerDiscountedPrice');
            console.log(proData);

            var main_price = proData.mrp;
            var reatiler_discount_price = proData.retailerDiscountedPrice;
            var proTitle = proData.title;
            var proImage = proData.image;

            var catId = proData.catId;
            let getCat = await Category.findOne({_id:catId}).select('title');
            var catTitle = getCat.title;

            var subcatId = proData.subcat0Id;
            // let getSubcat = await SubCategory.findOne({_id:subcatId}).select('title');
            // var subcatTitle = getSubcat.title;

            if(items[i].discount_percentage != undefined) {
                var price = (reatiler_discount_price - (reatiler_discount_price * (items[i].discount_percentage/100)));
            
            } else {
                var price = reatiler_discount_price
            }
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
                "main_price": Number(main_price).toFixed(2),
                "price": Number(price).toFixed(2),
                "discount_percentage": items[i].discount_percentage ,
                "quantity": items[i].quantity ,
                "totalPrice": Number(totalPrice).toFixed(2)
            }
            orderDetailsArray.push(orderDetails);
        }
        
        console.log("Total price:- "+orderPrice)
        console.log(orderDetailsArray)

        const orderNo = Date.now()
        let reqOrderData = {
            "retailerId": retailerId,
            "supplierId": req.body.supplierId,
            "orderDate": orderDate,
            "orderNo": orderNo,
            "orderPrice": Number(orderPrice).toFixed(2),
            "items": orderDetailsArray,
            "isNoneGTSOrder": !supplierData.isGTSSupplier
        }
        let result = await RetailerOrderSupplier.create(reqOrderData);

        // mail sending logic goes here
        const fileName = orderNo + '.pdf'
        const filePath = path.join(__dirname, `../../uploads/invoices/${fileName}`);
    
        orderPrice = Number(orderPrice).toFixed(2)
        const invoiceDetails = { supplierData, orderDetailsArray, orderNo, orderPrice };
        generateInvoicePdf(invoiceDetails, filePath);

        var transport = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: "ce90aa62bf008b",
              pass: "b3a2d43f47b9a8"
            }
        });

        // var transport = nodemailer.createTransport({
        //     host: "mail.gotospares.com",
        //     port: 587,
        //     secureConnection: false,
        //     tls: {
        //         secure: false,
        //         ignoreTLS: true,
        //         rejectUnauthorized: false
        //     },
        //     auth: {
        //         user: "_mainaccount@gotospares.com",
        //         pass: "Z;0R1~5BYI87"
        //     },
        // });

        var mailOptions = {
            from: 'arpan@onenesstechs.in',
            to: user.data.email,
            subject: `Order placed from GTS #${orderNo}`,
            html: `
            <div style="width: 100%;">
                <p>A new Order with order no <b>#${orderNo}</b> has placed.</p>
                <p>
                    Order No: <b>${orderNo}</b><br/>
                    Order Amount: <b>${orderPrice}</b><br/>
                    Order Date: <b>${new Date().toDateString()}</b>
                </p>
                <p>
                    From: <b>${user.data.fname} ${user.data.lname}</b> | <span>Email: <a href="mailto:${user.data.email}">${user.data.email}</a></span> | <span>Mobile: <a href="tel:${user.data.mobile}">${user.data.mobile}</a></span>
                </p>
                <p><b>NB: Please check out attached invoice pdf for your referrence.</b></p>
                <hr/>
            </div>
            `,
            attachments: [
                { 
                    filename: fileName,
                    content: fs.createReadStream(filePath)
                }
            ]
        };
          
        transport.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
        });

        console.log("result",result);

        message = {
            error: false,
            message: "Supplier Order created successfully",
            data:result
        }

        return res.status(200).send(message);

    } catch(err) {
        message = {
            error: true,
            message: "Operation failed",
            data: err.toString()
        }

        return res.status(200).send(message);
    }
})

/*
** Confirm order and deliver from admin end
*/
SupplierOrderRoute.patch("/deliver-order/:supplierOrderId", isAuthenticate, async(req,res) => {
    try{

        var orderPrice = 0;
        //let items = req.body.items;
        let orderDetailsArray = [];
        let partialOrderDetails = Array()

        var items = req.body.items;
        items = JSON.parse(JSON.stringify(items));
        const checkOrderedItems = await RetailerOrderSupplier.findOne({_id: req.params.supplierOrderId})
        for(var i in items){
            let retailerPro = await RetailerProduct.findOne({_id:items[i].proId});
            let proId = retailerPro.proId;
            console.log("proId",proId);
            let proData = await Product.findOne({_id: proId}).select('title partNo catId subcat0Id subcat1Id mrp retailerDiscountedPrice');
            console.log(proData);

            var main_price = proData.mrp;
            var reatiler_discount_price = proData.retailerDiscountedPrice;
            var proTitle = proData.title;
            var proImage = proData.image;

            var catId = proData.catId;
            let getCat = await Category.findOne({_id:catId}).select('title');
            var catTitle = getCat.title;

            var subcatId = proData.subcat0Id;
            // let getSubcat = await SubCategory.findOne({_id:subcatId}).select('title');
            // var subcatTitle = getSubcat.title;

            if(items[i].discount_percentage != undefined) {
                var price = (reatiler_discount_price - (reatiler_discount_price * (items[i].discount_percentage/100)));
            
            } else {
                var price = reatiler_discount_price
            }
            var totalPrice = price * items[i].quantity;    
            orderPrice += totalPrice;

            const orderdItemsByRetailer = checkOrderedItems.items
            const orderdItemCheck = orderdItemsByRetailer.filter(e => e.proId == items[i].proId)[0]
            
            if(orderdItemCheck && orderdItemCheck.quantity > items[i].quantity) {
                var totalPriceForPartial = price * (orderdItemCheck.quantity - items[i].quantity);

                partialOrderDetails.push({
                    "proId": items[i].proId,
                    "proTitle": proTitle,
                    "proImage": proImage,
                    "catId": catId,
                    "subcatId": subcatId,
                    "catTitle": catTitle,
                    // "subcatTitle": subcatTitle,
                    "main_price": Number(main_price).toFixed(2),
                    "price": Number(price).toFixed(2),
                    "discount_percentage": items[i].discount_percentage,
                    "quantity": orderdItemCheck.quantity - items[i].quantity,
                    "totalPrice": Number(totalPriceForPartial).toFixed(2)
                })
            }

            if(items[i].quantity > 0) {
                const orderDetails =  {
                    "proId": items[i].proId,
                    "proTitle": proTitle,
                    "proImage": proImage,
                    "catId": catId,
                    "subcatId": subcatId,
                    "catTitle": catTitle,
                    // "subcatTitle": subcatTitle,
                    "main_price": Number(main_price).toFixed(2),
                    "price": Number(price).toFixed(2),
                    "discount_percentage": items[i].discount_percentage ,
                    "quantity": items[i].quantity ,
                    "totalPrice": Number(totalPrice).toFixed(2)
                }
                orderDetailsArray.push(orderDetails);
            }
        }

        // console.log("Total price:- "+orderPrice)
        // console.log(orderDetailsArray)
        const orderDeliveryDate = new Date()
        let partialDeliveryDate = new Date()
        partialDeliveryDate = partialDeliveryDate.setDate(partialDeliveryDate.getDate()+2)

        let reqOrderData = {
            "orderDeliveryDate": orderDeliveryDate,
            "deliverOrderPrice": orderPrice,
            "deliveredItems": orderDetailsArray,
            "partialDeliveredItems": partialOrderDetails,
            "partialDeliveryExpiresOn": partialOrderDetails.length ? partialDeliveryDate : undefined,
            "status": "completed"
        }

        // return res.status(200).send([reqOrderData])
        let retailerSupplierOrderData = await RetailerOrderSupplier.findOneAndUpdate({_id: req.params.supplierOrderId}, reqOrderData, {new: true});

        console.log("retailerSupplierOrderData >>>>>>>>>>>>>> ",retailerSupplierOrderData);

        
        /* Entry Admin Stock Log */
        let reqStockIn = []
        for(var i in orderDetailsArray){
            const retailerProductDetail = await RetailerProduct.findOne({_id: orderDetailsArray[i].proId})
            if (retailerProductDetail) {
                reqStockIn.push({
                    "proId": retailerProductDetail.proId,
                    "date": orderDeliveryDate,
                    "stock_type": "stock_out",
                    "count": orderDetailsArray[i].quantity,
                    "id_type": "retailerprofile",
                    "id_ref": retailerSupplierOrderData.retailerId
                })
            }
        }
        const stockinsert = await Stock.insertMany(reqStockIn)
        console.log("stockinsert >>>>>>>>>>>>>>>>> ", stockinsert);

        /* Entry Retailer Stock Log */
        let retailerStockIn = []
        for(var i in orderDetailsArray){
            retailerStockIn.push({
                "retailerId": retailerSupplierOrderData.retailerId,
                "proId": orderDetailsArray[i].proId,
                "proTitle":orderDetailsArray[i].proTitle,
                "catId": orderDetailsArray[i].catId,
                "subcatId": orderDetailsArray[i].subcatId,
                "entryDate": orderDeliveryDate,
                "stock_type": "stock_in",
                "quantity": orderDetailsArray[i].quantity,
                "reference_type": "supplier_order",
                "supplierorderId": retailerSupplierOrderData._id
            })
        }
        const reatilerstockinsert = await RetailerStock.insertMany(retailerStockIn)
        console.log("reatilerstockinsert >>>>>>>>>>>>>>>>> ", reatilerstockinsert);


        /* Sales Report */
        let retailerSales = []
        for(var i in orderDetailsArray){
            retailerSales.push({
                "retailerId": retailerSupplierOrderData.retailerId,
                "proId": orderDetailsArray[i].proId,
                "catId": orderDetailsArray[i].catId,
                "subcatId" : orderDetailsArray[i].subcatId,
                "orderDate": orderDeliveryDate,
                "quantity": orderDetailsArray[i].quantity,
                "price": price,
                "totalPrice": totalPrice

            })
        }
        const retailerSalesData = await RetailerSales.insertMany(retailerSales)
        console.log("retailerSalesData >>>>>>>>>>>>>>>>> ", retailerSalesData);

        //console.log(retailerSales);
        /* Entry Journal Log */
        let journalData = {
            retailerId: retailerSupplierOrderData.retailerId,
            type: "expense",
            entryDate: orderDeliveryDate,
            supplierorderId: retailerSupplierOrderData._id,
            amount: orderPrice
        }
        const retailerJournalData = await RetailerJournal.create(journalData);
        console.log("retailerJournalData >>>>>>>>>>>>>>>>> ", retailerJournalData);
        
        message = {
            error: false,
            message: "Supplier Order confirmed for deliver",
            data: retailerSupplierOrderData
        }

        return res.status(200).send(message);

    }catch(err){
        message = {
            error: true,
            message: "Operation failed",
            data: err.toString()
        }

        return res.status(200).send(message);
    }
})

/**
 * Update Supplier Order route
 */
SupplierOrderRoute.get("/update-quentity/:supplierOrderId",async(req,res)=>{
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
        // let supplierOrderData = await RetailerOrderSupplier.findOne({$and:[/*{retailerId:retailerId},*/{_id:req.params.supplierOrderId}]});

        // let supplierOrderIds = supplierOrderData.items.map(e => e.proId);
        
        // console.log(supplierOrderIds);
        
        // let stockData = await RetailerStock.findOne({proId:{$in:supplierOrderIds}});

        let supplierOrderData = await RetailerOrderSupplier.findOne({$and:[{_id:req.params.supplierOrderId}]});
        let supplierOrderIds = supplierOrderData.items.map(e => e.proId);
        console.log(supplierOrderIds);

        //console.log(stockData);

        let stockData = await RetailerStock.findOne({proId:{$in:supplierOrderIds}});
        let updateData = await RetailerStock.findOneAndUpdate({proId:{$in:supplierOrderIds}},{"items.quantity":req.body.items.quantity})
        
        //console.log("stockData",stockData);

        console.log("updateData",updateData);

        message = {
            error:false,
            data:supplierOrderData
        }
        return res.status(200).send(message);
    }catch(err){
        message = {
            error:true,
            message:"Operation Failed",
            data:err.toString()
        }
        return res.status(200).send(message);
    }
})



/*
** List Orders for Supplier
*/
SupplierOrderRoute.get("/list/:supplierId?",isAuthenticate,  async(req,res) => {
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
        const supplierId = req.params.supplierId;
        console.log("You logged in as Retailer Id: <"+retailerId+"> , email: <"+user.data.email+">");
        /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
        let orderData = []
        if(supplierId){
            orderData = await RetailerOrderSupplier.find({retailerId:retailerId,supplierId:supplierId}).populate([
                {
                    path:"supplierId",
                    select:"name"
                }
            ]).sort({_id:-1}); 

            message = {
                error: false,
                message: "Supplier all orders",
                data: orderData
            }
            return res.status(200).send(message);
        } else {
            orderData = await RetailerOrderSupplier.find({retailerId:retailerId}).populate([
                 {
                        path:"supplierId",
                        select:"name"
                }
                
            ]).sort({_id:-1});

            message = {
                error: false,
                message: "My all supplier orders",
                data: orderData
            }
            return res.status(200).send(message);
        }
        

        

    }catch(err){
        message = {
            error: true,
            message: "Operation failed",
            data: err.toString()
        }

        return res.status(200).send(message);
    }
})
/*
** Details Supplier Order
*/
SupplierOrderRoute.get("/:id", isAuthenticate, async(req,res) => {
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
        const supplierId = req.params.supplierId;
        console.log("You logged in as Retailer Id: <"+retailerId+"> , email: <"+user.data.email+">");
        /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
        
        let orderData = await RetailerOrderSupplier.findOne({_id:req.params.id}).populate(
            [
                {path: "supplierId", select: "name phoneNo email"},
                {
                    path:"retailerId",
                    select:"fname lname"

                }
            ]
        )

        let delivary_date =  moment(orderData?.createdAt).add(48, 'hours').format();
        console.log(delivary_date);

        orderData = JSON.parse(JSON.stringify(orderData))
        orderData.delivary_date = delivary_date

        message = {
            error: false,
            message: "Order details",
            data: orderData
        }
        return res.status(200).send(message);
        
        

        

    }catch(err){
        if(err.name === "CastError"){
            let errors = "Unknown value '"+err.value+"' "+err.kind+"  "+err.path+" to map";
      
            message = {
				error: true,
				message: "Operation failed",
                data: errors
			};
      
            return res.status(400).send(message);
        }
        return res.status(500).send(err);
    }
});


/*
** Update status Supplier Order
*/
SupplierOrderRoute.patch("/update-status/:id", isAuthenticate, async(req,res) => {
    try {
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
        /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
        const retailerId = user.data._id;
        req.body.retailerId = retailerId;
       
        let result = await RetailerOrderSupplier.findOneAndUpdate({_id:req.params.id},{status:req.body.status}, {new: true})

        orderData = await RetailerOrderSupplier.find({retailerId:retailerId}).populate([
            {
                path:"supplierId",
                select:"name"
            }
        ]).sort({_id:-1}); 

        if(orderData){
        message = {
            error: false,
            message: "Retailer Order Supplier updated successfully",
            data: orderData
        }
        return res.status(200).send(message);
    } else {
        message = {
            error: true,
            message: "Retailer Order Supplier not updated successfully"
        }
        return res.status(200).send(message);
    }

    } catch(err) {
        message = {
            error: true,
            message: "Operation failed",
            data: errors
        }
        return res.status(400).send(message);
    }
});

/*
** Update partial deliver Order status
*/
SupplierOrderRoute.patch("/update-delivery-status/:id", isAuthenticate, async(req,res) => {
    try {
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
        /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
        const retailerId = user.data._id;
        req.body.retailerId = retailerId;
       
        let orderData = await RetailerOrderSupplier.findOneAndUpdate({_id:req.params.id},{partiallyDeliverd: req.body.partiallyDeliverd}, {new: true}).populate([
            {
                path:"supplierId",
                select:"name"
            }
        ]).sort({_id:-1});

        if(orderData){
            message = {
                error: false,
                message: "Retailer Order Supplier updated successfully",
                data: orderData
            }
            return res.status(200).send(message);
        } else {
            message = {
                error: true,
                message: "Retailer Order Supplier not updated successfully"
            }
            return res.status(200).send(message);
        }

    } catch(err) {
        message = {
            error: true,
            message: "Operation failed",
            data: errors
        }
        return res.status(400).send(message);
    }
});

/*
** Update status
*/

// SupplierOrderRoute.patch("/change-status/:supplierOrderId", isAuthenticate, async(req,res) => {
//     try{
//         let headers = req.headers;
//         let token = headers.authorization.split(' ')[1];
//         let user = User(token);

//         if(!user.data.register_with || user.data.register_with != 'wholesaler'){
//             message = {
//                 error: true,
//                 message: "You are not logged in as Retailer",
//                 data: {}
//             }
//             return res.status(200).send(message)
//         }
//         /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
//         const retailerId = user.data._id;
//         req.body.retailerId = retailerId;
    
//         let orderData = await RetailerOrderSupplier.findOneAndUpdate({_id:req.params.supplierOrderId},{status:req.body.status},{new:true});

//         let result = orderData.status
//         console.log(result);

//         //if()

//         // if(orderData.status == "pending"){
//         //     let result = await RetailerOrderSupplier.findOneAndUpdate({_id:req.params.supplierOrderId}, { status: "completed" }, {new: true})

//         //     message = {
//         //         error: false,
//         //         message: "Status changed to completed",
//         //         data: result,
//         //     };
//         //     res.status(200).send(message);

//         // } else {
//         //     await RetailerOrderSupplier.findOneAndUpdate({_id:req.params.supplierOrderId}, { status: "cancelled" }, {new: true})



//             message = {
//                 error: false,
//                 message: "Status changed to cancelled",
//                 data: {},
//             };
//             res.status(200).send(message);
        
//     }catch(err){
//             message = {
//                 error: true,
//                 message: "Operation failed",
//                 data: errors
//             }
//             return res.status(400).send(message);
//         }
// })

/**
 * Complaint 
 */

/**
 * All list
 */
SupplierOrderRoute.get("/complaint/list", async (req, res, next) => {
    try {
        const complaintList = await RetailerOrderComplaint.find({}).sort({_id: -1})
        message = {
            error: false,
            message: "Complaint list",
            data: complaintList
        }
        return res.status(200).send(message);
    } catch (error) {
        message = {
            error: true,
            message: "Operation failed",
            data: String(error)
        }
        return res.status(400).send(message);
    }
})

/**
 * Complaint create
 */
SupplierOrderRoute.post("/complaint/create", async (req, res, next) => {
    try {
        const complaintsAdded = await RetailerOrderComplaint.insertMany(req.body.complaints)

        message = {
            error: false,
            message: "Complaint list",
            data: complaintsAdded
        }
        return res.status(200).send(message);
    } catch (error) {
        message = {
            error: true,
            message: "Operation failed",
            data: String(error)
        }
        return res.status(400).send(message);
    }
})

/**
 * Complaint list by orderId
 */
SupplierOrderRoute.get("/complaint/list/:orderId", async (req, res, next) => {
    try {
        const complaintsAdded = await RetailerOrderComplaint.find({reatilerOrderId: req.params.orderId})

        message = {
            error: false,
            message: "Complaint list by order",
            data: complaintsAdded
        }
        return res.status(200).send(message);
    } catch (error) {
        message = {
            error: true,
            message: "Operation failed",
            data: String(error)
        }
        return res.status(400).send(message);
    }
})


module.exports = SupplierOrderRoute;