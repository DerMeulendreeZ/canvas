var fs = require('fs')
  , express = require("express")
  , app = express()
  , port = process.env.PORT || 8000
  ;


app.set('port', port);

//setting up mobile interface
app.get('/mobile', function(req, res){


 fs.readFile(__dirname + '/mobile-phone.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
    
    res.writeHead(200);
    res.end(data);
  });

});

//setting up desktop interface
app.get('/', function(req, res){

 fs.readFile(__dirname + '/desktop-screen.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
    
    res.writeHead(200);
    res.end(data);
  });


});

//sending styles
app.use(express.static(__dirname + '/css'));

//sending images
app.use(express.static(__dirname + '/images'));


server = app.listen(8000);
var io = require('socket.io').listen(server);

var interface_mobile_pair = [];

io.sockets.on('connection', function(client){

	client.on('hello', function(data){		
		
		if(data.interface == 'desktop'){
			
			var code = makeid(5);
			
			interface_mobile_pair[code] = {desktop: client};
			
			client.emit('hi-back', {code: code});
		}
	});
	
	client.on('mobile-device-connected', function(data){		
		code = data.code;
		if(data.interface == 'mobile-device'){
			if(data.code in interface_mobile_pair){
				//create pair
				interface_mobile_pair[code].mobile_device = client;
				
				interface_mobile_pair[code].desktop.emit('mobile-device-connected', {})
				
				interface_mobile_pair[code].mobile_device.on('event-happend', function(data){
					interface_mobile_pair[code].desktop.emit('event-happend', data);
				});
				
			}
		}
		
	});
		
});

function makeid(length)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


