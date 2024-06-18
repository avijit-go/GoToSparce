const mongoose = require("mongoose")
var slug = require('mongoose-slug-generator');
var uniqueValidator = require('mongoose-unique-validator');
mongoose.plugin(slug)
const categorySchema = new mongoose.Schema({
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category"
    },
    title: {
        type: String,
        required: true,
        unique: true
    },
    slug: { 
        type: String, 
        slug: "title" 
    },
    description: {
        type: String
    },
    image: {
        type: String
    },
    layer:{
        type:String,
        enum:{
            values:["c","sc","ssc"],
            message:"{VALUE} is not a correct value.Expect c,sc,ssc"
        }
    }
}, {timestamps: true})
categorySchema.plugin(uniqueValidator);
const Category = new mongoose.model("category", categorySchema)

module.exports = Category;