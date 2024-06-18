const mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');
const yearSchema = new mongoose.Schema({
    title:{
      type:String,
      required: true,
      unique: true
    },    
    status:{
      type:Boolean,
      default:true
    }
}, {timestamps: true})

yearSchema.plugin(uniqueValidator);
const Year = new mongoose.model("year",yearSchema);

module.exports = Year