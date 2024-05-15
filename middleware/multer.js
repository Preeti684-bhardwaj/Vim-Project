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

const upload = multer({ storage: storage,limits: { fileSize: 25 * 1024 * 1024 },  });

module.exports = upload