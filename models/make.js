
//CAR Manufacturer (OEM)

const mongoose = require("mongoose");
var slug = require('mongoose-slug-generator');
var uniqueValidator = require('mongoose-unique-validator');
mongoose.plugin(slug)

const makeSchema = new mongoose.Schema({
    title:{
      type:String,
      required: true,
      unique: true
    },
    slug: { 
      type: String, 
      slug: "title" 
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
    },
    makeAsPopular:{
      type:Boolean,
      default:false
    }
}, {timestamps: true})

makeSchema.plugin(uniqueValidator);
const Make = new mongoose.model("make",makeSchema);

module.exports = Make