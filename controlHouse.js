/**
Global Include
*/
var http = require('http');
var url = require('url');
var fs = require('fs');
var qs = require('querystring');

function loadConfig(newTemp,callback){
var data = fs.readFileSync('./houseConfig.json'), 
	myObj;
try	{
	myObj = JSON.parse(data);
	console.dir(myObj);
	if(typeof myObj['temperature'] !== 'undefined'){
		var oldTemp = myObj['temperature']; 
//		console.log('Old temperature='+oldTemp);

		if(newTemp == oldTemp)
			callback("Temperature is already set at "+newTemp);
		else
			callback("Setting temperature to "+newTemp);				
	}else{
		callback("Error in fetching existing state, temperature will be set to new value "+newTemp);
	}
	
	//set new temperature in config file
	myObj.temperature=newTemp;
	fs.writeFile('./houseConfig.json', JSON.stringify(myObj), function (err) {
	    if (err) {
	      console.log('Error setting new temperature in config file');
	      console.log(err.message);
	      return;
	    }
	    console.log('Temperature set successfully');
	  });
}
catch (err) {
	console.log('There has been an error parsing your JSON.');
	console.log(err);
}
}

/**
Create Server On port 8000
EG: http://localhost:8000/temperature?value=65
*/
http.createServer(function (request, response) {
response.writeHead(200, {'Content-Type': 'text/html','Access-Control-Allow-Origin' : '*'});
if(request.method == 'POST'){
//   console.log("**"+request.data);
   var req_data = '';
   request.on('data', function(data){
	  req_data += data; 
   });

   request.on('end', function(){
	  console.log('data:'+req_data);
	  var req_obj = qs.parse(req_data);
	  for(var key in req_obj){
//		  console.log("***"+key+"  "+req_obj[key])
		  if(key == "temperature"){
				loadConfig(req_obj[key],function(callback){
					console.log(req_obj[key]+","+callback);
					response.end(callback,'utf-8');
				});
		  }
	  }
   });
}else{
	var entity = url.parse(request.url).pathname;
	var value = url.parse(request.url).query;
	console.log(entity+"  "+value);

	var eachParam = entity.split("\/");
	console.log("entity to compare "+eachParam[1]);
	if(eachParam.length>0 && eachParam[1] && (eachParam[1] == "temperature")){
		var newTemp = value.split("=");
		loadConfig(newTemp[1],function(callback){
//			console.log(newTemp[1]+","+callback);
			response.end(callback,'utf-8');
		});
	}else{
		response.end("Please check URL, Correct URL is http://localhost:8000/temperature?value=65");
	}
}
}).listen(8000, '127.0.0.1');

console.log('Server running at 8000');
