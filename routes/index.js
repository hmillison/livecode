var express = require('express');
var router = express.Router();
var Parse = require('parse').Parse;
var sendgrid  = require('sendgrid')('timotius02', 'timotius2');

Parse.initialize("Z8S2abxIxh5UXd3m8CNncRGbn97pRXYSi4EQ5qnR", "G4U45T8R74bMLLdcB824h3WDJwV1h5ORjrewJtoS");

/* GET home page. */
router.get('/', function(req, res) {

	res.render('index', { title: 'LiveCode'});

});

router.get('/list', function(req, res){
	var Rooms = Parse.Object.extend("Rooms");
	var query = new Parse.Query(Rooms);
	query.find({
		success: function(results){
			res.render('list', { title: 'LiveCode', rooms:results});
		},
		error: function(error){
			res.send('There was an error loading this page. Please try again.')
		}
	});

});

router.post('/topic', function(req, res){
	var id = req.query.id;
	var topic = req.query.topic;
	var Rooms = Parse.Object.extend("Rooms");
	var query = new Parse.Query(Rooms);
	query.get(id,{
		success: function(Rooms){
			Rooms.set('topic',topic);
			Rooms.save();
		}
	});

});

router.get('/chat', function(req, res) {
	var Rooms = Parse.Object.extend('Rooms');
	var room = new Rooms();

	var roomID;
	if(req.query.create === 'true'){
		room.set('content', '//Write Your Code Here');
		if(req.query.username){
			room.set('username', req.query.username);
		}
		else
		{
			room.set('username', 'guest');
		}
		room.save(null, {
		  success: function(room) {
		    console.log('New object created with objectId: ' + room.id);
		    var path = '/'+ room.id;
		    var nsp = io.of(path);

			nsp.on('connection', function(socket){
			  	console.log('someone connected');
			  	var query = new Parse.Query(Rooms);

			  	socket.on('sendEmail', function (data) {
				    console.log('hello');
				    sendgrid.send({
				        to: data.toEmail,
				        from: data.fromEmail,
				        subject: 'Live Code Session Invitation',
				        text: 'Your have an invitation to a Live Code Session: \n' + data.url
				    }, function(err, json) {
				        if (err) { return console.error(err); }
				        console.log(json);
				    });  
				});

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

		    res.render('chat', { title: 'LiveCode', id:room.id , username:room.get('username'), content:room.get('content')});

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

				  	socket.on('sendEmail', function (data) {
					    console.log('hello');
					    sendgrid.send({
					        to: data.toEmail,
					        from: data.fromEmail,
					        subject: 'Live Code Session Invitation',
					        text: 'Your have an invitation to a Live Code Session: \n' + data.url
					    }, function(err, json) {
					        if (err) { return console.error(err); }
					        console.log(json);
					    });  
					});

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
