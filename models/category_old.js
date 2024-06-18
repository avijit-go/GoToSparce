const mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');

const categorySchema = new mongoose.Schema({
    title:{
        type:String,
        required: true,
        unique: true
      },
      desc:{
        type:String,
        required: true
      },
      image:{
        type:String
      },
      status:{
        type:Boolean,
        default:true
      }
}, {timestamps: true})

categorySchema.plugin(uniqueValidator);

const Category = new mongoose.model("categories",categorySchema);

module.exports = Category;