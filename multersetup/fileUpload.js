const multer = require('multer');

const fileStorage = multer.diskStorage({
    destination:(req,file,callback)=>{
        callback(null,'uploads')
    },
    filename:(req,file,callback)=>{
        callback(null,file.originalname)
    }
});

const fileFilter = (req,file,callback)=>{
    if(file.mimetype.includes("png") ||
        file.mimetype.includes("jpg")||
        file.mimetype.includes("jpeg") ||
        file.mimetype.includes("pdf")) {
            callback(null,true)
        }else{
            callback(null,false)
        }
}