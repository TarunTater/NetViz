var myApp = angular.module('app', []);

myApp.controller('AppCtrl', ['$scope', '$http', function($scope, $http) {

	var colors = ["Blue", "Red", "Pink", "Magenta", "Cyan", "Green", "Teal", "White", "Yellow", "Orange", "Purple", "Violet", "Maroon", "Lime", "Black"];                                                
	$scope.colors = colors.sort();
	$scope.flowReps = ["Thickness", "Labels"]
	//var user = "hp";
	var data = "data1";

	
	var refresh1 = function() {
		$http.get("/NetViz").success(function(res) {
			$scope.NetViz = res;
			for (i in res["data"]) {
				if (res["data"][i]["_id"] == data) {
					response = res["data"][i];
					break;
				}
			}
			$("#canvas").empty();
			var tip1 = d3.tip()
	                    .attr('class', 'd3-tip')
	                    .html(function(d) { return "Node Name: " + d["nodeName"] + "<br/>" + "Lat: " + d["lat"] + "<br/>" + "Long: " + d["long"] + "<br/>" + "Stock: " + d["stock"]})
	                    .offset([-12, 0])

	       	var zoom = d3.behavior.zoom()
			    .scaleExtent([0.5, 20])
			    .on("zoom", zoomed);

			var drag = d3.behavior.drag()
				.origin(function(d) { return d; })
				.on("dragstart", dragstarted)
				.on("drag", dragged)
				.on("dragend", dragended);

			function zoomed() {
				container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
			}

			function dragstarted(d) {
			   	d3.event.sourceEvent.stopPropagation();
			   	d3.select(this).classed("dragging", true);
			 }

			function dragged(d) {}

			function dragended(d) {
				d3.select(this).classed("dragging", false);
			}

			var svg = d3.select("#canvas").append("svg")
			  	.append("g")
			    .call(zoom)
			    .call(tip1);

			var rec = svg.append("rect")
				.style("fill", $scope.bgColor)
				.style("pointer-events", "all");
				                                  
			var container = svg.append("g");

	        var nodeList = response["nodeList"];
	        var edgeList = response["edgeList"];
	                
			var nodes = {};
			var edges = {};

			var x;
			var y;

			var latMin = nodeList[0]["lat"];
			var latMax = nodeList[0]["lat"];

			var longMin = nodeList[0]["long"];
			var longMax = nodeList[0]["long"];

			var stockMin = nodeList[0]["stock"];
			var stockMax = nodeList[0]["stock"];

			var flowMin = edgeList[0]["flow"];
			var flowMax = edgeList[0]["flow"];

			var lats = [];
			var longs = [];

			$scope.noOfNodes = Object.keys(nodeList).length;
			$scope.noOfEdges = Object.keys(edgeList).length;

			for (x in nodeList) {
				nodes[nodeList[x]["nodeId"]] = {};
				nodes[nodeList[x]["nodeId"]]["nodeName"] = nodeList[x]["nodeName"];
				nodes[nodeList[x]["nodeId"]]["lat"] = nodeList[x]["lat"];
				nodes[nodeList[x]["nodeId"]]["long"] = nodeList[x]["long"];
				nodes[nodeList[x]["nodeId"]]["stock"] = nodeList[x]["stock"];

				lats.push(nodeList[x]["lat"]);
				longs.push(nodeList[x]["long"]);

				if (nodeList[x]["lat"] < latMin) { latMin = nodeList[x]["lat"]};
				if (nodeList[x]["lat"] > latMax) { latMax = nodeList[x]["lat"]};
				if (nodeList[x]["long"] < longMin) { longMin = nodeList[x]["long"]};
				if (nodeList[x]["long"] > longMax) { longMax = nodeList[x]["long"]};
				if (parseFloat(nodeList[x]["stock"]) < stockMin) { stockMin = nodeList[x]["stock"]};
				if (parseFloat(nodeList[x]["stock"]) > stockMax) { stockMax = nodeList[x]["stock"]};
			}

			var latset = new Set(lats);
			var longset = new Set(longs);

			latSize = latset.size;
			longSize = longset.size;

			lats = Array.from(latset).sort();
			longs = Array.from(longset).sort();

			latdict = {};
			longdict = {};

			var i = 0;
			var j = 0;
			
			for (i=0;i<latSize;i++) {
				latdict[lats[i]] = -50 + $("#canvas").height() - (i*($("#canvas").height() - 100)/(latSize - 1));
			}

			for (j=0;j<longSize;j++) {
				longdict[longs[j]] = (j * ($("#canvas").width() - 100)/(longSize - 1)) + 50;
			}

			for (y in edgeList) {
				edges[edgeList[y]["edgeId"]] = {};
				edges[edgeList[y]["edgeId"]]["node1"] = edgeList[y]["node1"];
				edges[edgeList[y]["edgeId"]]["node2"] = edgeList[y]["node2"];
				edges[edgeList[y]["edgeId"]]["flow"] = edgeList[y]["flow"];
				
				if (edgeList[y]["flow"] < flowMin) { flowMin = edgeList[y]["flow"]};
				if (edgeList[y]["flow"] > flowMax) { flowMax = edgeList[y]["flow"]};
			}

			var latdiff = latMax - latMin;
			var longdiff = longMax - longMin;
			var stockdiff = stockMax - stockMin;
			var flowdiff = flowMax - flowMin;

			var latfact = ($("#canvas").height() - 100)/latdiff;
			var longfact = ($("#canvas").width() - 100)/longdiff;
			var stockfact = 20/stockdiff;
			var flowfact = 15/flowdiff;

			var lines = container.selectAll("line")
	                    .data(d3.values(edges))
	                    .enter()
	                    .append("line")

		    var lineAttributes = lines
		                            .attr("x1", function (d) { return longdict[nodes[d["node1"]]["long"]];})
		                            .attr("y1", function (d) { return latdict[nodes[d["node1"]]["lat"]];})
		                            .attr("x2", function (d) { return longdict[nodes[d["node2"]]["long"]];})
		                            .attr("y2", function (d) { return latdict[nodes[d["node2"]]["lat"]];})
		                            .attr("stroke-width", 2)	                         
		                            .attr("stroke", $scope.edgeColor)
		                            
		                            

		   


			var circles = container.selectAll("circle")
	                        .data(d3.values(nodes))
	                        .enter()
	                        .append("circle");

	        var circleAttributes = circles
	                                .attr("cx", function (d) { return longdict[d["long"]];})
	                                .attr("cy", function (d) { return latdict[d["lat"]];})
	                                .attr("r", function (d) { return ((d["stock"] - stockMin)*stockfact + 10)/2 ; })
	                                .style("fill", $scope.nodeColor)
	                                .style("stroke", "black")
	                                .attr("stroke-width", 1)
	                                .on('mouseover', tip1.show)
	                                .on('mouseout', tip1.hide); 

	         var labels = container.selectAll("text")
		    				.data(d3.values(edges))
	                    	.enter()
	                    	.append("text");

	        var labelAttributes = labels
	        						.text(function(d){return d["flow"]})
	        						.attr("x", function(d) { return ((longdict[nodes[d["node1"]]["long"]])+(longdict[nodes[d["node2"]]["long"]]))/2})
		                            .attr("y", function(d) { return ((latdict[nodes[d["node1"]]["lat"]])+(latdict[nodes[d["node2"]]["lat"]]))/2})
		                            .attr("font-family", "sans-serif")
		                            .attr("font-size", "12px")
		                            .attr("fill", "black");

		    $scope.flowMin = flowMin;
		    $scope.flowMax = flowMax;
		    $scope.stockMin = stockMin;
		    $scope.stockMax = stockMax;
	        
		})
	}

	var refresh = function() {
		$http.get("/NetViz").success(function(res) {
			$scope.NetViz = res;
			for (i in res["data"]) {
				if (res["data"][i]["_id"] == data) {
					response = res["data"][i];
					break;
				}
			}
			$("#canvas").empty();
			var tip1 = d3.tip()
	                    .attr('class', 'd3-tip')
	                    .html(function(d) { return "Node Name: " + d["nodeName"] + "<br/>" + "Lat: " + d["lat"] + "<br/>" + "Long: " + d["long"] + "<br/>" + "Stock: " + d["stock"]})
	                    .offset([-12, 0])

	       	var zoom = d3.behavior.zoom()
			    .scaleExtent([0.5, 20])
			    .on("zoom", zoomed);

			var drag = d3.behavior.drag()
				.origin(function(d) { return d; })
				.on("dragstart", dragstarted)
				.on("drag", dragged)
				.on("dragend", dragended);

			function zoomed() {
				container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
			}

			function dragstarted(d) {
			   	d3.event.sourceEvent.stopPropagation();
			   	d3.select(this).classed("dragging", true);
			 }

			function dragged(d) {}

			function dragended(d) {
				d3.select(this).classed("dragging", false);
			}

			var svg = d3.select("#canvas").append("svg")
			  	.append("g")
			    .call(zoom)
			    .call(tip1);

			var rec = svg.append("rect")
				.style("fill", $scope.bgColor)
				.style("pointer-events", "all");
				                                  
			var container = svg.append("g");

	        var nodeList = response["nodeList"];
	        var edgeList = response["edgeList"];
	                
			var nodes = {};
			var edges = {};

			var x;
			var y;

			var latMin = nodeList[0]["lat"];
			var latMax = nodeList[0]["lat"];

			var longMin = nodeList[0]["long"];
			var longMax = nodeList[0]["long"];

			var stockMin = nodeList[0]["stock"];
			var stockMax = nodeList[0]["stock"];

			var flowMin = edgeList[0]["flow"];
			var flowMax = edgeList[0]["flow"];

			var lats = [];
			var longs = [];

			$scope.noOfNodes = Object.keys(nodeList).length;
			$scope.noOfEdges = Object.keys(edgeList).length;

			for (x in nodeList) {
				nodes[nodeList[x]["nodeId"]] = {};
				nodes[nodeList[x]["nodeId"]]["name"] = nodeList[x]["name"];
				nodes[nodeList[x]["nodeId"]]["lat"] = nodeList[x]["lat"];
				nodes[nodeList[x]["nodeId"]]["long"] = nodeList[x]["long"];
				nodes[nodeList[x]["nodeId"]]["stock"] = nodeList[x]["stock"];

				lats.push(nodeList[x]["lat"]);
				longs.push(nodeList[x]["long"]);

				if (nodeList[x]["lat"] < latMin) { latMin = nodeList[x]["lat"]};
				if (nodeList[x]["lat"] > latMax) { latMax = nodeList[x]["lat"]};
				if (nodeList[x]["long"] < longMin) { longMin = nodeList[x]["long"]};
				if (nodeList[x]["long"] > longMax) { longMax = nodeList[x]["long"]};
				if (parseFloat(nodeList[x]["stock"]) < stockMin) { stockMin = nodeList[x]["stock"]};
				if (parseFloat(nodeList[x]["stock"]) > stockMax) { stockMax = nodeList[x]["stock"]};

			}

			var latset = new Set(lats);
			var longset = new Set(longs);

			latSize = latset.size;
			longSize = longset.size;

			lats = Array.from(latset).sort();
			longs = Array.from(longset).sort();

			latdict = {};
			longdict = {};

			var i = 0;
			var j = 0;
			
			for (i=0;i<latSize;i++) {
				latdict[lats[i]] = -50 + $("#canvas").height() - (i*($("#canvas").height() - 100)/(latSize - 1));
			}

			for (j=0;j<longSize;j++) {
				longdict[longs[j]] = (j * ($("#canvas").width() - 100)/(longSize - 1)) + 50;
			}

			for (y in edgeList) {
				edges[edgeList[y]["edgeId"]] = {};
				edges[edgeList[y]["edgeId"]]["node1"] = edgeList[y]["node1"];
				edges[edgeList[y]["edgeId"]]["node2"] = edgeList[y]["node2"];
				edges[edgeList[y]["edgeId"]]["flow"] = edgeList[y]["flow"];
				
				if (edgeList[y]["flow"] < flowMin) { flowMin = edgeList[y]["flow"]};
				if (edgeList[y]["flow"] > flowMax) { flowMax = edgeList[y]["flow"]};
			}

			var latdiff = latMax - latMin;
			var longdiff = longMax - longMin;
			var stockdiff = stockMax - stockMin;
			var flowdiff = flowMax - flowMin;

			var latfact = ($("#canvas").height() - 100)/latdiff;
			var longfact = ($("#canvas").width() - 100)/longdiff;
			var stockfact = 20/stockdiff;
			var flowfact = 15/flowdiff;

			var lines = container.selectAll("line")
	                    .data(d3.values(edges))
	                    .enter()
	                    .append("line")

		    var lineAttributes = lines
		                            .attr("x1", function (d) { return longdict[nodes[d["node1"]]["long"]];})
		                            .attr("y1", function (d) { return latdict[nodes[d["node1"]]["lat"]];})
		                            .attr("x2", function (d) { return longdict[nodes[d["node2"]]["long"]];})
		                            .attr("y2", function (d) { return latdict[nodes[d["node2"]]["lat"]];})
		                            .attr("stroke-width", function (d) { return ((d["flow"] - flowMin) * flowfact + 1)/2;})
		                            .attr("stroke", $scope.edgeColor);

			var circles = container.selectAll("circle")
	                        .data(d3.values(nodes))
	                        .enter()
	                        .append("circle");

	        var circleAttributes = circles
	                                .attr("cx", function (d) { return longdict[d["long"]];})
	                                .attr("cy", function (d) { return latdict[d["lat"]];})
	                                .attr("r", function (d) { return ((d["stock"] - stockMin)*stockfact + 10)/2 ; })
	                                .style("fill", $scope.nodeColor)
	                                .style("stroke", "black")
	                                .attr("stroke-width", 1)
	                                .on('mouseover', tip1.show)
	                                .on('mouseout', tip1.hide); 

	        $scope.flowMin = flowMin;
		    $scope.flowMax = flowMax;
		    $scope.stockMin = stockMin;
		    $scope.stockMax = stockMax;                       

	        
		})
	}

	


	$scope.apply = function() {
		if ($scope.flowRep == "Thickness"){
			refresh();
		}
		else {
			refresh1();
		}

	}


	var set = function() {
		$http.get("/NetViz").success(function(res) {
			$scope.NetViz = res;
			console.log(res);
			for (i in res["data"]) {
				if (res["data"][i]["_id"] == data) {
					response = res["data"][i];
					break;
				}
			}
			$scope.edgeColor = response["options"]["edgeColor"];
			$scope.nodeColor = response["options"]["nodeColor"];
			$scope.bgColor = response["options"]["background"];
			$scope.flowRep = response["options"]["flowRepresenation"];

			if ($scope.flowRep == "Thickness"){
			refresh();
			}
			else {
				refresh1();
			}
		})
	}

	$scope.save = function() {
		opt = {};
		opt["nodeColor"] = $scope.nodeColor; 
		opt["edgeColor"] = $scope.edgeColor; 
		opt["background"] = $scope.bgColor; 
		opt["flowRepresenation"] = $scope.flowRep;
		for (i in $scope.NetViz["data"]) {
			if ($scope.NetViz["data"][i]["_id"] == data) {
				$scope.NetViz["data"][i]["options"] = opt;
				break;
			}
		}
		$http.put("/NetViz/" + $scope.NetViz._id, $scope.NetViz).success(function(res) {
			set(user);
		}) ;
		
	}

	set();

}]);