var express = require('express');
var router = express.Router();
var Parse = require('parse').Parse;


Parse.initialize("Z8S2abxIxh5UXd3m8CNncRGbn97pRXYSi4EQ5qnR", "G4U45T8R74bMLLdcB824h3WDJwV1h5ORjrewJtoS");

/* GET home page. */
router.get('/', function(req, res) {

	res.render('index', { title: 'LiveCode'});

});

router.get('/chat', function(req, res) {
	var Rooms = Parse.Object.extend('Rooms');
	var room = new Rooms();

	var roomID;

	if(req.query.create === 'true'){
		room.save(null, {
		  success: function(room) {
		    
		    console.log('New object created with objectId: ' + room.id);
		    var path = '/'+ room.id;
		    var nsp = io.of(path);

			nsp.on('connection', function(socket){
			  	console.log('someone connected');

			  	socket.on('editorChange', function (data) {
	        		nsp.emit('editorCallback', data);
	        	});

			});

		    res.render('chat', { title: 'LiveCode', id:room.id });

		  },
		  error: function(room, error) {
		    console.log('Failed to create new object, with error code: ' + error.message);
		  }
		});
	}

	else{
		var query = new Parse.Query(Rooms);
		query.get(req.query.id, {
		  	success: function(room) {
			  	res.render('chat', { title: 'LiveCode', id:req.query.id });

				var nsp = io.of('/'+ req.query.id);

				nsp.on('connection', function(socket){
				  	console.log('someone connected');

				    socket.on('editorChange', function (data) {
		        		nsp.emit('editorCallback', data);
		        	});
				});
		    
		  	},
		  	error: function(object, error) {
		  		res.send('Failed to create new object, with error code: ' + error.message);
		  	}
		});
	}
  
});


module.exports = router;
