// Import the express module
const express = require('express')

const app = express();
const { S3Client } = require('@aws-sdk/client-s3')
const multer = require('multer')
const multerS3 = require('multer-s3')
// Define a port number
const port = 4000;

require("dotenv").config();
//setup the client
const client = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    },
    region: process.env.BUCKET_REGION
});


const upload = multer({
    storage: multerS3({
        acl : 'public-read',
        s3: client,
        bucket: process.env.AWS_BUCKET_NAME,
        //add metadata
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname});
            console.log("file.fieldname : " + file.fieldname);
        },
        key: function (req, file, cb) {
            cb(null, file.originalname);
        }
    }),
        //optional parameters
        fileFilter : function (req, file, cb) {
        // Check if the file's MIME type is image/jpeg or image/png
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            // Allow the upload
            cb(null, true);
        } else {
            // Reject the upload with an error message
            cb(new Error('Only JPEG and PNG images are allowed'));
        }
    }
});

// Create a route that allows to upload images
app.post('/api/upload-images' , upload.array('photos', 3), async(req ,res) => {
    const url = [];
        req.files.forEach((file) => {
                url.push(file.location);
              });
        
            res.send({url : url});
})

// Start the server and listen on the defined port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
