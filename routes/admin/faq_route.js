require("dotenv").config();
const express = require("express");
const Faq = require("../../models/faq");
const FaqRoute = express.Router();
const isAuthenticate = require("../../middleware/authcheck"); /* For GST Admin */

/*
* Create FAQ product *
*/

FaqRoute.post("/create",isAuthenticate, async (req,res)=> {
    try {
		const FaqData = new Faq(req.body);
		const result = await FaqData.save();
		message = {
			error: false,
			message: "Faq Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "operation Failed!",
			data: err,
		};
		return res.status(200).send(message);
	}
})

/*
* List FAQ only or product wise *
*/

FaqRoute.get("/list/:proId?", async (req,res) => {
    
    let proId = req.params.proId

    console.log(proId); 
    let faq = [];
    try{
        if(!proId){
            faq = await Faq.find({}).sort({_id:-1});
        } else {
            faq = await Faq.find({proId:proId}).sort({_id:-1});
        }
        
        let message = {
            error: false,
            message: "FAQ List",
            data: faq,
        }
        return res.status(200).send(message);
    } catch (err) {
        let message = {
            error: true,
            message: "Error",
            data: err,
        }
        return res.status(200).send(message);
    }
    
})

/*
* Detailed FAQ *
*/

FaqRoute.get("/:id", async (req,res) => {
    try{
        
        
        let faq = await Faq.findOne({_id:req.params.id}).sort({_id:-1});
        
        
        let message = {
            error: false,
            message: "FAQ details",
            data: faq,
        }
        return res.status(200).send(message);
    } catch (err) {
        let message = {
            error: true,
            message: "Error",
            data: err,
        }
        return res.status(200).send(message);
    }
})

/*
* Update FAQ product *
*/

FaqRoute.put("/update/:id",isAuthenticate, async (req,res) => {
    try {
		const result = await Faq.findOneAndUpdate({ _id: req.params.id }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "FAQ updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "FAQ not updated",
			};
			res.status(200).send(message);
		}
	} catch (err) {
		message = {
			error: true,
			message: "Operation Failed!",
			data: err,
		};
		res.status(200).send(message);
	}
})

/*
* Delete FAQ  *
*/

FaqRoute.delete("/:id",isAuthenticate, async (req,res) => {
    try {
        // const result = await Faq.deleteOne({
        //     _id: req.params.id
        // });
        // if (result.deletedCount == 1) {
        //     message = {
        //         error: false,
        //         message: "FAQ deleted successfully!",
        //     };
        //     res.status(200).send(message);
        // } else {
        //     message = {
        //         error: true,
        //         message: "Operation failed!",
        //     };
        //     res.status(200).send(message);
        // }
        const result = await Faq.findByIdAndUpdate(
            req.params.id,
            { $set: { isDelete: true } },
            { new: true, strict: false }
        );
        return res.status(200).json({message: "Deleted", status: 200, result })
    } catch (err) {
        message = {
            error: true,
            message: "Operation Failed!",
            data: err,
        };
        res.status(200).send(message);
    }
})

module.exports = FaqRoute;