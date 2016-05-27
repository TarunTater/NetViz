var express = require("express");
var session = require('express-session');
var app = express();/*we can now use the functions and commands present in express module*/
var mongojs = require('mongojs');
var bodyParser = require('body-parser');
var uuid = require('node-uuid');
var multiparty = require('multiparty');
var fs = require('fs');
var csv = require('fast-csv');

var nodedb = mongojs('nodelist', ['nodelist']);
var edgedb = mongojs('edgelist', ['edgelist']);	
var db = mongojs('netVizData', ['users']);

app.use(session({secret: 'ssshhhhh'}));
app.use(express.static(__dirname + "/public"));/*tells server where to look for index.html*/
app.use(bodyParser.json());

app.set('views', __dirname + '/public/views');

app.engine('html', require('ejs').renderFile); 


var sess;
var database;

/*
 * Login and Register
 */

app.get('/',function(req,res){
	sess = req.session;
	console.log(sess);
	console.log(' Hello :P came to /');
	if(sess.uName) {
      console.log("uname present");
	    res.redirect('/popup');
	}
	else {
      console.log("no unmae");
    	res.render('index.html');
	}
});

app.get('/popup', function(req, res) {
	res.render('popup.html');
})

app.get('/home', function(req, res) {
	res.render('home.html');
});

app.get('/register',function(req,res){
	res.render('register.html');
});

app.get('/index',function(req,res){
	console.log("hola");
	res.render('index.html');
});

app.get('/logout',function(req,res){
	req.session.destroy(function(err) {
  		if(err) {
    		console.log(err);
  		} 
  		else {
    		res.redirect('/');
  		}
	});
});

app.delete('/deleteDB', function(req, res) {
  sess = req.session;
  db.users.findOne({'_id':sess.uName},function(err,doc)
  {
    var userData = doc;
    var newData = []  
       for(var i =0;i<userData.data.length;i++)
       {

           if(userData.data[i]._id != database)
           {
              newData.push(userData.data[i]);
           }
         }
         userData.data = newData;
         db.users.update(
              {_id: sess.uName},
                  userData,
                  {upsert: true}
             ) 
          res.json({'updated' : 'true'});
           });
});


app.post('/registerTask', function(req, res){
	console.log(req.body);
	
	var userName = req.body["_id"];
	var password = req.body["password"];
	db.users.findOne({'_id':userName}, function(err, doc) {
	if(doc!=null){
			console.log("hp came back :P");			
			res.json({"status": "false"});
		}
	else{
		db.users.insert({"_id" : userName, "password" : password, data : [ ]}, function(err, doc) {
			console.log("hp1 came");
			res.json({ "status": "true" });
			});
		}
	});
});

app.post('/loginTask', function(req, res){
	console.log(req.body);
	var userName = req.body["_id"];
	var passWord = req.body["password"];
	console.log(userName);
	console.log(passWord);
	db.users.find(function(err, doc) {
		console.log(doc);
	});
	db.users.findOne({'_id':userName}, function(err, doc) {
		if(doc!=null){
			console.log(doc["password"]);
			if(doc["password"] == passWord){
				console.log("hello Madame");
				console.log(doc);
			    sess = req.session;
  				sess.uName=userName;
  				console.log(sess);
	   			res.json({"status": "true", 'userDetails' : doc});
			}
			else{
				console.log("in else!");
				res.json({"status": "true", "passwordStatus" : "false"});	
			}
		}
    	else{
    		console.log("in else!");
    		res.json({"status": "false"});
    	}
		/*res.json(doc);*/
	});
});



/*
 * Start Node Operations 
 */

app.get('/nodelist', function(req,res) {
	sess = req.session;
	console.log("Received GET Request");
	//nodedb.nodelist.find(function(err, docs) {
	//	console.log(docs);
	//	res.json(docs);
	//});
  console.log("sess.uName : ", sess.uName);

  db.users.find({'_id':sess.uName},function(err,doc)
           {
               var userData = doc;  
               var net = userData[0];
               var networks = net['data'];
               console.log("User Data here:", networks);
//			   console.log("User Data:", userData.data);               
               console.log("User Data 2:", networks.length);

               for(var i =0;i<networks.length;i++)
               {
                   console.log("came in for");
                   console.log("net : ",networks[i]);
                   console.log("networks id : ", networks[i]._id);
                   if(networks[i]._id==database)
                   {
                   	   var nodeList = networks[i].nodeList;
                    res.json(nodeList);
                       break; 
                   }
               }
            
           });

	console.log("Database: ", database);
});

app.post('/nodelist', function (req, res) {
	console.log(req.body);
	sess = req.session; 
	if (req.body.nodeId != null && req.body.nodeName != "" && req.body.lat != null && req.body.long != null && req.body.stock != null) {
		console.log("inside 1st if");
		//nodedb.nodelist.insert(req.body, function(err, doc) {

		db.users.findOne({'_id':sess.uName},function(err,doc)
           {
               var userData = doc;  
               console.log("User Data came1:", userData.data);
//			   console.log("User Data:", userData.data);               
               console.log("User Data came2:", userData.data[0]);
               console.log("User Data came3:", userData.length);

               for(var i =0;i<userData.data.length;i++)
               {
                   console.log(userData.data[i]);
                   if(userData.data[i]._id==database)
                   {
                   	   var nodeList = userData.data[i].nodeList;
                   	   console.log("NodeList: ", nodeList);
                   	   var newNodeList = nodeList;
                   	   newNodeList.push(req.body);
                   	   console.log("New NodeList: ", newNodeList);
                   	   userData.data[i].nodeList = newNodeList;
                       //var temp = userData.data[i];
                       //temp[inpType] = tempjson;
                       //jsondoc.network[i] = temp;
                       break; 
                   }
               }
               db.users.update(
                  {_id: sess.uName},
                   userData,
                   {upsert: true}
               )
               res.json(doc);
           });
		
		}
});

app.delete('/nodelist/:nodeId', function(req, res) {
	var id = req.params.nodeId;
	console.log(id);
	var check = 0;
	sess = req.session;
	db.users.findOne({'_id':sess.uName},function(err,doc)
	{
		var userData = doc;  
       for(var i =0;i<userData.data.length;i++)
       {
           console.log(userData.data[i]);
           console.log("userData.data[i]._id : ", userData.data[i]._id);
           console.log("database name : ", database);
           if(userData.data[i]._id==database)
           {
           		console.log("db names match");
           		check = 1;
           	   var nodeList = userData.data[i].nodeList;
           	   var newNodeList = [];
           	   for(var j=0;j<nodeList.length;j++)
           	   {	
           	   		console.log("nodeList[j] : ", nodeList[j]);
           	   		console.log("nodeList[j].nodeId : ", nodeList[j].nodeId);
           	   		console.log("id is :", id);
           	   		if(nodeList[j].nodeId == id)
           	   		{
           	   			console.log("the node which matched is this :", nodeList[j]);
           	   			//res.json(nodeList[j]);
           	   			console.log("the node is deleted : P");
           	   		} 
           	   		else{
           	   			newNodeList.push(nodeList[j]);
           	   		}
           	   }
           	   userData.data[i].nodeList = newNodeList;

           }
           if(check == 1){

           		db.users.update(
            		{_id: sess.uName},
                   userData,
                   {upsert: true}
            )

           		res.json({'updated' : 'true'});
           		break;	
           }
       }
       

		});
});

app.get('/nodelist/:nodeId', function(req, res) {
	var id = req.params.nodeId;
	console.log(id);
	var check = 0;
	sess = req.session;
	db.users.findOne({'_id':sess.uName},function(err,doc)
	{
		var userData = doc;  
       for(var i =0;i<userData.data.length;i++)
       {
           console.log(userData.data[i]);
           console.log("userData.data[i]._id : ", userData.data[i]._id);
           console.log("database name : ", database);
           if(userData.data[i]._id==database)
           {
           		console.log("db names match");
           		check = 1;
           	   var nodeList = userData.data[i].nodeList;
           	   for(var j=0;j<nodeList.length;j++)
           	   {	
           	   		console.log("nodeList[j] : ", nodeList[j]);
           	   		console.log("nodeList[j].nodeId : ", nodeList[j].nodeId);
           	   		console.log("id is :", id);
           	   		if(nodeList[j].nodeId == id)
           	   		{
           	   			console.log("the node which matched is this :", nodeList[j]);
           	   			res.json(nodeList[j]);
           	   			break;
           	   		} 
           	   }
           }
           if(check == 1){
           		break;	
           }
       }

		});
	});

app.put('/nodelist/:nodeId', function(req, res) {
	var id = req.params.nodeId;
	console.log(req.body.nodeName);
	var newJson = {'nodeId': req.body.nodeId, 'nodeName': req.body.nodeName, 'lat': req.body.lat, 'long': req.body.long, 'stock': req.body.stock};
	var check = 0;
	var sess = req.session;
	db.users.findOne({'_id':sess.uName},function(err,doc)
	{
		var userData = doc;  
       for(var i =0;i<userData.data.length;i++)
       {
           console.log(userData.data[i]);
           console.log("userData.data[i]._id : ", userData.data[i]._id);
           console.log("database name : ", database);
           if(userData.data[i]._id==database)
           {
           		console.log("db names match");
           		check = 1;
           	   var nodeList = userData.data[i].nodeList;
           	   var newNodeList = [];
           	   for(var j=0;j<nodeList.length;j++)
           	   {	
           	   		console.log("nodeList[j] : ", nodeList[j]);
           	   		console.log("nodeList[j].nodeId : ", nodeList[j].nodeId);
           	   		console.log("id is :", id);
           	   		if(nodeList[j].nodeId == id)
           	   		{
           	   			console.log("the node which matched is this :", nodeList[j]);
           	   			//res.json(nodeList[j]);
           	   			newNodeList.push(newJson);
           	   		} 
           	   		else{
           	   			newNodeList.push(nodeList[j]);
           	   		}
           	   }
           	   userData.data[i].nodeList = newNodeList;

           }
           if(check == 1){

           		db.users.update(
            		{_id: sess.uName},
                   userData,
                   {upsert: true}
            )

           		res.json({'updated' : 'true'});
           		break;	
           }
       }
       

		});

	});

app.post('/upload/file_nodes/',function(req, res) 
{
    var form = new multiparty.Form();
    form.parse(req, function(err, fields, files) 
    {
        var file = files.file[0];
        var contentType = file.headers['content-type'];
        var tmpPath = file.path;
        console.log(tmpPath);
        var extIndex = tmpPath.lastIndexOf('.');
        var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);
        // uuid is for generating unique filenames. 
        var fileName = uuid.v4() + extension;
        var destPath = './public/uploads/' + fileName;
        console.log(destPath);
        // Server side file type checker.
        if (contentType !== 'text/csv') 
        {
            fs.unlink(tmpPath);
            return res.status(400).send('Unsupported file type.');
        }

        fs.rename(tmpPath, destPath, function(err) 
        {
            if (err) 
            {
                return res.status(400).send('Check file path.');
            }
            //console.log(res.json(destPath));
            return res.json(destPath);
        });

        var sess = req.session;

        db.users.findOne({'_id':sess.uName},function(err,doc)
           {
               var userData = doc;  
               console.log("User Data came1:", userData.data);
//			   console.log("User Data:", userData.data);               
               console.log("User Data came2:", userData.data[0]);
               console.log("User Data came3:", userData.data.length);

		        var stream = fs.createReadStream(destPath,{encoding : 'utf-8'});
		        console.log("dest pat is : ", destPath);


               for(var i =0;i<userData.data.length;i++)
               {
                   console.log(userData.data[i]);
                   if(userData.data[i]._id==database)
                   {
                   	   var nodeList = userData.data[i].nodeList;
                   	   console.log("NodeList here is : ", nodeList);
                   	   var newNodeList = [];

                   	   csv.fromStream(stream, {headers: ['id','name','lat','long','stock']})
	                   	   .on("data", function(data) {
	                   	   		console.log("csv stream");
	                   	   		//if(data.id != "" && data.name != "" && data.lat != "" && data.long != "" && data.stock != ""){
	                   	   		newNodeList.push({'nodeId':data.id, 'nodeName':data.name, 'lat':data.lat, 'long':data.long, 'stock':data.stock });
	                   	   		//}
	                   	   		
	                   		})
	                   	   .on("end", function() {
	                   	   		console.log("New NodeList: ", newNodeList);
	                   	   		userData.data[i].nodeList = newNodeList;

	                   	   		db.users.update(
				                  {_id: sess.uName},
				                   userData,
				                   {upsert: true}
				               )
	                   	   });
	                   	   
                       //var temp = userData.data[i];
                       //temp[inpType] = tempjson;
                       //jsondoc.network[i] = temp;
                       break; 
                   }
               }
               
               //res.json(doc);
           });

    });
});






/*
 * Start Edge Operations 
 */
app.get('/edgelist', function(req,res) {
  console.log("Received GET Request");
  sess = req.session;
  console.log("Received GET Request");
  console.log("sess.uName : ", sess.uName);
  db.users.find({'_id':sess.uName},function(err,doc)
           {
               var userData = doc;  
               var net = userData[0];
               var networks = net['data'];
               console.log("User Data here:", networks);
//         console.log("User Data:", userData.data);               
               console.log("User Data 2:", networks.length);

               for(var i =0;i<networks.length;i++)
               {
                   console.log("came in for");
                   console.log("net : ",networks[i]);
                   console.log("networks id : ", networks[i]._id);
                   if(networks[i]._id==database)
                   {
                       var edgeList = networks[i].edgeList;
                       res.json(edgeList);
                       break; 
                   }
               }
           });

  console.log("Database: ", database);
});

app.post('/edgelist', function (req, res) {
  console.log(req.body);
  sess = req.session;
  if (req.body.edgeId != null && req.body.node1 != "" && req.body.node2 != null) {
    db.users.findOne({'_id':sess.uName},function(err,doc)
           {
               var userData = doc;  
               for(var i =0;i<userData.data.length;i++)
               {
                   console.log(userData.data[i]);
                   if(userData.data[i]._id==database)
                   {
                     var edgeList = userData.data[i].edgeList;
                       console.log("edgeList: ", edgeList);
                       var newEdgeList = edgeList;
                       newEdgeList.push(req.body);
                       console.log("New edgeList: ", newEdgeList);
                       userData.data[i].edgeList = newEdgeList;
                       break; 
                   }
               }

               db.users.update(
                  {_id: sess.uName},
                   userData,
                   {upsert: true}
               )
               res.json(doc);
           });
  };
});


app.delete('/edgelist/:edgeId', function(req, res) {
  var id = req.params.edgeId;
  console.log(id);
  var check = 0;
  sess = req.session;
  db.users.findOne({'_id':sess.uName},function(err,doc)
  {
    var userData = doc;  
       for(var i =0;i<userData.data.length;i++)
       {
           console.log(userData.data[i]);
           console.log("userData.data[i]._id : ", userData.data[i]._id);
           console.log("database name : ", database);
           if(userData.data[i]._id==database)
           {
              console.log("db names match");
              check = 1;
               var edgeList = userData.data[i].edgeList;
               var newEdgeList = [];
               for(var j=0;j<edgeList.length;j++)
               {  
                  console.log("edgeList[j] : ", edgeList[j]);
                  console.log("edgeList[j].nodeId : ", edgeList[j].edgeId);
                  console.log("id is :", id);
                  if(edgeList[j].edgeId == id)
                  {
                    console.log("the edge which matched is this :", edgeList[j]);
                    //res.json(nodeList[j]);
                    console.log("the edge is deleted : P");
                  } 
                  else{
                    newEdgeList.push(edgeList[j]);
                  }
               }
               userData.data[i].edgeList = newEdgeList;

           }
           if(check == 1){

              db.users.update(
                {_id: sess.uName},
                   userData,
                   {upsert: true}
            )

              res.json({'updated' : 'true'});
              break;  
           }
       }
    });
});


app.get('/edgelist/:edgeId', function(req, res) {
  var id = req.params.edgeId;
  console.log(id);
  var check = 0;
  sess = req.session;

  db.users.findOne({'_id':sess.uName},function(err,doc)
  {
    var userData = doc;  
       for(var i =0;i<userData.data.length;i++)
       {
           console.log(userData.data[i]);
           console.log("userData.data[i]._id : ", userData.data[i]._id);
           console.log("database name : ", database);
           if(userData.data[i]._id==database)
           {
              console.log("db names match");
              check = 1;
               var edgeList = userData.data[i].edgeList;
               for(var j=0;j<edgeList.length;j++)
               {  
                  console.log("edgeList[j] : ", edgeList[j]);
                  console.log("edgeList[j].edgeId : ", edgeList[j].edgeId);
                  console.log("id is :", id);
                  if(edgeList[j].edgeId == id)
                  {
                    console.log("the edge which matched is this :", edgeList[j]);
                    res.json(edgeList[j]);
                    break;
                  } 
               }
           }
           if(check == 1){
              break;  
           }
       }

    });
});
    

app.put('/edgelist/:edgeId', function(req, res) {
  var id = req.params.edgeId;
  var newJson = {'edgeId': req.body.edgeId, 'node1': req.body.node1, 'node2': req.body.node2, 'flow': req.body.flow};
  var check = 0;
  var sess = req.session;
  db.users.findOne({'_id':sess.uName},function(err,doc)
  {
    var userData = doc;  
       for(var i =0;i<userData.data.length;i++)
       {
           console.log("userData.data[i]._id : ", userData.data[i]._id);
           if(userData.data[i]._id==database)
           {
              console.log("db names match");
              check = 1;
               var edgeList = userData.data[i].edgeList;
               var newEdgeList = [];
               for(var j=0;j<edgeList.length;j++)
               {  
                  console.log("edgeList[j] : ", edgeList[j]);
                  console.log("edgeList[j].nodeId : ", edgeList[j].edgeId);
                  console.log("id is :", id);
                  if(edgeList[j].edgeId == id)
                  {
                    console.log("the edge which matched is this :", edgeList[j]);
                    newEdgeList.push(newJson);
                  } 
                  else{
                    newEdgeList.push(edgeList[j]);
                  }
               }
               userData.data[i].edgeList = newEdgeList;

           }
           if(check == 1){
              db.users.update({_id: sess.uName},userData,{upsert: true})
              res.json({'updated' : 'true'});
              break;  
           }
       }
  });
});


app.post('/upload/file_edges/',function(req, res) 
{
    var form = new multiparty.Form();
    form.parse(req, function(err, fields, files) 
    {
        var file = files.file[0];
        var contentType = file.headers['content-type'];
        var tmpPath = file.path;
        console.log(tmpPath);
        var extIndex = tmpPath.lastIndexOf('.');
        var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);
        // uuid is for generating unique filenames. 
        var fileName = uuid.v4() + extension;
        var destPath = './public/uploads/' + fileName;
        console.log(destPath);
        // Server side file type checker.
        if (contentType !== 'text/csv') 
        {
            fs.unlink(tmpPath);
            return res.status(400).send('Unsupported file type.');
        }

        fs.rename(tmpPath, destPath, function(err) 
        {
            if (err) {
                return res.status(400).send('Check file path.');
            }
            return res.json(destPath);
        });

        var sess = req.session;
        db.users.findOne({'_id':sess.uName},function(err,doc)
           {
               var userData = doc;  
           var stream = fs.createReadStream(destPath,{encoding : 'utf-8'});
           console.log("dest pat is : ", destPath);

               for(var i =0;i<userData.data.length;i++)
               {
                   console.log(userData.data[i]);
                   if(userData.data[i]._id==database)
                   {
                       var edgeList = userData.data[i].edgeList;
                       console.log("edgeList here is : ", edgeList);
                       var newEdgeList = [];

                       csv.fromStream(stream, {headers: ['edgeId','node1','node2','flow']})
                         .on("data", function(data) {
                            console.log("csv stream");
                            //if(data.id != "" && data.name != "" && data.lat != "" && data.long != "" && data.stock != ""){
                            newEdgeList.push({'edgeId':data.edgeId, 'node1':data.node1, 'node2':data.node2, flow:data.flow });
                            //}
                            
                        })
                         .on("end", function() {
                            console.log("New EdgeList: ", newEdgeList);
                            userData.data[i].edgeList = newEdgeList;

                            db.users.update(
                          {_id: sess.uName},
                           userData,
                           {upsert: true}
                       )
                         });
                       break; 
                   }
               }
           });
    });
});

/*
 * Pop Up Functions
 */

app.get('/dbList', function(req,res) {
	sess = req.session;
	console.log("Received GET Request");
	db.users.findOne({ '_id': sess.uName }, {'data._id': 1}, function(err, docs) {
		console.log("DADDADADDADADA", docs)
		res.json(docs['data']);
	});

});


app.post('/createDb', function (req, res) {
	sess = req.session;
	var userDatabaseName = req.body.newDbName;
	console.log(req.body.newDbName);
	var check = 0;
	db.users.findOne({ '_id': sess.uName }, {'data._id': 1}, function(err, docs) {
		var databaseNames = docs['data'];
		for(var i=0; i<=databaseNames.length-1; i++){
			var each = databaseNames[i];
        	if(userDatabaseName == each['_id']){
        		console.log("matched");
        		check = 1;
        		//res.json({"status": "false"});
        	}
//        	console.log("data", key + ":" + value['_id']);
        }

        if(check == 1){
			res.json({"found": "false"});
		}
	else{
		db.users.update({"_id" : sess.uName},{$push:{"data":{ "_id" : req.body.newDbName, "nodeList": [ ], "edgeList": [ ], "options":{"nodeColor":"Black", "nodeShape":"Circle","edgeColor": "Black","labelColor":"Black","background": "White", "flowRep":"Labels"}}}}, function(err, doc) {
		database = userDatabaseName;
		console.log(database);
		//res.json(doc);
		res.json({"found": "true"});
	});
	}


	});

	
});

app.post('/setDb', function (req, res) {
	console.log("database set to: ", req.body.selectedOption);
	database = req.body.selectedOption;
	res.json({"status":"true"});

})

/*
 * Visualization Functions
 */
app.get("/NetViz", function (req, res) {
  sess = req.session;
  //var id = req.params.id;
  db.users.findOne({_id: sess.uName}, function(err,docs) {
    res.json([docs, database]);
  })

});

app.put("/NetViz", function(req, res) {
  sess = req.session;
  //var id = req.params.id;
  db.users.findAndModify({query: {_id: sess.uName}, update: {$set: {data: req.body.data}}, new:true}, function(err, doc) {
    res.json(doc);
  });

});

app.listen(3000);
console.log("Server running on port 3000");
