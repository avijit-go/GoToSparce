const mongoose = require("mongoose")
const retailerprofileSchema = new mongoose.Schema({
    retailerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    shopName: {
        type: String,
        required: true
    },
    gstNo: {
        type: String,
        required: true
    },
    aadhar_no:{
        type:String,
        trim:true
    },
    doc_img:{
        type:String,
        trim:true
    },
    storeRegNo: {
        type: String,
       // required: true
    },
    licensePhoto: {
        type: String
    },
    mobile: {
        type: String,
        required: true
    },
    email: {
        type: String
    },    
    /* billing address fields */
    fname: {
        type: String,
        required: true
    },
    lname: {
        type: String,
    },
    address: {
        type: String,
        required: true
    },
    address_description: {
        type: String
    }, /* house no , flat no */
    lat: {
        type: String,
        required: true
    },
    long: {
        type: String,
        required: true
    },
    country: {
        type: String
    },
    state: {
        type: String
    },
    pincode: {
        type: String
    },
}, {timestamps: true})
const RetailerProfile = new mongoose.model("retailerprofile", retailerprofileSchema);

module.exports = RetailerProfile