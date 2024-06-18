const mongoose = require('mongoose');
var slug = require('mongoose-slug-generator');
var uniqueValidator = require('mongoose-unique-validator');
mongoose.plugin(slug)

const productSchema = new mongoose.Schema({
    title: { 
        type:String, 
        required:true,
        // unique: true
    },
    retailerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        //required: true
    },
    create_for:{
        type:String,
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
    pro_no :{
        type: String
    },
    set_of_pcs: {
        type: Number,
        default: 1
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
    // subcatId: {
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:"subCategories"
    // },
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
    costPrice: {
        type: Number,
        required: true
    },
    mrp: {
        type: Number,
        required: true
    },
    // price: {
    //     type: Number,
    //     required: true
    // }   ,
    // retailerPrice: {
    //     type: Number,
    //     required: true,
    // },    
    retailerDiscountedPrice: {
        type: Number,
        required: true
    },
    retailerPricePercentage: {
        type: Number,
        required: true
    },
    // customerPrice: {
    //     type: Number,
    //     required: true
    // }, 
    customerDiscountedPrice: {
        type: Number,
        required: true
    },  
    customerPricePercentage: {
        type: Number,
        required: true
    },  
    // status:{
    //     type:Boolean,
    //     default:true
    // },
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
    // makeId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "make"
    // },
    brandId: {
        type: mongoose.Schema.Types.ObjectId,                   //OES
        ref: "brand"
    },
    // vehicleId:{
    //     type: mongoose.Schema.Types.ObjectId,                  
    //     ref: "vehicles"
    // },
    // modelId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "model"
    // },
    // yearId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "year"
    // },
    // vehicleTypeId:{
    //     type: mongoose.Schema.Types.ObjectId,                  
    //     ref: "vehicleTypes"
    // },
    // variantId:{
    //     type: mongoose.Schema.Types.ObjectId,                  
    //     ref: "variants"
    // },
    status: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

/*productSchema.pre('save', async function(next) {
    try {
        // this.pro_no = 'GTS' + Date.now();
        this.pro_no = 'GTS'+Math.floor(Math.random()*900) + 100;
        next();
    } catch (error) {
        return next(error);
    }
});*/

productSchema.plugin(uniqueValidator);
const Product = new mongoose.model("products", productSchema)

module.exports = Product;