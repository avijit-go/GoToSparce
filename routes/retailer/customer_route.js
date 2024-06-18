require("dotenv").config();
const express = require('express');
const RetailerCustomer = require("../../models/retailercustomer")
const CustomerRoute = express.Router();
const isAuthenticate = require("../../middleware/authcheck");
const User = require("../../helper/getUserToken");
const RetailerCustomerAddress = require("../../models/retailercustomeraddress");

/*
** Create customer
*/
CustomerRoute.post("/create", isAuthenticate, async(req,res) => {
    try{
        let headers = req.headers;
        let token = headers.authorization.split(' ')[1];
        let user = User(token);

        /* +++++++++ Check logged in as retailer or not ++++++++ */
        if(!user.data.register_with || user.data.register_with != 'wholesaler'){
            message = {
                error: true,
                message: "You are not logged in as Retailer",
                data: {}
            }
            return res.status(200).send(message)
        }
        /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
        var userId = user.data._id;
        req.body.retailerId = userId;
        
        req.body.cust_id = 'GTS-' + Date.now();
        // console.log(req.body);
        // return res.send("Hi");
        req.body.name = req.body.fname+ " " +req.body.lname;
        const CustomerData = new RetailerCustomer(req.body);
        let result = await CustomerData.save();
        let customerId = result._id;


        let addressData = {
            "retailerId": userId,
            "customerId": customerId,
            "phoneNo": req.body.phoneNo,
            "address": req.body.address,
            "lat": "0.0",
            "long": "0.0",
            "land_mark": req.body.address,
            "state": req.body.city,
            "city": req.body.city,
            "pin_code": req.body.pincode,
            "is_primary": true
        }
        let CustomerAddress = await RetailerCustomerAddress.create(addressData);
        
        message = {
            error: false,
            message: "Customer created successfully",
            data: result
        }
        return res.status(200).send(message);
    }catch(err){
        message = {
            error: true,
            message: "Operation Failed",
            data: err.toString()
        }
        return res.status(200).send(message);
    }
});
/*
** List Customers 
*/
CustomerRoute.get("/list", isAuthenticate, async(req,res) => {
    try{
        let headers = req.headers;
        let token = headers.authorization.split(' ')[1];
        let user = User(token);

        /* +++++++++ Check logged in as retailer or not ++++++++ */
        if(!user.data.register_with || user.data.register_with != 'wholesaler'){
            message = {
                error: true,
                message: "You are not logged in as Retailer",
                data: {}
            }
            return res.status(200).send(message)
        }
        /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
        var retailerId = user.data._id;
        var searchText = req.query.search;

        let customers = []

        if(searchText){
            customers = await RetailerCustomer.find({retailerId:retailerId,$or:[
                {"name":{"$regex":searchText,$options: 'i' }},
                {"fname":{"$regex":searchText,$options: 'i' }},
                {"lname":{"$regex":searchText,$options: 'i' }},
                {"phoneNo":{"$regex":searchText,$options: 'i'}},
                {"email":{"$regex":searchText,$options: 'i'}},
                {"city":{"$regex":searchText,$options: 'i'}}   
            ]}).sort({_id:-1}); 
        } else {
            customers = await RetailerCustomer.find({retailerId:retailerId}).sort({_id:-1}); 
        }

        let totalCustomers = await RetailerCustomer.find({retailerId:retailerId}).count();
        let newCustomerIndex = (totalCustomers+1);
        
        message = {
            error: false,
            message: "My all customers",
            data: {newCustomerIndex,customers}
        }

        return res.status(200).send(message);
    }catch(err){
        message = {
            error: true,
            message: "Operation Failed",
            data: err.toString()
        }
        return res.status(200).send(message);
    }
});



/*
// ** List Customers 
// */
// CustomerRoute.get("/list", isAuthenticate, async(req,res) => {
//     try{
//         let headers = req.headers;
//         let token = headers.authorization.split(' ')[1];
//         let user = User(token);

//         /* +++++++++ Check logged in as retailer or not ++++++++ */
//         if(!user.data.register_with || user.data.register_with != 'wholesaler'){
//             message = {
//                 error: true,
//                 message: "You are not logged in as Retailer",
//                 data: {}
//             }
//             return res.status(200).send(message)
//         }
//         /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
//         var retailerId = user.data._id;
//         var searchText = req.query.search;

//         let customers = []

//         if(searchText){
//             customers = await RetailerCustomer.aggregate([
//                 {"$match": { "$or":[{$addFields:{name:{ $concat : [ "$firstName", " ", "$lastName" ] }}},
//                 {"name": {"$regex":searchText,$options: 'i' }},
//                 {"fname":{"$regex":searchText,$options: 'i' }},
//                 {"lname":{"$regex":searchText,$options: 'i' }},
//                 {"email":{"$regex":searchText,$options: 'i'}},
//                 {"city":{"$regex":searchText,$options: 'i'}} 
//               ] } }
//               ]).sort({_id:-1}); 
//         } else {
//             customers = await RetailerCustomer.aggregate({retailerId:retailerId}).sort({_id:-1}); 
//         }

//         // let totalCustomers = await RetailerCustomer.find({retailerId:retailerId}).count();
//         // let newCustomerIndex = (totalCustomers+1);
        
//         message = {
//             error: false,
//             message: "My all customers",
//             // data: {newCustomerIndex,customers}
//             data: customers
//         }

//         return res.status(200).send(message);
//     }catch(err){
//         message = {
//             error: true,
//             message: "Operation Failed",
//             data: err.toString()
//         }
//         return res.status(200).send(message);
//     }
// })

/*
** Customer Details
*/
CustomerRoute.get("/:id", isAuthenticate, async(req,res) => {
    try{
        let headers = req.headers;
        let token = headers.authorization.split(' ')[1];
        let user = User(token);

        /* +++++++++ Check logged in as retailer or not ++++++++ */
        if(!user.data.register_with || user.data.register_with != 'wholesaler'){
            message = {
                error: true,
                message: "You are not logged in as Retailer",
                data: {}
            }
            return res.status(200).send(message)
        }
        /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
        var retailerId = user.data._id;
        let customer = await RetailerCustomer.findOne({_id:req.params.id}).populate([
            {
                path:"makeId",
                select:"title"
            },
            {
                path:"brandId",
                select:"title"
            },
            {
                path:"modelId",
                select:"title"
            }
        ]);  
        
        if(customer.retailerId != retailerId){
            message = {
                error: true,
                message: "This customer is not yours",
                data: {}
            }
            return res.status(200).send(message);
        }
        
        message = {
            error: false,
            message: "Customer details",
            data: customer
        }

        return res.status(200).send(message);

    }catch(err){
        message = {
            error: true,
            message: "Operation Failed",
            data: err.toString()
        }
        return res.status(200).send(message);
    }
})
/*
** Update Customers 
*/
CustomerRoute.put("/update/:id", isAuthenticate, async(req,res) => {
    try{
        let headers = req.headers;
        let token = headers.authorization.split(' ')[1];
        let user = User(token);

        /* +++++++++ Check logged in as retailer or not ++++++++ */
        if(!user.data.register_with || user.data.register_with != 'wholesaler'){
            message = {
                error: true,
                message: "You are not logged in as Retailer",
                data: {}
            }
            return res.status(200).send(message)
        }
        /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
        const result = await RetailerCustomer.findOneAndUpdate({_id:req.params.id},req.body,{new:true});
        
        if(result){            
            message = {
                error: false,
                message:"Customer updated successfully",
                data:result
            }
            return res.status(200).send(message);
        }else{
            message = {
				error: true,
				message: "Customer not updated",
			};
			res.status(200).send(message);
        }
    }catch(err){
        message = {
            error: true,
            message: "Operation Failed",
            data: err.toString()
        }
        res.status(200).send(message);
    }
})
/*
** Delete Customers 
*/
CustomerRoute.delete("/delete/:id", async(req,res) => {
    try{
        // let headers = req.headers;
        // let token = headers.authorization.split(' ')[1];
        // let user = User(token);

        // /* +++++++++ Check logged in as retailer or not ++++++++ */
        // if(!user.data.register_with || user.data.register_with != 'wholesaler'){
        //     message = {
        //         error: true,
        //         message: "You are not logged in as Retailer",
        //         data: {}
        //     }
        //     return res.status(200).send(message)
        // }
        // /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
        // const deleteCustomer = await RetailerCustomer.deleteOne({
        //     _id: req.params.id
        // });
        
        // if (deleteCustomer.deletedCount == 1) {
        //     message = {
        //         error: false,
        //         message: "Customer deleted successfully!",
        //     };
        //     res.status(200).send(message);
        // } else {
        //     message = {
        //         error: true,
        //         message: "Operation failed!",
        //     };
        //     res.status(200).send(message);
        // }
        const result = await RetailerCustomer.findByIdAndUpdate(
            req.params.id,
            { $set: { isDelete: true } },
            { new: true, strict: false }
        );
        return res.status(200).json({message: "Deleted", status: 200, result })
    }catch(err){
        message = {
            error: true,
            message: "Operation Failed",
            data: err.toString()
        }
        res.status(200).send(message);
    }
})
/*
** Create Customer Address
**  
*/
CustomerRoute.post("/create-address", isAuthenticate, async(req,res) => {
    try{
        let headers = req.headers;
        let token = headers.authorization.split(' ')[1];
        let user = User(token);

        /* +++++++++ Check logged in as retailer or not ++++++++ */
        if(!user.data.register_with || user.data.register_with != 'wholesaler'){
            message = {
                error: true,
                message: "You are not logged in as Retailer",
                data: {}
            }
            return res.status(200).send(message)
        }
        /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */

        req.body.retailerId = user.data._id;
        let resultAddress = await RetailerCustomerAddress.create(req.body);

        /* make first address default */
        let customerAddresses = await RetailerCustomerAddress.find({customerId:req.body.customerId});
        if(customerAddresses.length == 1){
            await RetailerCustomerAddress.findOneAndUpdate({_id:resultAddress._id},
                {
                    "is_primary": true
                }
                ,{new:true})
        }
        /* ++++++++++++++++++++++++++ */
        
        message = {
            error: false,
            message: "Address created successfully for customer",
            data: resultAddress
        }
        return res.status(200).send(message)

    }catch(err){
        let errors = {};
        if (err.name === "ValidationError") {
      
            Object.keys(err.errors).forEach((key) => {
              errors[key] = err.errors[key].message;
            });

            message = {
                error: true,
                message: "Operation failed",
                data: errors
            }
      
            return res.status(400).send(message);
        }
        return res.status(500).send("Something went wrong");
    }
})

module.exports = CustomerRoute;
