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
		room.set('content', '//Write Your Code Here');
		room.save(null, {
		  success: function(room) {
		    
		    console.log('New object created with objectId: ' + room.id);
		    var path = '/'+ room.id;
		    var nsp = io.of(path);

			nsp.on('connection', function(socket){
			  	console.log('someone connected');
			  	var query = new Parse.Query(Rooms);

			  	socket.on('editorChange', function (data) {
				  	query.get(room.id, {
						success: function(room) {
						  	room.set("content", data.newValue);
						  	room.save();
						},
					    error: function(object, error) {
					    	console.log('Failed to load room: '+ error.message);
					    }
					});

	        		nsp.emit('editorCallback', data);
	        	});

			});

		    res.render('chat', { title: 'LiveCode', id:room.id , content:room.get('content')});

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
			  	res.render('chat', { title: 'LiveCode', id:req.query.id, content: room.get('content') });
				var nsp = io.of('/'+ req.query.id);

				nsp.on('connection', function(socket){
				  	console.log('someone connected');
				  	var query = new Parse.Query(Rooms);

				    socket.on('editorChange', function (data) {
				    	query.get(room.id, {
							success: function(room) {
							  	room.set("content", data.newValue);
							  	room.save();
							},
						    error: function(object, error) {
						    	console.log('Failed to load room: '+ error.message);
						    }
						});

		        		nsp.emit('editorCallback', data);
		        	});
				});
		    
		  	},
		  	error: function(object, error) {
		  		res.send('Sorry, this is not a valid room. Please try again!');
		  	}
		});
	}
  
});


module.exports = router;
