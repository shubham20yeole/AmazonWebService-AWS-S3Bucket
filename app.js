var express = require('express');
var port = process.env.PORT || 3000
var bodyParser = require('body-parser');
var path = require('path');
var ejs = require('ejs');


var app = express();
var passport = require("passport")
app.listen(port, function() {
  console.log('SHUBHAM PROJECT RUNNING ON: http://localhost:' + port)
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// body parser middleware
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb',extended: false}));
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname)));

var fs = require('fs');
var S3FS = require('s3fs');
var awsS3Function = new S3FS('shubhamawss3bucket', {
  accessKeyId:'********************************************',
  secretAccessKey:'****************************************'
});

awsS3Function.create();

var multiparty = require('connect-multiparty'),
  multipartyMiddleware = multiparty();
app.use(multipartyMiddleware);
    app.use(function(req, res, next){
      console.log( req.path + "token:" + req.query.access_token)
      fs.appendFile('logs.txt', req.path + "token:" + req.query.access_token+'', 
        function(err){
          next(); 
        });
  });

app.get('/', function(req, res){       
   res.render("index.ejs");
});

app.post('/upload', function(req, res){       
    var file = req.files.file;
    var filepath = file.path;
  var timestamp = new Date().valueOf();


  var stream = fs.createReadStream(filepath);
  var url = "https://s3.amazonaws.com/shubhamawss3bucket/shubham-"+timestamp+"-"+file.originalFilename;
    return awsS3Function.writeFile('shubham-'+timestamp+"-"+file.originalFilename, stream).then(function(){
      console.log("FILE UPLOADED SUCCESSFULLY");
        res.send("<h1>FILE UPLOADED SUCCESSFULLY:</h1>"+
          "<h2>Click Following: <a href='"+url+"' target='_blank'>Click Me</a></h2>"+
          "<h2>Copy Paste following url: "+url+"<h2><hr>"+
          "<img src='"+url+"'>");
  })
});

