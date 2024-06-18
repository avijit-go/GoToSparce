const mongoose = require('mongoose');
var slug = require('mongoose-slug-generator');
var uniqueValidator = require('mongoose-unique-validator');
mongoose.plugin(slug)

const testproductSchema = new mongoose.Schema({
    title: { 
        type:String, 
        required:true,
        unique: true
    },
    slug: { type: String, slug: "title" },
    description: { 
        type:String, 
        required:true,
    },
    partNo: { 
        type:String, 
        required:true,
        unique: true
    },
    origin: { 
        type:String, 
       // required:true 
    },
    catId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"category",
        required: [true, "Category is requried"]
    },    
    subcat0Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
        required: [true, "First child category is requried"]
    },
    subcat1Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category"
    },
    subcat2Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category"
    },    
    retailerPrice: {
        type: Number,
        required: true,
    },
    retailerDiscountedPrice: {
        type: Number,
        required: true
    },
    customerPrice: {
        type: Number,
        required: true
    }, 
    customerDiscountedPrice: {
        type: Number,
        required: true
    },    
    status:{
        type:Boolean,
        default:true
    },
    specifications: [
        {
            key: {
                type: String,
                required: true
            },
            value: {
                type: String,
                required: true
            }
        }
    ],
    images: {
       type: Array
    },   
    makeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "make"
    },
    modelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "model"
    },
    yearId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "year"
    },
    // status: {
    //     type: Boolean,
    //     default: true
    // }
}, {timestamps: true})

testproductSchema.plugin(uniqueValidator);
const TestProduct = new mongoose.model("testproducts", testproductSchema)

module.exports = TestProduct;