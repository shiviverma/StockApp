
var app = angular.module("Stocks", ['highcharts-ng', 'ngStorage','ngMaterial','ngAnimate','ui.toggle']);


    app.controller('Main', function($scope, $localStorage, getData, getNews, getIndicator,$http,$interval ){ 
        serverurl = "http://nodeapp.us-west-1.elasticbeanstalk.com";
        //************Auto complete ************* */
        $scope.items = [];      //items array for auto complete list
       // $scope.toggleDiv="fav";
        $scope.querySearch = function (query) {
            console.log(query);
            if(query == undefined)
            {$scope.searchText ="";
            $scope.enterSym = false;
            $scope.submitted = false;
            }
            else if(query.length>=0){
                $scope.enterSym = false;
                $scope.submitted = false;
            }
            
            $http({
                method:"GET",
                url:serverurl+"/autocomplete",
                params: { auto: query }
            })
            .then(function(response) {
                console.log(response);
                $scope.items = response.data; //putting data from api to items array
            });
          }
          //************Auto complete ************* */

        // New Dropdownnnnnn stuffffff
        $scope.disableOrder = true;
        $scope.sortType = 'Default';
        $scope.searchText = "";
        $scope.slideEnable = true; 

        $scope.listOfOptions = ['Default','Symbol','Price','Change','Change Percent' ,'Volume'];
        $scope.listOfOrders =['Ascending','Descending'];

        $scope.selectedItem =  $scope.listOfOptions[0];
        $scope.selectedOrder =  $scope.listOfOrders[0];

        $scope.comparator = false;
        $scope.changeOrder = function(){
            console.log($scope.selectedOrder);
            if($scope.selectedOrder==='Ascending')
            {
                $scope.comparator = false;
                $scope.selectedOrder = 'Ascending';
            }
            else
            {
                $scope.comparator = true;
                $scope.selectedOrder = 'Descending';
            }

        }
        
          $scope.changeSort = function(option){
           console.log($scope.selectedItem);
           if($scope.selectedItem == 'Price'){
                        $scope.sortType = 'Price';
                        $scope.disableOrder = false;
                        $scope.orderVariable = 'price';
                 }
           else if($scope.selectedItem == 'Symbol'){
                        $scope.sortType = 'Symbol';
                        $scope.disableOrder = false;
                        $scope.orderVariable = 'symbol';

           }
           else if($scope.selectedItem == 'Change Percent'){
                $scope.sortType = 'Change Percent';
                $scope.disableOrder = false;
                $scope.orderVariable = 'percentChange';

            }
           else if($scope.selectedItem == 'Change'){
                    $scope.sortType = 'Change';
                    $scope.disableOrder = false;
                    $scope.orderVariable = 'change';
                }
           else if($scope.selectedItem == 'Volume'){
                    $scope.sortType = 'Volume';
                    $scope.disableOrder = false;
                    $scope.orderVariable = 'volume';
                }
           else if($scope.selectedItem == 'Default'){
                    $scope.sortType = 'Default';
                    $scope.disableOrder = true;
                }
                console.log($scope.disableOrder);
          }

    //change to fav tab 
    $scope.changetoFav = function(){
        $scope.favContainer = true;
        $scope.stockContainer = false; 
    } 

    $scope.changetoStock = function(){
        $scope.favContainer = false;
        $scope.stockContainer = true;
        
      //  $scope.toggleDiv="results";
    }    

    $scope.checkRed = function(event){
        event.stopPropagation();
        if($scope.searchText == undefined)
        {
            $scope.enterSym = true;
            $scope.submitted = true;
        }
        else
        if($scope.searchText.trim().length ==0)
        {
            $scope.enterSym = true;
            $scope.submitted = true;
        }
        else{
            $scope.enterSym = false;
            $scope.submitted = false;
        }
        

    }

    
    //====>error variables
    $scope.enterSym = false;
    $scope.submitted = false;

    //show hide stock container
    $scope.stockContainer = false;
    $scope.favContainer = true;
 //   $scope.toggleDiv = "fav";
    //====>progress bars
    $scope.pbar1 = true;
    $scope.pbar2 = true; 
    $scope.hbar = true;

    //====>error from API
    $scope.serverror = false; 
    //hist graph array
    $scope.histGraph =[];

    //function to get stock info 
    $scope.fav = [];
    $scope.fav_sym = [];

    if($localStorage.fav!=undefined)
    {
        $scope.fav = $localStorage.fav;
        $scope.fav_sym = $localStorage.fav_sym;


    }
    else
    {
        $scope.fav = [];
        $scope.fav_sym = [];
    }
    $scope.tabNo = 0;
    
    //function to delete from favorites
    $scope.delete = function(pointer){
        $scope.fav.splice(pointer, 1);
        $scope.fav_sym.splice(pointer, 1);
        $localStorage.fav_sym = $scope.fav_sym;
        $localStorage.fav = $scope.fav;
    };

    //function for favorites
    $scope.favorite = function(){
        var favobj = $scope.respData["Time Series (Daily)"];
        var favStruct = { "symbol":"",
                            "price":"",
                            "change":"",
                            "volume":"",
                            "percentChange":"",
                            "img":"",
                            "color":""

        };
        var ind = $scope.fav_sym.indexOf($scope.sym.toUpperCase());

        if( ind==-1){
        $scope.star="glyphicon-star";
        favStruct.symbol = $scope.sym.toUpperCase();
        favStruct.price = $scope.favStuff.close ;
        favStruct.change = $scope.change;
        favStruct.volume = $scope.favStuff.volume;
        favStruct.percentChange = $scope.perChange;
        if(favStruct.percentChange<0){
        favStruct.img = 'http://cs-server.usc.edu:45678/hw/hw8/images/Down.png';
        favStruct.color = "red"}
        else
        {favStruct.img = 'http://cs-server.usc.edu:45678/hw/hw8/images/Up.png';
        favStruct.color = "green"
        }
        console.log(favStruct);
        console.log('fav func');
            //$scope.fav[i].price = resp[1. price]
            //
        $scope.fav.push(favStruct);
        $scope.fav_sym.push(favStruct.symbol);
        $localStorage.fav_sym = $scope.fav_sym;
        $localStorage.fav = $scope.fav;
        console.log($scope.fav);
        console.log($localStorage.fav);
        }
        else {
        $scope.star="glyphicon-star-empty";
        $scope.delete(ind);
        }
    };

    var count = 0;
    //---------->AutoRefresh 
    $scope.onoff = false;
    $scope.stop = undefined;
    
    $scope.autoToggle = function(){
        console.log($scope.onoff);
        if($scope.onoff == false)
        {   
            console.log('created interval');
            $scope.onoff = true;
            $scope.stop = $interval($scope.refreshData, 5000);
        }
        else{
            console.log('stopped interval');
            $scope.onoff = false;
            $interval.cancel($scope.stop);
            $scope.stop = undefined;
        }

    }

    //----------> Click to refresh
    $scope.refreshData = function(){
        $scope.indexCount   = 0;
        for(var k=0; k<$scope.fav.length; k++){
            // $scope.fav_sym ki jagah $scope.fav_sym[k] 
            

        getData.Data($scope.fav_sym[k]).then(function(data){
            $scope.autoData = data;
            var localindexCount = $scope.indexCount;
            $scope.indexCount++;

            var autobj = $scope.autoData["Time Series (Daily)"];

            var countTime = 0;
            for(var keys in autobj){
                if(autobj.hasOwnProperty(keys) && countTime < 2){
                    //$scope.autodate= autobj[keys];
                    if(countTime == 0)
                        $scope.autodate1= autobj[keys];
                    if(countTime == 1)
                        $scope.autodate2= autobj[keys];
                    countTime++;
                
                }
                else{
                    console.log('---------->autodate');
                    console.log($scope.autodate1);
                    console.log($scope.autodate2);
                                        //scope update
                                        console.log('--------> j=1');
                                        console.log($scope.fav);
                                        console.log(localindexCount);
                                        console.log($scope.fav[localindexCount]);
                                        console.log($localStorage.fav[localindexCount]);
                                        $scope.fav[localindexCount].price = parseFloat($scope.autodate1['4. close']);
                                        $scope.fav[localindexCount].volume = parseFloat($scope.autodate1['5. volume']);
                                        //localstorage update
                                        $localStorage.fav[localindexCount].price = parseFloat($scope.autodate1['4. close']);
                                        $localStorage.fav[localindexCount].volume = parseFloat($scope.autodate1['5. volume']);
                    
                                        $scope.fav[localindexCount].change =  parseFloat($scope.autodate1['4. close']) - parseFloat($scope.autodate2['4. close']);
                                        $localStorage.fav[localindexCount].change =  parseFloat($scope.autodate1['4. close']) - parseFloat($scope.autodate2['4. close']);
                    
                                $scope.fav[localindexCount].percentChange = $scope.fav[localindexCount].change/parseFloat($scope.autodate1['4. close'])*100;
                                if( $scope.fav[localindexCount].percentChange<1)
                                {
                                    $scope.fav[localindexCount].img = 'http://cs-server.usc.edu:45678/hw/hw8/images/Down.png';
                                    $localStorage.fav[localindexCount].img = 'http://cs-server.usc.edu:45678/hw/hw8/images/Down.png';
                                
                                }
                                else
                                {
                                    $scope.fav[localindexCount].img = 'http://cs-server.usc.edu:45678/hw/hw8/images/Up.png';
                                    $localStorage.fav[localindexCount].img = 'http://cs-server.usc.edu:45678/hw/hw8/images/Up.png';
                                }
                                $localStorage.fav[localindexCount].percentChange = $scope.fav[localindexCount].change/parseFloat($scope.autodate1['4. close'])*100;
                                console.log('------>printing loc');
                                console.log($scope.fav);
                                console.log($localStorage.fav);
                    break;
                }
            }

        });

        }

    };

    //open from fav
    $scope.searchStockFav = function(symbol){
        $scope.searchText = symbol;
        $scope.stockContainer = true;
        $scope.favContainer = false;
     //   $scope.toggleDiv = "results";
        $scope.searchStock();
    }

    //function to search stock
    $scope.searchStock = function(){ 
                     $scope.serverror = false;
                    //if($scope.selectItem)
                    $scope.currentIndicator = 'Price';
                    $scope.sym=$scope.searchText;
                    

                    //======> error handling 
                    if($scope.sym == undefined)
                    {
                        $scope.enterSym = true;
                        $scope.submitted = true;
                    }
                    else if($scope.sym.trim() == ""){
                        $scope.enterSym = true;
                        $scope.submitted = true;
                    }
                    else{
                        $scope.favContainer = false;
                        $scope.slideEnable = false; 
                        $scope.enterSym = false;
                        $scope.submitted = false;
                    //show stock container and progress bars
                    $scope.stockContainer = true;
                    //$scope.toggleDiv = "results";
                    //======> progress bars show
                    $scope.pbar1 = true;
                    $scope.pbar2 = true;

                    //chcek if in fav
                    var indi = $scope.fav_sym.indexOf($scope.sym);
                    if(indi!=-1){
                        $scope.star="glyphicon-star";
                    }
                    else
                    {
                        $scope.star="glyphicon-star-empty";
                    }
                             
                    //get data from factory
                    getData.Data($scope.sym).then(function(data){
                        $scope.respData = data;
                        var tsobj = $scope.respData["Time Series (Daily)"];
                        $scope.metaData = $scope.respData["Meta Data"];
                        $scope.timezon = moment.tz($scope.metaData["3. Last Refreshed"],"America/New_York");
                        if($scope.timezon.tz("America/New_York").format("HH")=="00"){
                         $scope.timezon.set({hour:"16"});
                         }
                         $scope.timezon = $scope.timezon.tz("America/New_York").format("YYYY-MM-DD HH:mm:ss z");
                        for(var property in tsobj){
                            if(tsobj.hasOwnProperty(property)){
                                $scope.date= tsobj[property];
                                break;
                                
                            }
                        }

                        //loop to create chart data arrays
                        var a1 = [];
                        var a2 = [];
                        
                        $scope.favStuff = {"prev_close":0,"close":0,"volume":0};
                        
                        var dateArr = [];
                        //var convertDate = [];
                        var j=0;
                        for(var property in tsobj){
                            j++;
                            dateArr.push(Date.parse(property));
                            a1.push(parseFloat(tsobj[property]['5. volume']));
                            a2.push(parseFloat(tsobj[property]['4. close']));
                           
                            if(j==1){
                                $scope.favStuff.close = parseFloat(tsobj[property]['4. close']);
                                $scope.favStuff.volume = parseFloat(tsobj[property]['5. volume']);

                            }
                            if(j==2){
                                $scope.favStuff.prev_close = parseFloat(tsobj[property]['4. close']);
                            }
                            if(j==132)
                            break;
                        }
                        for(var property in tsobj)
                        {
                        $scope.histGraph.push([Date.parse(property),parseFloat(tsobj[property]['4. close'])]);
                        }
                        console.log('----->hist');
                        console.log($scope.histGraph);

                        $scope.stoc=$scope.sym.toUpperCase();
                        $scope.change = $scope.date['4. close']-a2[1];
                        $scope.perChange = (($scope.date['4. close']-a2[1])/$scope.date['4. close'])*100;
                       
                        if($scope.perChange>0)
                        {
                        $scope.textcolor = "green";
                        $scope.imgurl = "http://cs-server.usc.edu:45678/hw/hw8/images/Up.png";
                        }
                        else{
                        $scope.textcolor = "red";
                        $scope.imgurl = "http://cs-server.usc.edu:45678/hw/hw8/images/Down.png";
                        }
                        
                        console.log(a1);
                        console.log(a2);
                        //======> progress bar 1 hide
                        $scope.pbar1 = false;
                        //charts 
                        $scope.createChart(dateArr, a1,a2);

                        //$scope.createhighstock(dateArr, a2);
                    })
                    ///SERVER ERROR HANDLING
                    .catch(function(data){
                        $scope.serverror = true;
                    });
                }
            };
        
     //function to get indicators 1 line
     $scope.searchIndicator = function(index){ 
        $scope.currentIndicator = index;
        $scope.pbar2 = true;
        console.log(index);
        //get data from factory
        getIndicator.Data($scope.sym, $scope.index).then(function(data){
            $scope.pbar2 = false;
         
            $scope.indiData = data;
            console.log(data);
            var indiobj = $scope.indiData["Technical Analysis: "+index];
            var name=$scope.indiData["Meta Data"]["2: Indicator"];
           
            if(index == 'BBANDS'){     
                var arr1 = [];
                var arr2 = [];
                var arr3 = [];
                var datesArr = [];
                var i=0;
                for(var values in indiobj){
                    i++;
                    datesArr.push(Date.parse(values));
                    arr1.push(parseFloat(indiobj[values]["Real Lower Band"]));
                    arr2.push(parseFloat(indiobj[values]["Real Middle Band"]));
                    arr3.push(parseFloat(indiobj[values]["Real Upper Band"]));
                    //arr2.push(parseFloat(tsobj[property]['4. close']));
                    if(i==132)
                    break;
                }
                var y1 = $scope.sym+" Real Lower Band";
                var y2 = $scope.sym+" Real Middle Band";
                var y3 = $scope.sym+" Real Upper Band";
                console.log(datesArr);
                console.log(arr1);
                //charts 
                $scope.createIndicharthree(datesArr, arr1, arr2, arr3, y1, y2, y3, index, name);        
            }
            else if(index=='STOCH'){
                var arr1 = [];
                var arr2 = [];
                var datesArr = [];
                var i=0;
                for(var values in indiobj){
                    i++;
                    datesArr.push(Date.parse(values));
                    arr1.push(parseFloat(indiobj[values]["SlowK"]));
                    arr2.push(parseFloat(indiobj[values]["SlowD"]));
                    //arr2.push(parseFloat(tsobj[property]['4. close']));
                    if(i==132)
                    break;
                }
                var y1 = $scope.sym+" SlowK";
                var y2 = $scope.sym+" SlowD";
                console.log(datesArr);
                console.log(arr1);
                //charts 
                $scope.createIndichartwo(datesArr, arr1, arr2, y1, y2, index, name);    //symbol adddd 
            }
            else if(index=='MACD'){
                var arr1 = [];
                var arr2 = [];
                var arr3 = [];
                var datesArr = [];
                var i=0;
                for(var values in indiobj){
                    i++;
                    datesArr.push(Date.parse(values));
                    arr1.push(parseFloat(indiobj[values]["MACD_Hist"]));
                    arr2.push(parseFloat(indiobj[values]["MACD_Signal"]));
                    arr3.push(parseFloat(indiobj[values]["MACD"]));
                    if(i==132)
                    break;
                }
                var y1 = $scope.sym+" MACD_Hist";
                var y2 = $scope.sym+" MACD_Signal";
                var y3 = $scope.sym+" MACD";
                console.log(datesArr);
                console.log(arr1);
                //charts 
                $scope.createIndicharthree(datesArr, arr1, arr2, arr3, y1, y2, y3, index, name);   //addd symbol  
            }
            else{
            //loop to create chart data arrays
            var arr1 = [];
            var datesArr = [];
            var i=0;
            for(var values in indiobj){
                i++;
                datesArr.push(Date.parse(values));
                arr1.push(parseFloat(indiobj[values][index]));
                //arr2.push(parseFloat(tsobj[property]['4. close']));
                if(i==132)
                break;
            }
            var y1=$scope.sym.toUpperCase();
            console.log(datesArr);
            console.log(arr1);
            //charts 
            $scope.createIndichart(datesArr, arr1, y1, index, name);
        }  
        });
    
};

    //function to create chart 
    $scope.createChart = function(datearray, array1, array2){

        //======> progress bar 1 hide
        $scope.pbar2 = false;

        console.log("charts function");
        $scope.chartConfig = {
            options: {
                chart: {
                    zoomType: 'xy'
                }
            },
    
            title: {
                text: 'Stock Price(DATE)'
            },
            subtitle: {
                text: '<a href="https://www.alphavantage.co/" target=".$target." class=".$aid."> Source: Alpha Vantage</a>',
                useHTML: true
            },
            
            xAxis: [{
                categories: datearray,
                crosshair: true,
                type: 'datetime',
                labels:
                {
                    format:'{value:%m/%d}'
                },
                tickInterval:5,
                reversed :true
            }],
            yAxis:[{ // Primary yAxis
            labels: {
                format: '{value}',
                style: {
                    color: Highcharts.red
                }
            },
            title: {
                text: 'Stock Price',
                style: {
                    color: Highcharts.setOptions().colors[10]
                }
            }
            },
            { // Secondary yAxis
            title: {
                text: 'Volume',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            labels: {
               
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            opposite: true,
            //max: 5*".$maxVal."
            }],
            
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign : 'middle'
            },
            plotOptions: {
                area: {
                    
                    lineWidth: 1,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
               
            },
            tooltip: {
                shadow: false
            },
            series: [{
                type: 'area',
                name: 'PRICE',
                data: array2,
                color: '#0066ff',
                tooltip:{
                xDateFormat:'%m/%d',
                    }
            },
            {
                type: 'column',
                name: 'Volume',
                data : array1,
                yAxis: 1,
                color: '#FF0000',
                tooltip:{
                xDateFormat:'%m/%d',
              }
            }]
        };
        
        
 };
//     //function to create indicator chart SMA
    $scope.createIndichart=function(datearray, arr1, y1, index, name){
        console.log("charts function");
        $scope.chartConfig = {
            options: {
                chart: {
                    zoomType: 'xy'
                }
            },
    
            title: {
                text: name
            },

            subtitle: {
                text: '<a href="https://www.alphavantage.co/" target="_blank" class="anch">Source: Alpha Vantage</a>',
                useHTML: true
            },
            xAxis: [{
                categories: datearray,
                type: 'datetime',
                crosshair: true,
                labels:
                {
                    format:"{value:%m/%d}"
                },
                tickInterval:5,
                reversed: true
            }],
            yAxis: [{ // Primary yAxis
                labels: {
                    format: '{value}',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                title: {
                    text: index,
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                }
            }
            ],
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign : 'middle'
            },
            plotOptions: {
                spline: {
                    marker: {
                        enabled: true,
                        radius: 2
                    }
                }
            },
            series: [ {
                name: y1,
                type: 'spline',
                data: arr1,
                tooltip:{
                xDateFormat:'%m/%d',
                    
                }
                }]
            
        };
    };

    //  function for indicator BBANDS
    $scope.createIndicharthree=function(datearray, arr1, arr2, arr3, y1, y2, y3, index, name){
        console.log("charts function");
        $scope.chartConfig = {
            options: {
                chart: {
                    zoomType: 'xy'
                }
            },
                title: {text: name},
                subtitle: {text: '<a href="https://www.alphavantage.co/" target="_blank" class="anch">Source: Alpha Vantage</a>',
                            useHTML: true
                        },
    
                xAxis: [{
                    categories: datearray,
                    type: 'datetime',
                    crosshair: true,
                    labels:
                    {
                        format:"{value:%m/%d}"
                    },
                    tickInterval:5,
                    reversed: true
                }],
                
                yAxis: [{ // Primary yAxis
                    labels: {
                        format: '{value}',
                        style: {
                            color: Highcharts.getOptions().colors[1]
                        }
                    },
                    title: {
                        text: index,
                        style: {
                            color: Highcharts.getOptions().colors[1]
                        }
                    }
                }
                ],
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign : 'middle'
                },
                plotOptions: {
                    spline: {
                        marker: {
                            enabled: true,
                            radius: 2
                        }
                    }
                },
                series: [ {
                    name: y1,
                    type: 'spline',
                    data: arr1,
                    tooltip:{
                    xDateFormat:'%m/%d',
                        },
                    },
                    {
                    name: y2,
                    type: 'spline',
                    data: arr2,
                    tooltip:{
                    xDateFormat:'%m/%d',
                        }
                    },
                    {
                    name: y3,
                    type: 'spline',
                    data: arr3,
                    tooltip:{
                    xDateFormat:'%m/%d',
                         }
                        }]
                        
                    };
                };

    //chart for STOCH
    $scope.createIndichartwo=function(datearray, arr1, arr2, y1, y2, index, name){
        console.log("charts function");
        $scope.chartConfig = {
            options: {
                chart: {
                    zoomType: 'xy'
                }
            },
            title: {text: name},
            subtitle: {text: '<a href="https://www.alphavantage.co/" target="_blank" class="anch">Source: Alpha Vantage</a>',
                        useHTML: true},
            xAxis: [{
                categories: datearray,
                type: 'datetime',
                crosshair: true,
                labels:
                {
                    format:"{value:%m/%d}"
                },
                tickInterval:5,
                reversed: true
            }],
            
            yAxis: [{ // Primary yAxis
                labels: {
                    format: '{value}',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                title: {
                    text: index,
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                }
            }
            ],
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign : 'middle'
            },
            plotOptions: {
                spline: {
                    marker: {
                        enabled: true,
                        radius: 2
                    }
                }
            },
            series: [ {
                name: y1,
                type: 'spline',
                data: arr1,
                tooltip:{
                xDateFormat:'%m/%d',
                    },
                },
                {
                name: y2,
                type: 'spline',
                data: arr2,
                tooltip:{
                xDateFormat:'%m/%d',
                    }
                }
                ]
        };
    };

    //function for historical chart
    $scope.historical = function(){
        $scope.tabNo = 1;
        $scope.hbar = true;
        $scope.showHistory = false;
            console.log('#############');
            console.log($scope.histGraph);
            
            $scope.histGraph = $scope.histGraph.reverse();
            $scope.createhighstock($scope.histGraph, $scope.sym);
        $scope.showHistory = true;
    

    };

    //function for highstock
    $scope.createhighstock = function(chartsData, tag){
        $scope.chart = Highcharts.stockChart('container', {
            
                    chart: {
                        height: 400
                    },
            
                    title: {
                        text: tag+' Stock Value'
                    },
            
                    subtitle: {
                        text: '<a href="https://www.alphavantage.co/" target=".$target." class=".$aid."> Source: Alpha Vantage</a>',
                                useHTML: true
                    },
            
                    rangeSelector: {
                                buttons: [{
                                    type: 'week',
                                    count: 1,
                                    text: '1w'
                                },
                                {
                                    type: 'month',
                                    count: 1,
                                    text: '1m'
                                },
                                {
                                    type: 'month',
                                    count: 3,
                                    text: '3m'
                                }
                                ,{
                                    type: 'month',
                                    count: 6,
                                    text: '6m'
                                },
                                {
                                    type: 'year',
                                    count: 1,
                                    text: '1y'
                                },
                                 {
                                    type: 'ytd',
                                    text: 'YTD'
                                }
                                ,{
                                    type: 'all',
                                    count: 1,
                                    text: 'All'
                                }],
                                selected: 0,
                            },
                   
            
                    series: [{
                        name: 'Stock Price',
                        data: chartsData,
                        type: 'area',
                        threshold: null,
                        tooltip: {
                            valueDecimals: 2,
                        }
                    }],
            
                    responsive: {
                        rules: [{
                            condition: {
                                maxWidth: 500
                            },
                            chartOptions: {
                                chart: {
                                    height: 300
                                },
                                subtitle: {
                                    text: null
                                },
                                navigator: {
                                    enabled: false
                                }
                            }
                        }]
                    }
                });
                $scope.hbar = false;
    };


    //function for news feed
    $scope.newsFeed = function(){ 
        //get data from factory
        $scope.tabNo = 2;
        $scope.newsDone = false;
        getNews.Data($scope.sym).then(function(data){
            $scope.feedData = data;
            console.log(data);
            $scope.quantity = 5;
            var newsobj = $scope.feedData["rss"]["channel"][0]["item"];
            //console.log(newsobj);
            $scope.rssNews =[];

            for(var i=0; i<newsobj.length; i++)
            { 
                var rssStruct = {"title":"abc",
                "link":"",
                "author":"",
                "date":""};
            $scope.linkobj = newsobj[i]["link"][0];
            var n= $scope.linkobj.search('article');
                console.log(n);
            if(n!=-1)
            {
                rssStruct.title =  newsobj[i]["title"][0];
                rssStruct.link = newsobj[i]["link"][0];;
                rssStruct.author = newsobj[i]["sa:author_name"][0];
                rssStruct.date = newsobj[i]["pubDate"][0];
                rssStruct.date = rssStruct.date.split("-", 1);
                rssStruct.date = rssStruct.date.toString();
                console.log('-------->date');
                console.log(rssStruct.date);
                console.log(newsobj[i]["title"][0]);
                rssStruct.date = moment.tz(rssStruct.date,"America/New_York");
                 rssStruct.date = rssStruct.date.tz("America/New_York").format("ddd, DD MMM YYYY  HH:mm:ss z");
                $scope.rssNews.push(rssStruct);
            }
  
            }
            $scope.newsDone = true;
            console.log($scope.rssNews);

        })
        .catch(function(data){
            $scope.serverror = true;
        });
    };
     

    //function to clear text
    $scope.clear = function(){
        //console.log('hello');
        $scope.searchText = "";
        $scope.stockContainer = false;
        $scope.favContainer = true;
    };
    $scope.changeCurr = function(){
        $scope.tabNo=0;
    }
    //function to change tabs
    $scope.changeTab = function(tabNum, indexName){
        $scope.tab = tabNum;
        $scope.index=indexName;
        if($scope.tab==1)
        $scope.searchStock();
        else if($scope.tab==2)
        $scope.searchIndicator($scope.index);

    };
     });

//service to get stock data

app.service("getData", ['$http', function($http) {
    return {
        Data: function(sym) {    
            var data = $http({
                method:"GET",
                url: serverurl+"/stock",
                params: {sym: sym}
            })
            .then(function(response) {
                console.log(response.data);
                return response.data;
            })
            .catch(function(data){
                $scope.serverror = true;
            });

            return data;
        }
    };
}]);


//service to get indicators
app.service("getIndicator", ['$http', function($http) {
    return {
        Data: function(sym, indicator) {    
            var data = $http({
                method:"GET",
                url: serverurl+"/indicator",
                params: {sym: sym, indicator: indicator}
            })
            .then(function(response) {
                
                return response.data;
            })
            .catch(function(data){
                $scope.serverror = true;
            });

            return data;
        }
    };
}]);


//service to get news feed
app.service("getNews", ['$http', function($http) {
    return {
        Data: function(symbol) {
            var caps_symbol = symbol.toUpperCase();
            var data = $http({
                method:"GET",
                url:serverurl+"/news",
                params: {symbol: caps_symbol}
            })
            .then(function(response) {
                console.log(response);
                return response.data;
            })
            .catch(function(data){
                $scope.serverror = true;
            });

            return data;
        }
    };
}]);
