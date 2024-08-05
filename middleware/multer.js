const multer = require("multer");
const path = require("path")

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null , "./public/temp")
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // Set file size limit to 100 MB
});

module.exports = upload