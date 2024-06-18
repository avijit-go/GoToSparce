require("dotenv").config();
const express = require('express');
const ExpenseJournal = require("../../models/retailerexpense");
const RetailerExpense = require("../../models/retailerexpense");
const ExpenseRoute = express.Router();
const isAuthenticate = require("../../middleware/authcheck");
const User = require("../../helper/getUserToken");
const RetailerJournal = require("../../models/retailerjournal");

/*
** List Expense
*/
ExpenseRoute.get("/list", isAuthenticate, async(req,res) => {
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
        /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
        const retailerId = user.data._id;
        
        let result = await RetailerExpense.find({retailerId:retailerId}).sort({_id:-1});
        message = {
            error: false,
            message: "My all expenses",
            data: result
        }
        return res.send(message)
    }catch(err){
        message = {
            error: true,
            message: "Operation failed",
            data: err
        }
        return res.status(200).send(message);
    }
})
/*
** Create Expense
*/
ExpenseRoute.post("/create", isAuthenticate, async(req,res) => {
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
        /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
        const retailerId = user.data._id;

        req.body.retailerId = retailerId;
        let result = await RetailerExpense.create(req.body);
        let expenseId = result._id;

        /* Add in journal ... single entry */
        journalData = {
            retailerId: retailerId,
            type: "expense",
            entryDate: req.body.entryDate,
            expenseId: expenseId,
            amount: req.body.amount
        }
        let resJournal = await RetailerJournal.create(journalData);

        message = {
            error: false,
            message: "Expense created",
            data: result
        }
        return res.status(200).send(message);
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

/*
** Delete Expense
*/
ExpenseRoute.delete("/:id", isAuthenticate, async(req,res) => {
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
        /* +++++++++++ Check expense is your or not ++++++++++++ */
        let expenseData = await RetailerExpense.findOne({_id:req.params.id});
        if(expenseData.retailerId != retailerId) {
            message = {
                error: true,
                message: "This expense is not your",
                data: {}
            }
            return res.status(200).send(message)
        }
        /* +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
        
        let deleteExpense = await RetailerExpense.deleteOne({_id:req.params.id});
        let deleteJournal = await RetailerJournal.deleteOne({expenseId:req.params.id});

        if(deleteExpense.deletedCount == 1 && deleteJournal.deletedCount == 1){
            message = {
                error: false,
                message: "Expense deleted successfully",
                data: {}
            }
            return res.status(200).send(message);
        } else {
            message = {
                error: true,
                message: "Cannot find expense",
                data: {}
            }
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
})

module.exports = ExpenseRoute;