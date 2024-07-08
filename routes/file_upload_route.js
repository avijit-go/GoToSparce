/** @format */

require("dotenv").config();
const express = require("express");
const app = express();
const fileUploadRouter = express.Router();
const path = require("path");
var admin = require("firebase-admin");
var serviceAccount = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY,
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_url: process.env.AUTH_URL,
  token_url: process.env.TOKEN_URL,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER,
  client_x509_cert_url: process.env.CLIENT_URL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  storageBucket: process.env.BUCKET_URL,
});
app.locals.bucket = admin.storage().bucket();

const { v4: uuidv4 } = require("uuid");
//multer
const multer = require("multer");
const csv = require("csv-parser");
const Product = require("../models/product");
const Brand = require("../models/brand");
const CategoryModel = require("../models/category");
const MakeData = require("../models/make");
const ModelData = require("../models/model");
const YearData = require("../models/year");
const VariantData = require("../models/variant");

const ProductVechicle = require("../models/product_vehicles");
const generateIndex = require("../helper/generateIndex");
const Stock = require("../models/stock");

const acceptedFileTypes = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/pdf",
  "text/csv",
];
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (!acceptedFileTypes.includes(file.mimetype)) {
      return cb(
        new Error("Only .png, .jpg, .jpeg, .pdf, .csv format allowed!")
      );
    }
    cb(null, true);
  },
});

/**
 * This method is used upload files
 */
/*
fileUploadRouter.post(
  "/upload",
  upload.single("file"),
  async (req, res, next) => {
    try {
      const name = "GTS_" + Date.now();
      const fileName = name + path.extname(req.file.originalname);
      const fileData = await app.locals.bucket
        .file(fileName)
        .createWriteStream()
        .end(req.file.buffer);

      fileurl = `https://firebasestorage.googleapis.com/v0/b/file-upload-manage.appspot.com/o/${fileName}?alt=media`;

      res.status(200).send({
        error: false,
        // data: {file: req.file, fileData, fileName, fileurl}
        data: { fileName, fileurl },
      });
    } catch (error) {
      res.status(200).send({
        error: true,
        mssage: String(error),
      });
    }
  }
);
*/
fileUploadRouter.post(
  "/upload",
  async (req, res, next) => {
    try {
      const result = await cloudinary.uploader.upload(req.files.file.tempFilePath);
      res.status(200).send({
        error: false,
        // data: {file: req.file, fileData, fileName, fileurl}
        data: { fileurl: result.url },
      });
    } catch (error) {
      res.status(200).send({
        error: true,
        mssage: String(error),
      });
    }
  }
);

/**
 * This method is used import CSV file to database
 */
fileUploadRouter.post(
  "/product-csv-upload/:csvType",
  upload.single("file"),
  async (req, res, next) => {
    try {
      let results = [];
      let arr = [];
      let fileName = req.body.file;
      let fileMime = fileName.split(".").reverse()[0];
      console.log("file", fileName);
      if (fileMime != "csv")
        return res
          .status(200)
          .send({ error: true, message: "Only CSV file is allowed." });

      await app.locals.bucket
        .file(fileName)
        .createReadStream()
        .on("error", (error) => {
          // handle error
          res.status(200).send({
            error: true,
            message: `failed`,
            error,
          });
        })
        .pipe(csv())
        .on("data", (data) => {
          results.push(data);
        })
        .on("end", async () => {
          let resp;
          if (req.params.csvType == "Product") {
            try {
              // Trading log CSV Uppload
              const productCount = await Product.countDocuments();
              for (let index = 0; index < results.length; index++) {
                data = results[index];
                brandData = await Brand.findOne({
                  title: data["brandId"],
                  status: true,
                });
                categoryData = await CategoryModel.findOne({
                  title: data["catId"],
                });
                subCategoryData = await CategoryModel.findOne({
                  title: data["subcat0Id"],
                });

                keys = Object.keys(data).map((e1) => e1.trim());
                specifications = [];
                images = [];
                speckeys = keys.filter((e2) => e2.trim().search("spec") > -1);
                imagekeys = keys.filter((e2) => e2.trim().search("image") > -1);

                if (speckeys.length % 2 === 0) {
                  for (let index = 1; index <= speckeys.length / 2; index++) {
                    if (
                      data[`spec_key${index}`] != "" &&
                      data[`spec_val${index}`] != ""
                    ) {
                      specifications.push({
                        key: data[`spec_key${index}`],
                        value: data[`spec_val${index}`],
                      });
                    }
                  }
                }

                for (let index = 1; index <= imagekeys.length; index++) {
                  if (data[`image${index}`] != "") {
                    images.push(data[`image${index}`]);
                  }
                }

                console.log(
                  "specifications >>>>>>>>>>>>>>>>>>> ",
                  specifications
                );
                if (brandData && categoryData && subCategoryData) {
                  data.specifications = specifications;
                  data.images = images;

                  data.brandId = brandData?._id;
                  data.catId = categoryData?._id;
                  data.subcat0Id = subCategoryData?._id;
                  data.subcat1Id = undefined;
                  data.pro_no =
                    "GTS" +
                    generateIndex(10, (productCount + index).toString());
                  data.costPrice = data.mrp;
                  data.customerDiscountedPrice =
                    Number(data.mrp) > 0
                      ? data.mrp -
                        data.mrp * (data.customerPricePercentage / 100)
                      : data.mrp;
                  data.retailerDiscountedPrice =
                    Number(data.mrp) > 0
                      ? data.mrp -
                        data.mrp * (data.retailerPricePercentage / 100)
                      : data.mrp;
                } else {
                  res.status(200).send({
                    error: true,
                    message: `failed`,
                  });
                }

                arr.push(data);
              }
              // console.log("results >>>>>>>>>> ", arr);
              // resp = arr;
              resp = await Product.insertMany(arr);
            } catch (error) {
              res.status(200).send({
                error: true,
                mssage: String(error),
              });
            }
          } else if (req.params.csvType == "ProductVechicle") {
            // User CSV Upload
            let productPartNos = Array();
            let adminStockData = Array();
            try {
              for (let index = 0; index < results.length; index++) {
                data = results[index];
                productData = await Product.findOne({ partNo: data["partNo"] });
                makeDataByTitle = await MakeData.findOne({
                  title: data["makeId"],
                  status: true,
                });
                modelDataByTitle = await ModelData.findOne({
                  title: data["modelId"],
                  status: true,
                });
                yearDataByTitle = await YearData.findOne({
                  title: data["yearId"],
                  status: true,
                });
                variantDataByTitle = await VariantData.findOne({
                  title: data["variantId"],
                  status: true,
                });

                if (
                  productData &&
                  makeDataByTitle &&
                  modelDataByTitle &&
                  yearDataByTitle &&
                  variantDataByTitle
                ) {
                  productPartNos.push(data["partNo"]);
                  adminStockData.push({
                    proId: productData?._id,
                    date: new Date(),
                  });
                  data.prodId = productData?._id;
                  data.makeId = makeDataByTitle?._id;
                  data.modelId = modelDataByTitle?._id;
                  data.yearId = yearDataByTitle?._id;
                  data.variantId = variantDataByTitle?._id;
                  arr.push(data);
                }
                console.log(
                  "data >>>>>>>>>> ",
                  !!productData,
                  !!makeDataByTitle,
                  !!modelDataByTitle,
                  !!yearDataByTitle,
                  !!variantDataByTitle,
                  " <<<<<<<<<<"
                );
              }
              // resp = arr
              resp = await ProductVechicle.insertMany(arr);
              await Product.updateMany(
                { partNo: { $in: productPartNos } },
                { status: true }
              ); // Product status changed to true if vehicle added
              await Stock.insertMany(adminStockData); // Product initial stock added if vehicle added
            } catch (error) {
              res.status(200).send({
                error: true,
                mssage: String(error),
              });
            }
          } else {
            res.status(200).send({
              error: true,
              message: `${req.params.csvType} type not valid one. Use (Product / ProductVechicle)`,
            });
          }

          res.status(200).send({
            error: false,
            message: `${req.params.csvType} Data stored`,
            data: resp,
          });
        });
    } catch (error) {
      res.status(200).send({
        error: true,
        mssage: String(error),
      });
    }
  }
);
module.exports = fileUploadRouter;
