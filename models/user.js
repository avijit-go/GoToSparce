const mongoose = require("mongoose");
const bycrpt = require("bcryptjs");
var uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema({
    fname:{
        type: String,
        trim: true,
        required: [true, "First name is required"],
        minlength: [2, "First name minimum contains 2 letters"],
    },
    lname:{
        type: String,
        // trim: true,
        // required: [true, "Last name is required"],
        // minlength: [2, "Last name minimum contains 2 letters"],
    },
    register_with:{
        type:String,
        default: "vehicleowner",
        enum:{
            values:["vehicleowner","wholesaler"],
            message:'please select between -vehicleowner/wholesaler'
        },
        immutable:true,
        required: true,

    },
    email:{
        type: String,
        required: [true, "Email is required"],
        unique: true,
        immutable:true
    },
    mobile:{
        type: String,
        required: [true, "Mobile no. is required"],
        type: String,
        validate(value) {
            if(value.length !== 10) {
                throw new Error("mobile no should be a 10 digit number")
            }
        },
        immutable:true
    },
    password: {
		type: String,
        trim: true,
        minlength: [6, "Password minimum contains 6 characters"],
		required: false,

	},
    emailOtp: {
        type: Number,
        default: 1234
    },
    shopName: {
        type: String,
        trim:true
    },
    storeRegNo: {
        type: String,
        trim:true
    },
    gstNo: {
        type: String,
        trim:true
    },
    aadhar_no:{
        type:String,
        trim:true
    },
    doc_img:{
        type:String,
        trim:true
    },
    address:{
        type:String,
        minlength: [2, "Username minimum contains 2 letters"],
    },
    address_type:{
        type:String,
        enum:{
            values:["home","office"],
            message:'please select between -home/office'
        }
    },
    city:{
        type:String,
        minlength: [2, "Username minimum contains 2 letters"],
    },
    /**
     * This field has been deprecated and it's changed to *pincode*
     */
    pin_code:{
        type:String,
        minlength: [6, "Pin minimum contains 6 characters"],
    },
    /**
     * This is the current pincode field (Dt. 03rd February, 2023)
     */
    pincode:{
        type:String,
        minlength: [6, "Pincode minimum contains 6 characters"],
    },
    state:{
        type:String
    },
    lat:{
        type:String
    },
    long:{
        type:String
    },
    land_mark:{
        type:String
    },
    status: {
        type: Boolean,
        default: true
    }
   
}, {timestamps: true});

userSchema.pre("save", async function(next) {
	if(this.isModified("password")) {
		this.password = await bycrpt.hash(this.password, 10);
		this.confirmPassword = undefined;
	}
	next();
})


userSchema.pre("updateOne", async function(next) {
	try {
		if(this._update.password) {
			this._update.password = await bycrpt.hash(this._update.password, 10);
		}
		next();
	} catch (err) {
		return next(err);
	}
})

userSchema.pre("findOneAndUpdate", async function(next) {
	try {
		if(this._update.password) {
			this._update.password = await bycrpt.hash(this._update.password, 10);
		}
		next();
	} catch (err) {
		return next(err);
	}
})

userSchema.plugin(uniqueValidator);
const User = new mongoose.model("users", userSchema);

module.exports = User;