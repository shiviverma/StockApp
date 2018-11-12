var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
const https = require('https');
const http= require('http');
var app = express();
var xml2js = require('xml2js');


// ---------> API to get Stock Data
app.get('/stock', function(req, res){
var sym = req.param('sym');    
https.get('https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&outputsize=full&symbol='+sym+'&apikey=FUYI6C5PYHSZ8L9H', (resp) => {
    let data='';
   
    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });
   
    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      console.log(JSON.parse(data));
      res.setHeader('Content-Type', 'application/json');
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      res.send(data);
    });
   
  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });

});

// ---------> API to get indicator 
app.get('/indicator', function(req, res){
    var sym = req.param('sym');    
    var indicator = req.param('indicator');

    https.get('https://www.alphavantage.co/query?function='+indicator+'&symbol='+sym+'&interval=daily&time_period=10&series_type=close&apikey=3IFVU6KKE181JCA2', (resp) => {
        let data='';
       
        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
          data += chunk;
        });
       
        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          console.log(JSON.parse(data));
          res.setHeader('Content-Type', 'application/json');
          res.header("Access-Control-Allow-Origin", "*");
          res.header("Access-Control-Allow-Headers", "X-Requested-With");
          res.send(data);
        });
       
      }).on("error", (err) => {
        console.log("Error: " + err.message);
      });
    
});

// ---------> API to get News feed 
app.get('/news', function(req, res){
    var symbol = req.param('symbol');
    console.log(symbol);    
    https.get('https://seekingalpha.com/api/sa/combined/'+symbol+'.xml', (resp) => {
        let data='';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {

          data += chunk;
          
        });
       
        // The whole response has been received. Print out the result. toh isko hum kaise sahi kar sakte hai  jab appios thi  gamlaant  
        resp.on('end', () => {

            var parser = new xml2js.Parser();
            parser.parseString(data, function (err, result) {
                console.log(result);
               // console.log('Done');
                res.setHeader('Content-Type', 'application/json');
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                res.send(result);
            })
        });
       
      }).on("error", (err) => {
        console.log("Error: " + err.message);
      });
});

 // ---------> API for autocomplete 
app.get('/autocomplete', function(req, res){
    var auto = req.param('auto');    
    http.get('http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json?input='+auto, (resp) => {
        let data='';
       
        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
          data += chunk;
        });
       
        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          console.log(JSON.parse(data));
          res.setHeader('Content-Type', 'application/json');
          res.header("Access-Control-Allow-Origin", "*");
          res.header("Access-Control-Allow-Headers", "X-Requested-With");
          res.send(data);
        });
       
      }).on("error", (err) => {
        console.log("Error: " + err.message);
      });
    
});

//express validator middleware
app.use(expressValidator()); 
//view engine
app.set('view engine', 'ejs');
//app.set('views', path.join(__dirname, 'public'));

//body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function(req, res){
	
res.render('index',{
	title: 'Stocks'
});
})


var port = process.env.PORT || 3000;
app.listen(port, function(){
	console.log('Server started on port 3000...');
})