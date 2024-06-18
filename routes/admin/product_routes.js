require("dotenv").config();
const express = require("express");
const Category = require("../../models/category");
const Product = require("../../models/product");
const ProductRoute = express.Router();
const isAuthenticate = require("../../middleware/authcheck"); /* For GTS Admin */
const generateIndex = require("../../helper/generateIndex");
//const AvailableProductNotification = require("../../models/availableProductNotification");
const RetailerProtfolio = require("../../models/retailerportfolio");
const AdminNotification = require("../../models/adminNotification");
const RetailerNotification = require("../../models/retailernotification");
const ProductVechicle = require("../../models/product_vehicles");
const errorMessage = require("../../helper/errorMessage");
/*
* Create product *
*/

ProductRoute.post("/create",isAuthenticate, async(req,res) => {
    try{  
        
        let catId = req.body.catId;
        let subcat0Id = req.body.subcat0Id;
        let subcat1Id = req.body.subcat1Id;

        let checkcatId = await Category.findOne({_id:catId,parentId:undefined})
        if(!checkcatId){
            errorMessage = {
                error: true,
                message: "No category found",
                data: {}
            };
            return res.status(200).send(errorMessage);
        }
        let checksubcat0Id = await Category.findOne({_id:subcat0Id,parentId:catId})
        if(!checksubcat0Id){
            errorMessage = {
                error: true,
                message: "No first child category found",
                data: {}
            };
            return res.status(200).send(errorMessage);
        }
        if(subcat1Id){            
            let checksubcat1Id = await Category.findOne({_id:subcat1Id})            
            if(!checksubcat1Id){
                errorMessage = {
                    error: true,
                    message: "No second child category found",
                    data: {}
                };
                return res.status(200).send(errorMessage);
            }
        }
        let countPro = await Product.count();        
        let newStartNo = countPro+1;
        let startWithVal = newStartNo.toString(); 
        console.log(startWithVal)
        let pro_no = "GTS" + generateIndex(10,startWithVal);
        console.log(pro_no)
        req.body.pro_no = pro_no;

        let result = await Product.create(req.body);
        let prodId = result._id;

        if(req.body.partNo){            
            let  checkOtherRequestedPartNo = await RetailerProtfolio.find({partNo:req.body.partNo});
            checkOtherRequestedPartNo = JSON.parse(JSON.stringify(checkOtherRequestedPartNo));
            for(var i in checkOtherRequestedPartNo){
                let retailerId = checkOtherRequestedPartNo[i].retailerId
                let retailerNotiData = {
                    'retailerId' : retailerId,
                    'prodId' : prodId,
                    'description' : "Item is available from GTS",
                    'type' : 'available_item',
                    'entryDate' : new Date,
                }
                await RetailerNotification.create(retailerNotiData);
            }
           await RetailerProtfolio.deleteMany({partNo:req.body.partNo});
        }

		message = {
			error: false,
			message: "Product Created Successfully!",
			data: result,
		};
		return res.status(201).send(message);
    } catch(err) {
        message = {
			error: true,
			message: errorMessage(err),
			data: err.toString()
		};
		return res.status(200).send(message);
    }
})

/*
* Update product *
*/

ProductRoute.put("/update/:productId",isAuthenticate, async(req,res) => {
	try {
		const result = await Product.findOneAndUpdate({ _id: req.params.productId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Product updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Product not updated",
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
})

/*
* List Product *
*/

ProductRoute.get("/list",isAuthenticate, async(req,res) => {
	try {
        let searchText = req.query.search;
        let brandId = req.query.brandId;
        let catId = req.query.catId;
        let subcat0Id = req.query.subcat0Id;
        let subcat1Id = req.query.subcat1Id;

        let searchBy = {
            $and:[
                // {status:true} 
                {}
            ]
        }
        if(searchText){
            searchBy.$and.push(
                {$or:[
                    {title: {$regex: searchText, $options: 'i'}},
                    {partNo: {$regex: searchText, $options: 'i'}}
                ]}
                
            )
        }
                
        if(catId){            
            searchBy.$and.push({catId:catId}) 
        }
        if(subcat0Id){
            searchBy.$and.push({subcat0Id:subcat0Id}) 
        }
        if(subcat1Id){           
            searchBy.$and.push({subcat1Id:subcat1Id}) 
        }
        if(brandId){            
            searchBy.$and.push({brandId:brandId})            
        }

        console.log(searchBy)

        let prodList = await Product.find(searchBy).populate([
            {path:"catId", select:"title"},
            {path:"subcat0Id", select:"title"},
            {path:"subcat1Id", select:"title"},
            {path:"brandId", select:"title"}
        ]).sort({_id:-1});

        let countData = prodList.length;
		
        message = {
            error: false,
            message: "All product list",
            data: {countData,prodList},
        };
        res.status(200).send(message);
    } catch(err) {
        message = {
            error: true,
            message: "Oops! Something went wrong",
            data: err.toString(),
        };
        res.status(200).send(message);
    }
})

/*
* Details Product *
*/

ProductRoute.get("/:productId",isAuthenticate, async(req,res) => {
	
	try {
		let prodId = req.params.productId;
        var ProductData = await Product.findOne({_id:prodId}).populate([
			{path:"catId",select:"title desc"},
			{path:"subcat0Id",select:"title desc"},
            {path:"subcat1Id",select:"title desc"}
		]);
		
        ProductData = JSON.parse(JSON.stringify(ProductData));
        ProductData.vehicles = await ProductVechicle.find({prodId:prodId}).populate([
            {
                path:"makeId",
                select:"title"
            },
            {
                path:"modelId",
                select:"title"
            },
            {
                path:"yearId",
                select:"title"
            },
            {
                path:"variantId",
                select:"title"
            },
        ]);

        message = {
            error: false,
            message: "Product Details",
            data: ProductData,
        };
        res.status(200).send(message);
    } catch(err) {
        if(err.name === "CastError"){
            let errors = "Unknown value '"+err.value+"' "+err.kind+" to map";
      
            message = {
				error: true,
				message: "Operation failed",
                data: errors
			};
      
            return res.status(400).send(message);
        }        
        return res.status(500).send(err);
    }
})

/*
* Delete Product *
*/
ProductRoute.delete("/:productId", async(req, res) => {
	try {
        // const result = await Product.deleteOne({
        //     _id: req.params.productId
        // });
		
        // if (result.deletedCount == 1) {
        //     message = {
        //         error: false,
        //         message: "Product deleted successfully!",
        //     };
        //     res.status(200).send(message);
        // } else {
        //     message = {
        //         error: true,
        //         message: "Oops! Soemthing went wrong",
        //     };
        //     res.status(200).send(message);
        // }
        const result = await Product.findByIdAndUpdate(
            req.params.productId,
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
})
/*
** Status Change with query param productId
*/
ProductRoute.get("/changestatus/:productId", isAuthenticate, async(req,res) => {
    try{
        let prodId = req.params.productId;
        let productvehicleData = await ProductVechicle.findOne({prodId:prodId})
        console.log(productvehicleData);
        if(productvehicleData.status == true)
        {
        let proData = await Product.findOne({_id:req.params.productId});

        if(proData.status == true){
            await Product.findOneAndUpdate({_id:req.params.productId}, { status: false }, {new: true})

            message = {
                error: false,
                message: "Product status changed to inactive",
                data: {},
            };
            res.status(200).send(message);

        } else {
            await Product.findOneAndUpdate({_id:req.params.productId}, { status: true }, {new: true})

            message = {
                error: false,
                message: "Product status changed to active",
                data: {},
            };
            res.status(200).send(message);
        }
    }else{
        message = {
            error: true,
            message: "Cant Change the status ",
            data: {},
        };
        res.status(200).send(message);
    }
    }catch(err){
        if(err.name === "CastError"){
            let errors = "Unknown value '"+err.value+"' "+err.kind+" to map";
      
            message = {
				error: true,
				message: "Operation failed",
                data: errors
			};
      
            return res.status(400).send(message);
        }        
        return res.status(500).send(err);
    }
})

/*
* Upload files *
*/

ProductRoute.post("/uploadimages/:productId",isAuthenticate, async(req, res) => {
    try {
		var images = req.body.images;
        
        for(var i=0; i < images.length; i++){
            var image =  images[i];
            // return res.send(image);
            var result = await Product.findOneAndUpdate(
                { _id: req.params.productId }, 
                { $push: { 'images': image } }                
            );
        }

        message = {
            error: false,
            message: "Images saved successfully!",
            data: images
            
        };
        res.status(200).send(message);
		
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
 * This Method is used for Product Ve=echicle create
 */

ProductRoute.post("/assign-vehicle", isAuthenticate, async(req, res) => {
   try{
    let prodId = req.body.prodId;
    let productvehicleData = await ProductVechicle.findOne({prodId:prodId});
    let deletedDAta = await ProductVechicle.deleteMany({prodId:prodId});

    let vehiclegroup = req.body.vehiclegroup;
    for(var i in vehiclegroup){
        let vehicleData = {
            prodId: prodId,
            makeId: vehiclegroup[i].makeId,
            modelId: vehiclegroup[i].modelId,
            yearId: vehiclegroup[i].yearId,
            variantId: vehiclegroup[i].variantId,
        }
        await ProductVechicle.create(vehicleData);
    }
    message = {
        error: false,
        message: "Vehicle assigned Successfully!",
        data: vehiclegroup,
    };
    return res.status(201).send(message);

   }catch(err){
    message = {
        error: true,
        message: "Operation Failed!",
        data: err.toString()
    }
    return res.status(201).send(message);
   }
});


/**
 * This Method is used for search 
 */

ProductRoute.post("/search", isAuthenticate, async (req, res) => {
	try {
		const searchText = req.body.searchText;
		const productData = await Product.find({}).populate([
            {
                path: 'catId', 
                select: 'title', 
                match: { $or: [
                    {"title": {"$regex": searchText, $options: 'i'}},
                    // {"lname": {"$regex": searchText, $options: 'i'}},
                    // {"email": {"$regex": searchText, $options: 'i'}},
                    // {"mobile": {"$regex": searchText, $options: 'i'}},
                    // {"register_with": {"$regex": searchText, $options: 'i'}}
                ]}
            },
            
            {
                path: 'make_details', 
                select: 'title', 
                match: { $or: [
                    {"title": {"$regex": searchText, $options: 'i'}},
                    // {"lname": {"$regex": searchText, $options: 'i'}},
                    // {"email": {"$regex": searchText, $options: 'i'}},
                    // {"mobile": {"$regex": searchText, $options: 'i'}},
                    // {"register_with": {"$regex": searchText, $options: 'i'}}
                ]}
            },
            {
                path: 'model_details', 
                select: 'title', 
                match: { $or: [
                    {"title": {"$regex": searchText, $options: 'i'}},
                    // {"lname": {"$regex": searchText, $options: 'i'}},
                    // {"email": {"$regex": searchText, $options: 'i'}},
                    // {"mobile": {"$regex": searchText, $options: 'i'}},
                    // {"register_with": {"$regex": searchText, $options: 'i'}}
                ]}
            }
        ])

        const result = productData.filter(e => {
            return e.catId && e.subcatId && e.make_details && e.model_details != null ;
          });
		
		if (result) {
			message = {
				error: false,
				message: "Product search successfully!",
				data:result
			};
			
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Product search failed",
			};
			
			res.status(200).send(message);
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




/*
** Status Change with query param productId
*/
ProductRoute.get("/toggle-status/:proVehicleId", isAuthenticate, async(req,res) => {
    try{
        //let prodId = req.params.productId;
        let productvehicleData = await ProductVechicle.findOne({_id:req.params.proVehicleId})

        if(productvehicleData.status == true){
            await ProductVechicle.findOneAndUpdate({_id:req.params.proVehicleId}, { status: false }, {new: true})

            message = {
                error: false,
                message: "Product Vehicle status changed to inactive",
                data: {},
            };
            res.status(200).send(message);

        } else {
            await ProductVechicle.findOneAndUpdate({_id:req.params.proVehicleId}, { status: true }, {new: true})

            message = {
                error: false,
                message: "Product Vehicle status changed to active",
                data: {},
            };
            res.status(200).send(message);
        }
    }catch(err){
        if(err.name === "CastError"){
            let errors = "Unknown value '"+err.value+"' "+err.kind+" to map";
      
            message = {
				error: true,
				message: "Operation failed",
                data: errors
			};
      
            return res.status(400).send(message);
        }        
        return res.status(500).send(err);
    }
});

/**
 * list for product vehicle group
 */

// ProductRoute.get("/vehicle-list",async(req,res)=>{
//     try{
//         //let searchText = req.query.searchText;
//         let makeId = req.query.makeId;
//         let modelId = req.query.modelId;
//         let yearId = req.query.yearId;
//         let variantId = req.query.variantId;

//         let searchBy = {
//             $and:[
//                  {status:true} 
//                //{}
//             ]
//         }
//         // if(searchText){
//         //     searchBy.$and.push(
//         //         {$or:[
//         //             {title: {$regex: searchText, $options: 'i'}},
//         //             //{partNo: {$regex: searchText, $options: 'i'}}
//         //         ]}
                
//         //     )
//         // }
                
//         if(makeId){            
//             searchBy.$and.push({makeId:makeId})            
//         }
//         if(modelId){            
//             searchBy.$and.push({modelId:modelId})
//         }
//         if(yearId){
//             searchBy.$and.push({yearId:yearId})
//         }
//         if(variantId){
//             searchBy.$and.push({variantId:variantId})
//         }

//         // console.log(searchBy)

//         let proVehicleList = await ProductVechicle.find(searchBy).populate([
//             {path:"makeId", select:"title"},
//             {path:"modelId", select:"title"},
//             {path:"yearId", select:"title"},
//             {path:"variantId", select:"title"},
//         ]).sort({_id:-1});

//         message = {
//             error: false,
//             message: "All Product Vechicle list",
//             data: proVehicleList
//         };
//         res.status(200).send(message);
//     } catch(err) {
//         message = {
//             error: true,
//             message: "Oops! Something went wrong",
//             data: err.toString(),
//         };
//         res.status(200).send(message);
//     }
// })

module.exports = ProductRoute;