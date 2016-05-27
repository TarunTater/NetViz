db.createCollection("nodeList",
	{ validator : { $and:
		[
			{ nodeId: { $type: "integer", $exists: true } },
			{ nodeName: { $type:"string", $exists: true } },
			{ lat: { $type: "double", $exist: true } },
			{ long: { $type: "double", $exists: true } },
			{ stock: { $type: "integer", $exists: true } }
		]}
	})

db.createCollection("edgeList", 
	{ validator: { $and:
		[
			{ edgeId: { $type: "integer", $exists: true } },
			{ node1: { $type: "integer", $exists: true} },
			{ node2: { $type: "integer", $exists: true } },
			{ flow: { $type: "integer", $exists: true } }
		]}
	})



db.createCollection("data", 
	{ validator: {$and:
		[
			{ _name: {$exists:true} }
		]}
})


db.createCollection("users",
	{ validator: { $and:
		[
			{ _id: { $type: "string", $exists: true , $unique: true} },
         	{ password: { $type: "string", $exists: true } }
		]}
})

//db.createCollection("users")


/*	
database = db.createCollection("users",
	{ validator: { $and:
      [
         { userId: { $type: "string", $exists: true , $unique: true} },
         { password: { $type: "string", $exists: true } },
         { data: 
         	{ validator: {$and: 
         		[
         		{ name: {$type: "string", $exists: true } }	,
         		{nodeList: 
         			{ validator : { $and:
						[
						{ nodeId: { $type: "integer", $exists: true } },
						{ nodeName: { $type:"string", $exists: true } },
						{ lat: { $type: "double", $exist: true } },
						{ long: { $type: "double", $exists: true } },
						{ stock: { $type: "integer", $exists: true } }
						]}
					}},
			  {edgeList: 
					  { validator: { $and:
						[
						{ edgeId: { $type: "integer", $exists: true } },
						{ node1: { $type: "integer", $exists: true} },
						{ node2: { $type: "integer", $exists: true } },
						{ flow: { $type: "integer", $exists: true } }
						]}
					}},
					{options: 
					  { validator: { $and:
						[
						{ nodeRepresentation: {$type: "string" } },
						{ edgeRepresentation: {$type: "string" } }
						]}
					}}
		]}
	}}
      ]}
	})
	*/
	

