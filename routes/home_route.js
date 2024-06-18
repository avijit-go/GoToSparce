require("dotenv").config();
const express = require("express");
const Make = require("../models/make");
const Brand = require("../models/brand");
const HomeRoute = express.Router();


HomeRoute.get("/popular-list",async(req,res)=>{
   try{
    const popularMakeData = await Make.find({makeAsPopular:true}).sort({title:1});

    const popularBrandData = await Brand.find({brandAsPopular:true}).sort({title:1});

    message = {
        error:false,
        message:"all Popular product list",
        popularMakeDataList:popularMakeData,
        popularBrandDataList:popularBrandData
    }
    res.status(200).send(message);
   }catch(err){
        message = {
            error:true,
            message:"Operation Failed",
            data:err
        }
        res.status(200).send(message);
   }
});


module.exports = HomeRoute