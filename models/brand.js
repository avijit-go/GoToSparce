//Parts Manufacturer (OES)

const mongoose = require("mongoose");
var slug = require('mongoose-slug-generator');
var uniqueValidator = require('mongoose-unique-validator');
mongoose.plugin(slug)

const brandSchema = new mongoose.Schema({
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
    },
    image:{
      type:String
    },
    status:{
      type:Boolean,
      default:true
    },
    brandAsPopular:{
      type:Boolean,
      default:false
    }
}, {timestamps: true})

brandSchema.plugin(uniqueValidator);
const Make = new mongoose.model("brand",brandSchema);

module.exports = Make