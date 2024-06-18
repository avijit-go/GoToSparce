const mongoose = require("mongoose");
const bycrpt = require("bcryptjs");

const adminSchema = new mongoose.Schema({
    username: {
        type: String
    },
    email:{
        type: String,
        required: [true, "Email is required"]
    },
    mobile:{
        type: String,
        required: [true, "Mobile no. is required"],
        type: String,
        validate(value) {
            if(value.length !== 10) {
                throw new Error("mobile no should be a 10 digit number")
            }
        }
    },
    emailOtp:{
        type:Number,
        default:1234
    },
    password: {
		type: String,
        trim: true,
        minlength: [6, "Password minimum contains 6 characters"],
		required: false,
	},
    status: {
        type: Boolean,
        default: true
    }
}, {timestamps: true});

adminSchema.pre("save", async function(next) {
	if(this.isModified("password")) {
		this.password = await bycrpt.hash(this.password, 10);
		this.confirmPassword = undefined;
	}
	next();
})

adminSchema.pre("updateOne", async function(next) {
	try {
		if(this._update.password) {
			this._update.password = await bycrpt.hash(this._update.password, 10);
		}
		next();
	} catch (err) {
		return next(err);
	}
})

adminSchema.pre("findOneAndUpdate", async function(next) {
	try {
		if(this._update.password) {
			this._update.password = await bycrpt.hash(this._update.password, 10);
		}
		next();
	} catch (err) {
		return next(err);
	}
})

const Admin = new mongoose.model("admins", adminSchema);

module.exports = Admin;