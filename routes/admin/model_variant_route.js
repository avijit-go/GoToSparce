require("dotenv").config();
const express = require("express");
const ModelVariant = require("../../models/model_variant");
const ModelVariantRoute = express.Router();
const isAuthenticate = require("../../middleware/authcheck");



/**
 * This method is to create ModelYear
 */
ModelVariantRoute.post("/create",isAuthenticate, async (req, res) => {
	try {
		const ModelVariantData = new ModelVariant(req.body);
		const result = await ModelVariantData.save();
		message = {
			error: false,
			message: "Model Variant Added Successfully!",
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
ModelVariantRoute.get("/list",isAuthenticate, async (req, res) => {
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
                

        let ModelVariantData = await ModelVariant.find({}).populate([
            {
                path: 'makeId', 
                select: 'title',
                
            },
            {
                path: 'modelId', 
                select: 'title',
                
            },
            {
                path: 'modelyearId', 
                //select: 'title',
                
            },
            {
                path: 'variantId', 
                select: 'title',
                
            },

        ]).sort({_id:-1});

        message = {
            error: false,
            message: "All Model Variant list",
            data: ModelVariantData,
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
ModelVariantRoute.get("/detail/:modelvariantId",isAuthenticate, async (req, res) => {
    try {
        let ModelVariantData = await ModelVariant.findOne({_id:req.params.modelvariantId}).populate([
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
                
            },
            {
                path: 'variantId', 
                select: 'title',
                
            },
        ])

        message = {
            error: false,
            message: "Detail Model Variant list",
            data: ModelVariantData,
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

ModelVariantRoute.patch("/update/:modelvariantId",isAuthenticate, async (req, res) => {
	try {
		const result = await ModelVariant.findOneAndUpdate({ _id: req.params.modelvariantId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Model Variant updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Model Variant not updated",
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
ModelVariantRoute.get("/changestatus/:modelvariantId", isAuthenticate, async(req,res) => {
    try{
        let ModelVariantData = await ModelVariant.findOne({_id:req.params.modelvariantId});

        if(ModelVariantData.status == true){
            await ModelVariant.findOneAndUpdate({_id:req.params.modelvariantId}, { status: false }, {new: true})

            message = {
                error: false,
                message: "Model Variant status changed to inactive",
                data: {},
            };
            res.status(200).send(message);

        } else {
            await ModelVariant.findOneAndUpdate({_id:req.params.modelvariantId}, { status: true }, {new: true})

            message = {
                error: false,
                message: "Model variant status changed to active",
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

ModelVariantRoute.delete("/delete/:modelvariantId",isAuthenticate, async (req, res) => {
    try {
        // const result = await ModelVariant.deleteOne({
        //     _id: req.params.modelvariantId
        // });
        // if (result.deletedCount == 1) {
        //     message = {
        //         error: false,
        //         message: "Model Variant deleted successfully!",
        //     };
        //     res.status(200).send(message);
        // } else {
        //     message = {
        //         error: true,
        //         message: "Operation failed!",
        //     };
        //     res.status(200).send(message);
        // }
        const result = await ModelVariant.findByIdAndUpdate(
            req.params.modelvariantId,
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

module.exports = ModelVariantRoute;