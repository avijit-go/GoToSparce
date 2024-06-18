require("dotenv").config();
const express = require("express");
const CustomerRoute = express.Router();
const isAuthenticate = require("../../middleware/authcheck"); /* For GTS Admin */
const Address = require("../../models/address");
const User = require("../../models/user");
const Order = require("../../models/order");
const RetailerSupplier = require("../../models/retailersupplier");

/*
** List users/ Customers
*/
CustomerRoute.get("/list", isAuthenticate, async(req,res) => {
    try{
        let searchText = req.query.search;
        let searchVal = {}
        if(searchText){
            searchVal = {
                $or:[
                    {"fname": {"$regex": searchText, $options: 'i'}},
                    {"lname": {"$regex": searchText, $options: 'i'}},
                    {"email": {"$regex": searchText, $options: 'i'}},
                    {"mobile": {"$regex": searchText, $options: 'i'}},
                    {"register_with": {"$regex": searchText, $options: 'i'}},
                ]
            }
        }
        let result = await User.find(searchVal).select('fname lname email mobile register_with status').sort({_id:-1})

        message = {
            error: false,
            message: "Customer List",
            data: result
        };
        res.status(200).send(message);
    }catch(err){
        message = {
            error: true,
            message: "Oops! Something went wrong",
            data: err.toString(),
        };
        res.status(200).send(message);
    }
})
/*
** Details (Basic Details, Address Details, Order Details)
*/
CustomerRoute.get("/:id", isAuthenticate, async(req,res) => {
    try{
        let userDetails = await User.findOne({_id:req.params.id}).select('fname lname email mobile register_with status');
        let userAddress = await Address.find({user_id:req.params.id});
        let userOrders = await Order.find({userId:req.params.id});

        message = {
            error: false,
            message: "Customer details",
            data: {
                userDetails,userAddress,userOrders
            }
        };
        res.status(200).send(message);

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
** Create
*/
CustomerRoute.post("/create", isAuthenticate, async(req,res) => {
    try {
		const UserData = new User(req.body);
		const result = await UserData.save();
        
        if(req.body.register_with == 'wholesaler'){
            const retailerId = result._id;
            let retailersupplierData = {
                "retailerId": retailerId,
                "name": "GTS",
                "gstNo": "2121212",
                "licenseNo": "test",
                "phoneNo": "9876543210",
                "email": "gts@test.com",
                "address": "Kolkata, Esplanade",
                "city": "Kolkata",
                "country": "India",
                "pincode": "700110"
            }
            const RetailerSupplierData = new RetailerSupplier(retailersupplierData)
            const resultRetailerSupplier = await RetailerSupplierData.save();
        }
		message = {
			error: false,
			message: "Customer Created Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		if (err.name === "ValidationError") {
            let errors = {};
      
            Object.keys(err.errors).forEach((key) => {
              errors[key] = err.errors[key].message;
            });

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
** Update
*/
CustomerRoute.put("/:id", isAuthenticate, async(req,res) => {
    try {
		let result = await User.findOneAndUpdate({_id:req.params.id},req.body,{new:true})
        
		message = {
			error: false,
			message: "Customer updated Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		if (err.name === "ValidationError") {
            let errors = {};
      
            Object.keys(err.errors).forEach((key) => {
              errors[key] = err.errors[key].message;
            });

            message = {
				error: true,
				message: "Operation failed",
                data: errors
			};
			
      
            return res.status(400).send(message);
        } else if(err.name === "CastError"){
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
** Status Change with param id
*/
CustomerRoute.get("/changestatus/:id", isAuthenticate, async(req,res) => {
    try{
        let customerData = await User.findOne({_id:req.params.id});

        if(customerData.status == true){
            await User.findOneAndUpdate({_id:req.params.id}, { status: false }, {new: true})

            message = {
                error: false,
                message: "Customer status changed to inactive",
                data: {},
            };
            res.status(200).send(message);

        } else {
            await User.findOneAndUpdate({_id:req.params.id}, { status: true }, {new: true})

            message = {
                error: false,
                message: "Customer status changed to active",
                data: {},
            };
            res.status(200).send(message);
        }
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
});

CustomerRoute.delete("/delete/:id", async(req,res) => {
    try{
        const result = await User.findByIdAndUpdate(
            req.params.id,
            { $set: { isDelete: true } },
            { new: true, strict: false }
        );
        return res.status(200).json({message: "Deleted", status: 200, result }) 
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


module.exports = CustomerRoute;

