const cors = require('cors')
const express = require('express')
const multer = require('multer')
const bodyParser = require('body-parser')
const ejs = require('ejs');
//takes file and extracts extention
const path = require('path');

let submissionsArray = [];


//storage engine via disk storage
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

//init upload variable
const upload = multer({
    storage: storage,
    limits: {fileSize: 1000000},
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }
}).array('myImage', 2);

//check file type
function checkFileType(file, cb){
    //create epression for file types that I want
    const filetypes = /jpeg|jpg|png|gif/;
    //check the extention
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    //check the mime type
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname){
        return cb(null, true);
    } else {
        cb('Error: Images Only!')
    }
};

//init app
const app = express()

// //tell the api to respond to anybody in universe
app.use(cors())

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true}));

//EJS
app.set('view engine', 'ejs');

//public static folder
app.use('/public', express.static('./public'));

app.get('/', (req,res)=> res.render('index'));

app.get('/submissions', (req,res) => res.render('submissionsview', {submissionData: submissionsArray}));

app.post('/upload', (req,res) =>{
    upload(req, res, (err) => {
        if(err){
            res.render('index',{
                msg: err
            });
        } else {
            if(req.files == undefined){
                res.render('index',{
                    msg: 'Error: No File Selected!'
                });
            } else {
                res.render('index', { // rendering the same view again
                    msg: 'Files Uploaded!',
                    files: req.files
                });
                console.log(req.files[0].path)
                submissionsArray.unshift({
                    // whatever data you want to keep for later
                    imageASrc: req.files[0].path,
                    imageBSrc: req.files[1].path,
                    imageAVotes: 0,
                    imageBVotes: 0,
                })
                // res.render('confirm', { // rendering a different view after they submit
                //     msg: 'Files Uploaded!',
                //     files: req.files
                // });
            }
        }
    });
});


app.post('/vote/:submission/:image', (req,res) => {
    console.log('RECIEVED vote for ', req.params.submission , req.params.image)
    // submissionsArray[req.params.submission]["image"+req.params.image+"Votes"]++
    if (req.params.image === "A") {
        submissionsArray[req.params.submission].imageAVotes++
    } else if (req.params.image === "B") {
        submissionsArray[req.params.submission].imageBVotes++
    }
    res.send( submissionsArray );
})

const port = 3400;
app.listen(port, ()=> console.log( `server started on port ${port}`));