require("dotenv").config();
const express = require("express");
const Admin = require("../models/admin");
const AdminRoute = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const isAuthenticate = require("../middleware/authcheck");  /* For GST Admin */
const generateAccessToken = require("../helper/generateAccessToken");
const checkNumber = require("../helper/checkNumber");

/**
 * This method is to get list of Admin 
 */
 AdminRoute.get("/list",isAuthenticate, async (req, res) => {
    try {
        const AdminData = await Admin.find({}).sort({_id:-1});
        message = {
            error: false,
            message: "All Admins list",
            data: AdminData,
        };
        res.status(200).send(message);
    } catch (err) {
        message = {
            error: true, 
            message: "operation failed!",
            data: err,
        };
        res.status(200).send(message);
    }
});

/**
 * This method is to create new Admin
 */

 AdminRoute.post("/create", async (req, res) => {
    try {
        const AdminExist = await Admin.findOne({
            $or: [{email: req.body.email}, {mobile: req.body.mobile}, {Adminname: req.body.username}]
        });
        if (AdminExist) {
            message = {
                error: true,
                message: "Admin already exist!"
            };
        } else {
            const AdminData = new Admin(req.body);
            const result = await AdminData.save();
            message = {
                error: false,
                message: "Admin Added Successfully!",
                data: result
            };
        }
        return res.status(200).send(message);
        
        
    } catch (err) {
        message = {
            error: true,
            message: "Operation Failed!",
            data: err,
        };
        return res.status(200).send(message);
    }
});

/**
 * This method is to update admin
 *  @param str adminId
 */
 AdminRoute.patch("/update/:adminId", async (req, res) => {
	try {
		const result = await Admin.findOneAndUpdate({ _id: req.params.adminId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Admin updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Admin not updated",
			};
			res.status(200).send(message);
		}
	} catch (err) {
		message = {
			error: true,
			message: "Operation Failed!",
			data: err,
		};
		res.status(200).send(message);
	}
});

/**
 * This method is to login a Admin
 * @param str email
 * @param str password
 */
 AdminRoute.post("/login", async (req, res) => {
    try {
        if (req.body.user && req.body.password) {
            AdminData = await Admin.findOne({$or: [ { email: req.body.user }, { mobile: checkNumber(req.body.user) } ]});
            if (AdminData === null) {
                
                message = {
                    error: true,
                    message: "Admin does not exist"
                }
                return res.status(200).send(message);
            } else {
                passwordCheck = await bcrypt.compare(req.body.password, AdminData.password);
                if (passwordCheck) {
                    if (AdminData.status === true) {
                        AdminData.password = "";
                        const Admin = {
                            data: AdminData
                        };
                        const accessToken = await generateAccessToken(Admin);
                        const refreshToken = await jwt.sign(Admin, process.env.REFRESH_TOKEN_KEY);

                        message = {
                            error: false,
                            message: "Admin logged in!",
                            data: [AdminData, {
                                accessToken: accessToken,
                                refreshToken: refreshToken
                            }]
                        }
                        return res.status(200).send(message);
                    } else {

                        message = {
                            error: true,
                            message: "Admin is in active!"
                        }
                        return res.status(403).send(message);
                    }
                } else {

                    message = {
                        error: true,
                        message: "wrong password!"
                    }
                    return res.status(200).send(message);
                }
            }
        } else {

            res.status(403).send({
                message: "Email and Password are required.",
            });
        }
    } catch (err) {

        message = {
            error: true,
            message: "Operation Failed!",
            data: err,
        };
        res.status(200).send(message);
    }
});

/**
 * This method is to change password
 * @param str email
 * @param str password
 */

 AdminRoute.patch("/change-password/:AdminId",isAuthenticate, async (req, res) => {
    try {
        if (req.body.old_password && req.body.new_password) {
            if (req.body.old_password === req.body.new_password) {
                message = {
                    error: true,
                    message: "Old and new password can not be same"
                }
                return res.status(200).send(message);
            }
            const AdminData = await Admin.findOne({
                _id: req.params.AdminId
            });
            if (AdminData === null) {
                message = {
                    error: true,
                    message: "Admin not found!"
                }
            } else {
                passwordCheck = await bcrypt.compare(req.body.old_password, AdminData.password);
                if (passwordCheck) {
                    const result = await Admin.updateOne({
                        _id: req.params.AdminId
                    }, {
                        password: req.body.new_password
                    });
                    message = {
                        error: false,
                        message: "Admin password updated!"
                    }
                } else {
                    message = {
                        error: true,
                        message: "Old password is not correct!"
                    }
                }
            }
        } else {
            message = {
                error: true,
                message: "Old password, new password are required!"
            }
        }
        return res.status(200).send(message);
    } catch (err) {
        message = {
            error: true,
            message: "Operation Failed!",
            data: err,
        };
        res.status(500).send(message);
    }
});


/**
 * This method is to forget password of a Admin
 * @param str email || @param number mobile || @param str Adminname
 */

 AdminRoute.post("/forget-password", async (req, res) => {
	try {
        if(req.body.user){
            const AdminData = await Admin.findOne({ email: req.body.user });
            if(AdminData == null){
               message = {
                error:true,
                message:"Admin not found"
               }
               return res.status(200).send(message);
            }else{
                const otpData = {
                    emailOtp: 1234,
                }
                message = {
                    error:false,
                    message:"Otp received!",
                    data:otpData
                   }
            }
            return res.status(200).send(message);
        }
      
	} catch (err) {
		message = {
			error: true,
			message: "Operation Failed!",
			data: String(err),
		};
		res.status(200).send(message);
	}
});

/**
 * This method is to verify password
 * @param str email || @param number mobile || @param str username
 */
 AdminRoute.post("/verify-otp", async (req, res) => {
	try {
        if(req.body.user && req.body.otp){
            const AdminData = await Admin.findOne({$and:[{email:req.body.user},{emailOtp:req.body.otp}]});
            console.log("AdminData",AdminData);
            
            if(AdminData == null){
               message = {
                error:true,
                message:"otp not verified"
               }
               return res.status(200).send(message);
            }else{
                message = {
                    error:false,
                    message:"otp verified",
                   }
            }
            return res.status(200).send(message);
        }
      
	} catch (err) {
		message = {
			error: true,
			message: "Operation Failed!",
			data: String(err),
		};
		res.status(200).send(message);
	}
});

/**
 * reset password
 */

 AdminRoute.patch("/reset-password",  async (req, res) => {
    try {
        if (req.body.new_password && req.body.confirm_password) {
            if (req.body.new_password !== req.body.confirm_password) {
                message = {
                    error: true,
                    message: "new and confirm password are not equal"
                }
                return res.status(200).send(message);
            }
            const AdminData = await Admin.findOne({
                email: req.body.email
            });
           
            if (AdminData === null) {
                message = {
                    error: true,
                    message: "Admin not found!"
                }
            } else {
                    const result = await Admin.findOneAndUpdate({
                        email: req.body.email
                    }, {
                        password: req.body.new_password
                    });

                   console.log("result",result);
                    
                    message = {
                        error: false,
                        message: "Admin password reset successfully!"
                    }
            }
        } else {
            message = {
                error: true,
                message: "new password, confirm password are required!"
            }
        }
        return res.status(200).send(message);
    } catch (err) {
        message = {
            error: true,
            message: "Operation Failed!",
            data: String(err),
        };
        res.status(500).send(message);
    }
});







module.exports = AdminRoute;