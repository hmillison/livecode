var express = require('express');
var router = express.Router();

var Parse = require('parse').Parse;

Parse.initialize("Z8S2abxIxh5UXd3m8CNncRGbn97pRXYSi4EQ5qnR", "G4U45T8R74bMLLdcB824h3WDJwV1h5ORjrewJtoS");

/* GET home page. */
router.get('/', function(req, res) {

	res.render('index', { title: 'LiveCode'});

});

router.get('/chat', function(req, res) {
	if(req.query.create === 'true'){
		var Rooms = Parse.Object.extend('Rooms');
		var room = new Rooms();

		room.save(null, {
		  success: function(room) {
		    
		    console.log('New object created with objectId: ' + room.id);
		    res.render('chat', { title: 'LiveCode', id:room.id });
		  },
		  error: function(room, error) {
		    console.log('Failed to create new object, with error code: ' + error.message);
		  }
		});
	}
	else{
		res.render('chat', { title: 'LiveCode', id:req.query.id });
	}
  
});


module.exports = router;
