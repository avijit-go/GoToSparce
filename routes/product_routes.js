require("dotenv").config();
const express = require("express");
const ProductRoute = express.Router();
const isAuthenticate = require("../middleware/authcheck"); /* For User (wholesaler or vehicle owener) */
const UserId  = require("../helper/getUserToken");
const Product = require("../models/product");
const Wishlist = require("../models/wishlist");
const Review = require("../models/review");
const ProductVechicle = require("../models/product_vehicles");
const Vechicle = require("../models/vehicle");
const Make = require("../models/make");

/*
** List
*/
// ProductRoute.get("/list",  async(req,res) => {
//     try{

//         let headers = req.headers;
//         let userId = '';
//         if(headers.authorization){
//             let token = headers.authorization.split(' ')[1];
//             let user = UserId(token)
//             userId = user.data._id;
//             let userType = user.data.register_with;
//             /* Check user wholesalr or vehicleowner or not */
//             if(userId && !userType){
//                 message = {
//                     error: true,
//                     message: "Logged in with unknown user",
//                     data: {}
//                 }
//                 return res.status(200).send(message)
//             }
//         }
        
//         /* query params for search or filter */
//         let searchText = req.query.search;


//         //let makeId = req.query.makeId;
//         let brandId = req.query.brandId;
//         //let modelId = req.query.modelId;


//         //let yearId = req.query.yearId;
//         let catId = req.query.catId;
//         let subcat0Id = req.query.subcat0Id;
//         let subcat1Id = req.query.subcat1Id;

//         let searchBy = {
//             $and:[
//                 {status:true}
//             ]
//         }
//         if(searchText){
//             searchBy.$and.push(
//                 {$or:[
//                     {title: {$regex: searchText, $options: 'i'}},
//                     {partNo: {$regex: searchText, $options: 'i'}}
//                 ]}
                
//             )
//         }
                
//         if(catId){            
//             searchBy.$and.push({catId:catId}) 
//         }
//         if(subcat0Id){
//             searchBy.$and.push({subcat0Id:subcat0Id}) 
//         }
//         if(subcat1Id){           
//             searchBy.$and.push({subcat1Id:subcat1Id}) 
//         }
//         // if(makeId){            
//         //     searchBy.$and.push({makeId:makeId})            
//         // }
//         if(brandId){            
//             searchBy.$and.push({brandId:brandId})            
//         }
//         // if(modelId){            
//         //     searchBy.$and.push({modelId:modelId})
//         // }
//         // if(yearId){
//         //     searchBy.$and.push({yearId:yearId})
//         // }

//         // console.log(searchBy)

//         let prodList = await Product.find(searchBy)
//         /*.select('title catId subcat0Id subcat1Id makeId modelId yearId retailerPrice retailerDiscountedPrice customerPrice customerDiscountedPrice origin partNo images')
//         .select('')*/
//         .populate([
//             /*{path:"makeId", select:"title"}*/,{path:"brandId", select:"title"},/*{path:"modelId", select:"title"},{path:"yearId", select:"title"},*/{path:"catId", select:"title"},{path:"subcat0Id", select:"title"}
//         ])
//         .sort({_id:-1});

//         prodList = JSON.parse(JSON.stringify(prodList));

//         for(var i in prodList){
//             prodList[i].isWishlisted = false;
//             if(userId){
//                 let checkWishlist = await Wishlist.findOne({proId:prodList[i]._id,user_id:userId});
//                 if(checkWishlist){
//                     prodList[i].isWishlisted = true;
//                 } 
//             }
            
//         }
//         let countData = prodList.length;
		
//         message = {
//             error: false,
//             message: "All product list",
//             data: {countData,prodList},
//         };

//         return res.status(200).send(message)

//     }catch(err){
//         message = {
//             error: true,
//             message: "Operation failed",
//             data: err.toString()
//         }
//         return res.status(200).send(message)
//     }
// })

/**
 * This method is used to filter profucts by make, model, year, variant
 */
ProductRoute.get("/filter-products",  async(req,res) => {
    try {
        let makeId = req.query.makeId;
        let modelId = req.query.modelId;
        let yearId = req.query.yearId;
        let variantId = req.query.variantId;
        let type = req.query.type;
        let select = ""
        let populate = []
        let filter = {}

        if (type === 'makeId') {
            filter = {status: true}
            select = "makeId"
            populate = [
                {
                    path: "makeId",
                    select: "title"
                }
            ]
        } else if (type === 'modelId') {
            filter = {status: true, makeId}
            select = "makeId modelId"
            populate = [
                {
                    path: "modelId",
                    select: "title"
                }
            ]
        } else if (type === 'yearId') {
            filter = {status: true, makeId, modelId}
            select = "makeId modelId yearId"
            populate = [
                {
                    path: "yearId",
                    select: "title"
                }
            ]
        } else if (type === 'variantId') {
            filter = {status: true, makeId, modelId, yearId}
            select = "makeId modelId yearId variantId"
            populate = [
                {
                    path: "variantId",
                    select: "title"
                }
            ]
        }

        let makesData = await ProductVechicle.find(filter).populate(populate)
        let data = Array()
        data = makesData.map(e => {
            return e[type]
        })
        data = [...new Map(data.map(item => [item['_id'], item])).values()];
        
        return res.status(200).send({
            error: false,
            message: `${type} list`,
            data
        })

    } catch (error) {
        return res.status(200).send({
            error: true,
            message: String(error)
        })
    }
})

ProductRoute.get("/allproduct",  async(req,res) => {
    try{
        let headers = req.headers;
        let userId = '';
        if(headers.authorization){
            let token = headers.authorization.split(' ')[1];
            let user = UserId(token)
            userId = user.data._id;
            let userType = user.data.register_with;
            /* Check user wholesalr or vehicleowner or not */
            if(userId && !userType){
                message = {
                    error: true,
                    message: "Logged in with unknown user",
                    data: {}
                }
                return res.status(200).send(message)
            }
        }

        let makeId = req.query.makeId;
        let modelId = req.query.modelId;
        let yearId = req.query.yearId;
        let variantId = req.query.variantId;

        let searchByProdVehicle = {
            $and:[
                {status:true}
            ]
        }

        if(makeId){            
            searchByProdVehicle.$and.push({makeId:makeId}) 
        }
        if(modelId){ 
            if(!makeId){
                message = {
                    error: true,
                    message: "Please choose make",
                    data: {}
                }
                return res.status(200).send(message)
            }           
            searchByProdVehicle.$and.push({modelId:modelId}) 
        }
        if(yearId){   
            if(!makeId){
                message = {
                    error: true,
                    message: "Please choose make",
                    data: {}
                }
                return res.status(200).send(message)
            }  
            if(!modelId){
                message = {
                    error: true,
                    message: "Please choose model",
                    data: {}
                }
                return res.status(200).send(message)
            }           
            searchByProdVehicle.$and.push({yearId:yearId}) 
        }
        if(variantId){    
            if(!makeId){
                message = {
                    error: true,
                    message: "Please choose make",
                    data: {}
                }
                return res.status(200).send(message)
            }  
            if(!modelId){
                message = {
                    error: true,
                    message: "Please choose model",
                    data: {}
                }
                return res.status(200).send(message)
            }  
            if(!yearId){
                message = {
                    error: true,
                    message: "Please choose year",
                    data: {}
                }
                return res.status(200).send(message)
            }          
            searchByProdVehicle.$and.push({variantId:variantId}) 
        }

        let proids = [];
        if(makeId){
            let productVechicleList = await ProductVechicle.find(searchByProdVehicle);
            if(!productVechicleList.length) return res.status(200).send({
                error: false,
                message: "All product list",
                data: 0,
                prodList: []
            })
            productVechicleList = JSON.parse(JSON.stringify(productVechicleList))
                       
            for(var i in productVechicleList){
                proids.push(productVechicleList[i].prodId);
            }
        }        
        let searchText = req.query.search;
        let catId = req.query.catId;
        let subcat0Id = req.query.subcat0Id;
        let subcat1Id = req.query.subcat1Id;
        let brandId = req.query.brandId

        let searchList = {
            $and:[
                {status:[true]}
            ]
        }
        if(searchText){
            searchList.$and.push(
                {$or:[
                    {title: {$regex: searchText, $options: 'i'}},
                    {partNo: {$regex: searchText, $options: 'i'}}
                ]}
                
            )
        }

        if(catId){            
            searchList.$and.push({catId:catId}) 
        }
        if(subcat0Id){            
            searchList.$and.push({subcat0Id:subcat0Id}) 
        }
        if(subcat1Id){            
            searchList.$and.push({subcat1Id:subcat1Id}) 
        }
        if(brandId){            
            searchList.$and.push({brandId:brandId}) 
        }


        if(proids.length > 0){            
            searchList.$and.push({_id: {$in: proids}});            
        }

        prodList = await Product.find(searchList);

        prodList = JSON.parse(JSON.stringify(prodList));

        for(var i in prodList){
            prodList[i].isWishlisted = false;
            if(userId){
                let checkWishlist = await Wishlist.findOne({proId:prodList[i]._id,user_id:userId});
                if(checkWishlist){
                    prodList[i].isWishlisted = true;
                } 
            }
            
        }

        
        let countPro = prodList.length;

        // // console.log(prodList);

        // let productVechicleList = {}
		
        message = {
            error: false,
            message: "All product list",
            // data: {countData,prodList},
            data: 

            // uniqueprodId,
            countPro,
            prodList
        };

        return res.status(200).send(message)

    }catch(err){
        message = {
            error: true,
            message: "Operation failed",
            data: err.toString()
        }
        return res.status(200).send(message)
    }
})


ProductRoute.get("/get-year-variant",async(req,res)=>{
    try{
        var makeId = req.query.makeId;
        var modelId = req.query.modelId;
        var yearId = req.query.yearId;
        var yearList;
        var variantList;
        if(req.query.searchyear){
           yearList = await Vechicle.find({$and:[{makeId:makeId},{modelId:modelId}]}).populate([
            {
                path:"yearId",
                select:"title"
            }
           ])
        }
    
        if(req.query.searchvariant){
             variantList = await Vechicle.find({$and:[{makeId:makeId},{modelId:modelId},{yearId:yearId}]}).populate([
                {
                    path:"variantId",
                    select:"title"
                }
               ])
        }
        
        message = {
            error:false,
            message: "List Of all Data",
            yearListData:yearList,
            variantListData:variantList
        }
        return res.status(200).send(message)
 
    }catch(err){
        message = {
            error:true, 
            message:"Operation Failed",
            data:err.toString()
        }
        return res.status(200).send(message)
    }
})

/*
** Details
*/
ProductRoute.get("/:id",  async(req,res) => {
    try{
        let headers = req.headers;
        let userId = '';
        if(headers.authorization){
            let token = headers.authorization.split(' ')[1];
            let user = UserId(token)
            userId = user.data._id;
            let userType = user.data.register_with;
            /* Check user wholesalr or vehicleowner or not */
            if(userId && !userType){
                message = {
                    error: true,
                    message: "Logged in with unknown user",
                    data: {}
                }
                return res.status(200).send(message)
            }
        }


        let proDetails = await Product.findOne({_id:req.params.id}).populate([
            {
                path:"catId", select: "title"
            },
            {
                path:"subcat0Id", select: "title"
            },
            {
                path:"subcat1Id", select: "title"
            },
            // {
            //     path:"makeId", select: "title"
            // },
            {
                path:"brandId", select: "title"
            },
            // {
            //     path:"modelId", select: "title"
            // },
            // {
            //     path:"yearId", select: "title"
            // }
        ]);

        proDetails = JSON.parse(JSON.stringify(proDetails));
        proDetails.isWishlisted = false;
        if(userId){
            let checkWishlist = await Wishlist.findOne({proId:proDetails._id,user_id:userId});
            if(checkWishlist){
                proDetails.isWishlisted = true;
            } 
        }
        
        let reviews = await Review.find({prodId:req.params.id}).populate([
            {path:"user_id", select: "fname lname register_with email mobile"}
        ]).sort({_id:-1});
        reviews = JSON.parse(JSON.stringify(reviews));
        ratingArr = [];
        for(var i in reviews){
            let rating = Number(reviews[i].rating)
            ratingArr.push(rating)
        }

        let avgRating = 0;
        if(ratingArr.length > 0){
            var total = 0;
            var count = 0;
            ratingArr.forEach(function(item, index) {
                total += item;
                count++;
            });

            avgRating =  total / count;
        }

        // console.log(ratingArr)
        // console.log(avgRating)
        proDetails.avgRating = avgRating;
        proDetails.reviews = reviews;

        let relatedProducts = await Product.find({
            _id: {$ne: req.params.id},
            $and:[{catId:proDetails.catId},{subcat0Id:proDetails.subcat0Id},{subcat1Id:proDetails.subcat1Id}]

        }).populate([
            {
                path:"catId", select: "title"
            },
            {
                path:"subcat0Id", select: "title"
            },
            {
                path:"subcat1Id", select: "title"
            },
            // {
            //     path:"makeId", select: "title"
            // },
            {
                path:"brandId", select: "title"
            },
            // {
            //     path:"modelId", select: "title"
            // },
            // {
            //     path:"yearId", select: "title"
            // }
        ])

        relatedProducts = JSON.parse(JSON.stringify(relatedProducts));

        for(var i in relatedProducts){
            relatedProducts[i].isWishlisted = false;
            if(userId){
                let checkWishlist = await Wishlist.findOne({proId:relatedProducts[i]._id,user_id:userId});
                if(checkWishlist){
                    relatedProducts[i].isWishlisted = true;
                } 
            }
            
        }
        
        message = {
            error: false,
            message: "Product details",
            data: {proDetails,relatedProducts}
        }
        return res.status(200).send(message)

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


ProductRoute.delete("/delete/:id", async(req, res) => {
    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: { isDelete: true } },
        { new: true, strict: false }
    );
    return res.status(200).json({message: "Deleted review", status: 200, Product: updatedProduct})
})

ProductRoute.get("/get-list-products/:carId", async(req, res, next) => {
    try {
       const data = await Product.find({vehicleId: req.params.cardId});
       return res.status(200).json({statu: 200, data}) 
    } catch (error) {
        next(error)
    }
})


module.exports = ProductRoute;