require("dotenv").config();
const express = require("express");
const ModelYear = require("../../models/model_year");
const ModelYearRoute = express.Router();
const isAuthenticate = require("../../middleware/authcheck");
let errorMessage = require("../../helper/errorMessage");


/**
 * This method is to create ModelYear
 */
ModelYearRoute.post("/create", async (req, res) => {
	try {
		const ModelYearData = new ModelYear(req.body);
		const result = await ModelYearData.save();
		message = {
			error: false,
			message: "ModelYear Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "operation Failed!",
			data: errorMessage(err),
		};
		return res.status(200).send(message);
	}
});

/**
 * This method is to find all ModelYear
 */
ModelYearRoute.get("/list",isAuthenticate, async (req, res) => {
    try {
        // let searchText = req.query.search;
        // let makeId = req.query.makeId;
        // // let brandId = req.query.brandId;
        
        // let filterData  = {
        //     $and:[
        //         {"status": { $in : [true,false]}}
        //     ]
        // }
        

        // if(makeId){            
        //     filterData.$and.push({makeId:makeId}) 
        // }
        // // if(brandId){            
        // //     filterData.$and.push({brandId:brandId}) 
        // // }
        // if(searchText){            
        //     filterData.$and.push({title: {"$regex": searchText, $options: 'i'}},) 
        // }

        // console.log(filterData)
                

        let ModelYearData = await ModelYear.find({}).populate([
            {
                path: 'makeId', 
                select: 'title',
                
            },
            {
                path: 'modelId', 
                select: 'title',
                
            },
            {
                path: 'yearId', 
                select: 'title',
                
            }
        ]).sort({_id:-1});

        message = {
            error: false,
            message: "All Model Year list",
            data: ModelYearData,
        };
        res.status(200).send(message);
    } catch(err) {
        message = {
            error: true,
            message: "operation failed!",
            data: err.toString(),
        };
        res.status(200).send(message);
    }
});


/**
 * This method is to detail Model  list
 *  @param str modelId
 */
ModelYearRoute.get("/detail/:modelyearId",isAuthenticate, async (req, res) => {
    try {
        let ModelYearData = await ModelYear.findOne({_id:req.params.modelyearId}).populate([
            {
                path: 'makeId', 
                select: 'title',
                
            },
            {
                path: 'modelId', 
                select: 'title',
                
            },
            {
                path: 'yearId', 
                select: 'title',
                
            }
        ])

        message = {
            error: false,
            message: "Detail Model Year list",
            data: ModelYearData,
        };
        res.status(200).send(message);
    } catch(err) {
        message = {
            error: true,
            message: "operation failed!",
            data: err,
        };
        res.status(200).send(message);
    }
});


/**
 * This method is to update Model
 * * @param str modelId
 */

ModelYearRoute.patch("/update/:modelyearId",isAuthenticate, async (req, res) => {
	try {
		const result = await ModelYear.findOneAndUpdate({ _id: req.params.modelyearId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Model Year updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Model Year not updated",
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

/*
** Change Status query param modelId
*/
ModelYearRoute.get("/changestatus/:modelyearId", isAuthenticate, async(req,res) => {
    try{
        let ModelYearData = await ModelYear.findOne({_id:req.params.modelyearId});

        if(ModelYearData.status == true){
            await ModelYear.findOneAndUpdate({_id:req.params.modelyearId}, { status: false }, {new: true})

            message = {
                error: false,
                message: "Model Year status changed to inactive",
                data: {},
            };
            res.status(200).send(message);

        } else {
            await ModelYear.findOneAndUpdate({_id:req.params.modelyearId}, { status: true }, {new: true})

            message = {
                error: false,
                message: "Model Year status changed to active",
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

/**
 * Delete
 */

ModelYearRoute.delete("/delete/:modelyearId",isAuthenticate, async (req, res) => {
    try {
        const result = await ModelYear.deleteOne({
            _id: req.params.modelyearId
        });
        if (result.deletedCount == 1) {
            message = {
                error: false,
                message: "Model Year deleted successfully!",
            };
            res.status(200).send(message);
        } else {
            message = {
                error: true,
                message: "Operation failed!",
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

module.exports = ModelYearRoute;