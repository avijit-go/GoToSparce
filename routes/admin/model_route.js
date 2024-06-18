require("dotenv").config();
const express = require("express");
const Model = require("../../models/model");
const ModelRoute = express.Router();
const isAuthenticate = require("../../middleware/authcheck");
let errorMessage = require("../../helper/errorMessage");


/**
 * This method is to create Model
 */
ModelRoute.post("/create", async (req, res) => {
	try {
		const ModelData = new Model(req.body);
		const result = await ModelData.save();
		message = {
			error: false,
			message: "Model Added Successfully!",
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
 * This method is to find all Model
 */
ModelRoute.get("/list",isAuthenticate, async (req, res) => {
    try {
        let searchText = req.query.search;
        let makeId = req.query.makeId;
        // let brandId = req.query.brandId;
        
        let filterData  = {
            $and:[
                {"status": { $in : [true,false]}}
            ]
        }
        

        if(makeId){            
            filterData.$and.push({makeId:makeId}) 
        }
        // if(brandId){            
        //     filterData.$and.push({brandId:brandId}) 
        // }
        if(searchText){            
            filterData.$and.push({title: {"$regex": searchText, $options: 'i'}},) 
        }

        console.log(filterData)
                

        let ModelData = await Model.find(filterData).populate([
            {
                path: 'makeId', 
                select: 'title',
                
            }
        ]).sort({_id:-1});

        message = {
            error: false,
            message: "All Model list",
            data: ModelData,
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
 * This method is to find all Model web view
 */

ModelRoute.get("/allModel-list", async (req, res) => {
    try {
        let searchText = req.query.search;
        let makeId = req.query.makeId;
        // let brandId = req.query.brandId;
        
        let filterData  = {
            $and:[
                {"status": { $in : [true,false]}}
            ]
        }
        

        if(makeId){            
            filterData.$and.push({makeId:makeId}) 
        }
        // if(brandId){            
        //     filterData.$and.push({brandId:brandId}) 
        // }
        if(searchText){            
            filterData.$and.push({title: {"$regex": searchText, $options: 'i'}},) 
        }

        console.log(filterData)
                

        let ModelData = await Model.find(filterData).populate([
            {
                path: 'makeId', 
                select: 'title',
                
            }
        ]).sort({_id:-1});

        message = {
            error: false,
            message: "All Model list",
            data: ModelData,
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
ModelRoute.get("/detail/:modelId",isAuthenticate, async (req, res) => {
    try {
        let ModelData = await Model.findOne({_id:req.params.modelId}).populate([
            {
                path: "makeId",
                select:"title" 
            }
        ])

        message = {
            error: false,
            message: "Detail Model list",
            data: ModelData,
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

ModelRoute.patch("/update/:modelId",isAuthenticate, async (req, res) => {
	try {
		const result = await Model.findOneAndUpdate({ _id: req.params.modelId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Model updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Model not updated",
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
ModelRoute.get("/changestatus/:modelId", isAuthenticate, async(req,res) => {
    try{
        let modelData = await Model.findOne({_id:req.params.modelId});

        if(modelData.status == true){
            await Model.findOneAndUpdate({_id:req.params.modelId}, { status: false }, {new: true})

            message = {
                error: false,
                message: "Model status changed to inactive",
                data: {},
            };
            res.status(200).send(message);

        } else {
            await Model.findOneAndUpdate({_id:req.params.modelId}, { status: true }, {new: true})

            message = {
                error: false,
                message: "Model status changed to active",
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

ModelRoute.delete("/delete/:modelId", async (req, res) => {
    try {
        // const result = await Model.deleteOne({
        //     _id: req.params.modelId
        // });
        // if (result.deletedCount == 1) {
        //     message = {
        //         error: false,
        //         message: "Model deleted successfully!",
        //     };
        //     res.status(200).send(message);
        // } else {
        //     message = {
        //         error: true,
        //         message: "Operation failed!",
        //     };
        //     res.status(200).send(message);
        // }
        const result = await Model.findByIdAndUpdate(
            req.params.modelId,
            { $set: { isDelete: true } },
            { new: true, strict: false }
        );
        return res.status(200).json({message: "Deleted", status: 200, result })
    } catch (err) {
        message = {
            error: true,
            message: "Operation Failed!",
            data: err,
        };
        res.status(200).send(message);
    }
});

module.exports = ModelRoute;