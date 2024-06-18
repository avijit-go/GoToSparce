const mongoose = require("mongoose");
const validator = require("validator");

var validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};


const supplierSchema = new mongoose.Schema(
    {    
        name:{
            type:String,
            required: true
        },
        phone:{
            type: String,
            required: true,
            validate(value) {
                if(value.length !== 10) {
                    throw new Error("mobile no should be a 10 digit number")
                }
            }
        },
        whatsapp:{
            type: String,
            validate(value) {
                if(value.length !== 10) {
                    throw new Error("mobile no should be a 10 digit number")
                }
            }
        },
        email:{
            type:String,
            trim: true,
            lowercase: true,
            unique: true,
            validate:{
                required: false,
                validator: validator.isEmail,
                message: '{VALUE} is not a valid email',
                isAsync: false
            }
          
            // required: 'Email address is required',
            // validate: [validateEmail, 'Please fill a valid email address'],
            // match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
        },
        status:{
            type:Boolean,
            default:true
        }
    }, 
    {timestamps: true}
)

const Supplier = new mongoose.model("suppliers",supplierSchema);

module.exports = Supplier;