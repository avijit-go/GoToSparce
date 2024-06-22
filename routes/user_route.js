/** @format */

require("dotenv").config();
const express = require("express");

const User = require("../models/user");
const RetailerSupplier = require("../models/retailersupplier");
const UserRoute = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const isAuthenticate = require("../middleware/authcheck"); /* For User (wholesaler or vehicle owener) */
const generateAccessToken = require("../helper/generateAccessToken");
const checkNumber = require("../helper/checkNumber");

const RetailerProfile = require("../models/retailerprofile");

const errorMessage = require("../helper/errorMessage");

/**
 * This method is to find all User list
 */
UserRoute.get("/list", async (req, res) => {
  try {
    let UserData = await User.find({ isDelete: { $ne: true } }).sort({
      _id: -1,
    });

    message = {
      error: false,
      message: "All User list",
      data: UserData,
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
 * This method is to create user
 */
UserRoute.post("/create", async (req, res) => {
  try {
    const UserData = new User(req.body);
    if (req.body.register_with == "wholesaler") {
      if (!req.body.shopName) {
        message = {
          error: true,
          message: "Shop Name is required",
        };
        return res.status(200).send(message);
      }
      if (!req.body.aadhar_no && !req.body.gstNo) {
        message = {
          error: true,
          message: "Aadhar no or GSTIN No is required",
        };
        return res.status(200).send(message);
      }
      // if(!req.body.doc_img){
      //     message = {
      //         error: true,
      //         message: "Please attach document image",
      //     };
      //     return res.status(200).send(message);
      // }
      const result = await UserData.save();
    }
    const result = await UserData.save();

    if (req.body.register_with == "wholesaler") {
      const retailerId = result._id;
      let retailersupplierData = {
        retailerId: retailerId,
        name: "GTS",
        gstNo: "2121212",
        licenseNo: "test",
        phoneNo: "9876543210",
        email: "gts@test.com",
        address: "Kolkata, Esplanade",
        city: "Kolkata",
        country: "India",
        pincode: "700110",
        isGTSSupplier: true,
      };
      const RetailerSupplierData = new RetailerSupplier(retailersupplierData);
      const resultRetailerSupplier = await RetailerSupplierData.save();
    }
    message = {
      error: false,
      message: "User Added Successfully!",
      data: result,
    };
    return res.status(200).send(message);
  } catch (err) {
    message = {
      error: true,
      message: errorMessage(err),
      //message:"Operation Failed",
      data: err.toString(),
    };
    return res.status(200).send(message);
  }
});

/**
 * This method is to update user
 *  @param str userId
 */
UserRoute.patch("/update/:userId", isAuthenticate, async (req, res) => {
  try {
    const result = await User.findOneAndUpdate(
      { _id: req.params.userId },
      req.body,
      { new: true }
    );
    if (result) {
      message = {
        error: false,
        message: "user updated successfully!",
        result,
      };
      res.status(200).send(message);
    } else {
      message = {
        error: true,
        message: "user not updated",
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
 * This method is to find all User details
 */
UserRoute.get("/detail/:usrerId", isAuthenticate, async (req, res) => {
  try {
    let UserData = await User.findOne({ _id: req.params.usrerId });

    message = {
      error: false,
      message: "User Detail list",
      data: UserData,
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
 * This method is to login a Student
 * @param str email
 * @param str password
 */
UserRoute.post("/login", async (req, res) => {
  try {
    if (req.body.user && req.body.password) {
      UserData = await User.findOne({
        $or: [{ email: req.body.user }, { mobile: checkNumber(req.body.user) }],
      });
      if (UserData === null) {
        message = {
          error: true,
          message: "User does not exist",
        };
        return res.status(200).send(message);
      } else {
        passwordCheck = await bcrypt.compare(
          req.body.password,
          UserData.password
        );
        if (passwordCheck) {
          if (UserData.status === true) {
            UserData.password = "";
            // const User = {
            //     id: UserData._id,
            //     type: UserData.register_with

            // };
            const User = {
              data: UserData,
            };
            // let retailerProfileDetails = {}
            const retailerProfileDetails = await RetailerProfile.findOne({
              retailerId: UserData._id,
            });
            const accessToken = await generateAccessToken(User);
            const refreshToken = await jwt.sign(
              User,
              process.env.REFRESH_TOKEN_KEY
            );

            message = {
              error: false,
              message: "User logged in!",
              data: [
                UserData,
                { retailerProfileDetails: retailerProfileDetails },
                {
                  accessToken: accessToken,
                  refreshToken: refreshToken,
                },
              ],
            };
            return res.status(200).send(message);
          } else {
            message = {
              error: true,
              message: "User is inactive!",
            };
            return res.status(403).send(message);
          }
        } else {
          message = {
            error: true,
            message: "wrong password!",
          };
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
      data: err.toString(),
    };
    res.status(200).send(message);
  }
});

/**
 * This method is to change password
 * @param str email
 * @param str password
 */

UserRoute.patch(
  "/change-password/:userId",
  isAuthenticate,
  async (req, res) => {
    try {
      if (req.body.old_password && req.body.new_password) {
        if (req.body.old_password === req.body.new_password) {
          message = {
            error: true,
            message: "Old and new password can not be same",
          };
          return res.status(200).send(message);
        }
        const UserData = await User.findOne({
          _id: req.params.userId,
        });
        if (UserData === null) {
          message = {
            error: true,
            message: "User not found!",
          };
        } else {
          passwordCheck = await bcrypt.compare(
            req.body.old_password,
            UserData.password
          );
          if (passwordCheck) {
            const result = await User.updateOne(
              {
                _id: req.params.userId,
              },
              {
                password: req.body.new_password,
              }
            );
            message = {
              error: false,
              message: "User password updated!",
            };
          } else {
            message = {
              error: true,
              message: "Old password is not correct!",
            };
          }
        }
      } else {
        message = {
          error: true,
          message: "Old password, new password are required!",
        };
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
  }
);

/**
 * This method is to forget password of a User
 * @param str email || @param number mobile || @param str Username
 */

UserRoute.post("/forget-password", async (req, res) => {
  try {
    if (req.body.user) {
      const UserData = await User.findOne({ email: req.body.user });
      if (UserData == null) {
        message = {
          error: true,
          message: "User not found",
        };
        return res.status(200).send(message);
      } else {
        const otpData = {
          emailOtp: 1234,
        };
        message = {
          error: false,
          message: "Otp received!",
          data: otpData,
        };
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
UserRoute.post("/verify-otp", async (req, res) => {
  try {
    if (req.body.user && req.body.otp) {
      const UserData = await User.findOne({
        $and: [{ email: req.body.user }, { emailOtp: req.body.otp }],
      });
      console.log("UserData", UserData);

      if (UserData == null) {
        message = {
          error: true,
          message: "otp not verified",
        };
        return res.status(200).send(message);
      } else {
        message = {
          error: false,
          message: "otp verified",
        };
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

UserRoute.patch("/reset-password", async (req, res) => {
  try {
    if (req.body.new_password && req.body.confirm_password) {
      if (req.body.new_password !== req.body.confirm_password) {
        message = {
          error: true,
          message: "new and confirm password are not equal",
        };
        return res.status(200).send(message);
      }
      const UserData = await User.findOne({
        email: req.body.email,
      });

      if (UserData === null) {
        message = {
          error: true,
          message: "User not found!",
        };
      } else {
        const result = await User.findOneAndUpdate(
          {
            email: req.body.email,
          },
          {
            password: req.body.new_password,
          }
        );

        console.log("result", result);

        message = {
          error: false,
          message: "User password reset successfully!",
        };
      }
    } else {
      message = {
        error: true,
        message: "new password, confirm password are required!",
      };
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

/**
 * This method is to delete User
 * @param str StudentId
 */
UserRoute.delete("/delete/:userId", async (req, res) => {
  try {
    // const result = await User.deleteOne({ _id: req.params.userId });
    // if (result.deletedCount == 1) {
    // 	message = {
    // 		error: false,
    // 		message: "User deleted successfully!",
    // 	};
    // 	res.status(200).send(message);
    // } else {
    // 	message = {
    // 		error: true,
    // 		message: "Operation failed!",
    // 	};
    // 	res.status(200).send(message);
    // }
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: { isDelete: true } },
      { new: true, strict: false }
    );
    return res
      .status(200)
      .json({ message: "Deleted user", status: 200, wishlist: updatedUser });
  } catch (err) {
    message = {
      error: true,
      message: "Operation Failed!",
      data: err,
    };
    res.status(200).send(message);
  }
});

UserRoute.post("/search", isAuthenticate, async (req, res) => {
  try {
    const searchText = req.body.searchText;
    const result = await User.find({
      $or: [
        { fname: { $regex: searchText, $options: "i" } },
        { lname: { $regex: searchText, $options: "i" } },
        { register_with: { $regex: searchText, $options: "i" } },
        { mobile: { $regex: searchText, $options: "i" } },
        { email: { $regex: searchText, $options: "i" } },
      ],
    });

    if (result) {
      message = {
        error: false,
        message: "Supplier search successfully!",
        data: result,
      };

      res.status(200).send(message);
    } else {
      message = {
        error: true,
        message: "Supplier search failed",
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

module.exports = UserRoute;
