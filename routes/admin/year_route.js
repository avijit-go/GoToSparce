require("dotenv").config();
const express = require("express");
const Year = require("../../models/year");
const YearRoute = express.Router();
const isAuthenticate = require("../../middleware/authcheck");  /* For GTS Admin */

/*
** Create
*/
YearRoute.post("/create", isAuthenticate, async(req,res) => {
    try{
        let result = await Year.create(req.body)
        message = {
            error: false,
            message: "Year created successfully",
            data: result,
        };
        res.status(200).send(message);
    }catch(err){
        message = {
            error: true,
            message: "Operation Failed!",
            data: err,
        };
        res.status(200).send(message);
    }
})
/*
** List
*/
YearRoute.get("/list", isAuthenticate, async(req,res) => {
    try{
        let result = await Year.find().sort({_id:-1}).select("title status")
        message = {
            error: false,
            message: "Year List",
            data: result,
        };
        res.status(200).send(message);
    }catch(err){
        message = {
            error: true,
            message: "Operation Failed!",
            data: err,
        };
        res.status(200).send(message);
    }
})

/*
** List web view
*/
YearRoute.get("/allYear-list", async(req,res) => {
    try{
        let result = await Year.find().sort({_id:-1}).select("title status")
        message = {
            error: false,
            message: "Year List",
            data: result,
        };
        res.status(200).send(message);
    }catch(err){
        message = {
            error: true,
            message: "Operation Failed!",
            data: err,
        };
        res.status(200).send(message);
    }
})


/*
** Status Change query param yearId
*/
YearRoute.get("/changestatus/:yearId", isAuthenticate, async(req,res) => {
    try{
        let yearData = await Year.findOne({_id:req.params.yearId});

        if(yearData.status == true){
            await Year.findOneAndUpdate({_id:req.params.yearId}, { status: false }, {new: true})

            message = {
                error: false,
                message: "Year status changed to inactive",
                data: {},
            };
            res.status(200).send(message);

        } else {
            await Year.findOneAndUpdate({_id:req.params.yearId}, { status: true }, {new: true})

            message = {
                error: false,
                message: "Year status changed to active",
                data: {},
            };
            res.status(200).send(message);
        }
    }catch(err){
        message = {
            error: true,
            message: "Operation Failed!",
            data: err,
        };
        res.status(200).send(message);
    }
});


YearRoute.delete("/delete/:yearId", async (req, res) => {
	try {
		// const result = await Year.deleteOne({ _id: req.params.yearId });
		// if (result.deletedCount == 1) {
		// 	message = {
		// 		error: false,
		// 		message: "Year deleted successfully!",
		// 	};
		// 	res.status(200).send(message);
		// } else {
		// 	message = {
		// 		error: true,
		// 		message: "Operation failed!",
		// 	};
		// 	res.status(200).send(message);
		// }
        const result = await Year.findByIdAndUpdate(
          req.params.yearId,
          { $set: { isDelete: true } },
          { new: true, strict: false }
        );
        return res
          .status(200)
          .json({ message: "Deleted", status: 200, result });
	} catch (err) {
		message = {
			error: true,
			message: "Operation Failed!",
			data: err,
		};
		res.status(200).send(message);
	}
});


module.exports = YearRoute;