var gisApp = angular.module('app',['ngRoute', 'ngFileUpload','ngDialog']);


gisApp.directive('tabs', function() {
    return {
      restrict: 'E',
      transclude: true,
      scope: {},
      controller: [ "$scope", "$window", "$location", "$http", function($scope, $window, $location, $http) {
        var panes = $scope.panes = [];
 
        $scope.select = function(pane) {
          angular.forEach(panes, function(pane) {
            pane.selected = false;
          });
          pane.selected = true;
        }
 
        this.addPane = function(pane) {
          if (panes.length == 0) $scope.select(pane);
          panes.push(pane);
        }

        $scope.logout = function() {
            $http.get('/logout').success(function(response) {
                
        });
        }

        $scope.deleteDB = function() {
            $http.delete('/deleteDB').success(function(response) {
                console.log(response);
                if(response.updated == "true") {
                    console.log("Database deleted!");
                    $window.location.href = "/popup";  
                }
                
            });
        };

        $scope.changeDB = function() {
            $window.location.href = "/popup";
        }

      }],
      template:
        '<div class="tabbable">' +
          '<ul class="nav nav-tabs">' +
            '<li ng-repeat="pane in panes" ng-class="{active:pane.selected}">'+
              '<a href="" ng-click="select(pane)">{{pane.title}}</a>' +
            '</li>' +
            '<li style="float:right"><button class="btn btn-warning" ng-click="logout()">Logout</button></li>' +
            '<li style="float:right"><button class="btn btn-danger" ng-click="deleteDB()">Delete Database</button>&nbsp;&nbsp;</li>' +
            '<li style="float:right"><button class="btn btn-info" ng-click="changeDB()">Change Database</button>&nbsp;&nbsp;</li>' +
          '</ul>' +
          '<div class="tab-content" ng-transclude></div>' +
        '</div>',
      replace: true
    };
  }).
  directive('pane', function() {
    return {
      require: '^tabs',
      restrict: 'E',
      transclude: true,
      scope: { title: '@' },
      link: function(scope, element, attrs, tabsCtrl) {
        tabsCtrl.addPane(scope);
      },
      template:
        '<div class="tab-pane" ng-class="{active: selected}" ng-transclude>' +
        '</div>',
      replace: true
    };
  });



gisApp.service('userNameService', function(){
  this.name = "name"  
});

gisApp.controller('loginController', ['$scope', '$http', '$location','$window','userNameService',function($scope, $http,$location, $window, userNameService) {
	console.log("hello");

	$scope.takeToRegisterScreen = function(){
		$window.location.href="/register";
	};
	$scope.login = function(){
	console.log($scope.user);
	$http.post('/loginTask', $scope.user).success(function(response){
		console.log(response);
		if((response.status == "true") && (response.passwordStatus == "false")){
				$scope.error="Short term memory loss?! Come on! Password is Important";
			}
		else if (response.status == "true"){
			// $location.path.href('/register');			
			$window.location.href = "/popup";
		}
		else{
			$scope.error="You never registered with us! :O";
		}
	});
};
}]);



gisApp.controller('registerController', ['$scope', '$http', '$location', '$window', 'userNameService',function($scope, $http,$location, $window, userNameService) {
	console.log("hello");
	$scope.backToLogin = function(){
		$window.location.href="/index";
	};

	$scope.register = function(){
		console.log($scope.user);

		if($scope.user.password != $scope.user.confirmPassword){
			console.log("passwords don't match :P");
			$scope.error = 'The DNAs(password) did not match!';
		}
		else{
			$http.post('/registerTask', $scope.user).success(function(response){
				console.log(response);
				if(response.status == "false"){
						$scope.error="You are not funny enough! Take a new username";
					}
				else if (response.status == "true"){
					$window.location.href = '/index';
					console.log("holaR");
				}
			});
		}
	};
}]);


gisApp.controller('PopUpCtrl', ['$scope', '$http', '$location', 'ngDialog', '$window',
	function ($scope, $http, $location, ngDialog, $window) {

	$http.get('/dbList').success(function(response) {
            console.log("Got requested Data");
            $scope.data = {
        	availableOptions: ['No Database Selected'],
        	selectedOption: 'No Database Selected'
        };

        angular.forEach(response, function(value,key){
        	$scope.data['availableOptions'].push(value['_id']);
        	console.log("data", key + ":" + value['_id']);
        })

        });


$scope.createNew = function() {
            $http.post('/createDb', $scope.db).success(function(response) {
                console.log(response, "came here");
                if(response.found == "true"){
                	
					$window.location.href = '/home';                	
                }
				else {
					$scope.error = "Database already exists!";
				}
            });
};

$scope.useExisting = function() {
	if ($scope.data.selectedOption != 'No Database Selected') {
		console.log("Selected option: ", $scope.data.selectedOption);
		$http.post('/setDb', $scope.data).success(function(response) {
			$window.location.href = '/home';                	
		});
	}
	else {
		$scope.error = "No Database Selected!";
	}

}

}]);

gisApp.controller('PopUpNodeCtrl',['$scope', '$http', 'Upload', 'ngDialog',
    function($scope, $http, Upload, ngDialog){
        console.log("Hello from controller");

        	var id = ngDialog.open({

				template: 'firstDialogId',
				controller: 'PopUpCtrl',
				className: 'ngdialog-theme-default',
				showClose: false,
				closeByEscape: false,
				closeByDocument : false
		});
}]);




gisApp.controller('NodeCtrl',['$scope', '$http', 'Upload', 'ngDialog',
    function($scope, $http, Upload, ngDialog){
        console.log("Hello from controller");


        var refresh = function() {  
            console.log("Trying to refresh ");
            $http.get('/nodelist').success(function(response) {
                console.log("Got requested Data to show nodes");
                
                $scope.nodelist = response; 
                $scope.node = "";
            });
        }

        refresh();

        $scope.addNode = function() {
            console.log("i am in addNode : ", $scope.node);
            $http.post('/nodelist', $scope.node).success(function(response) {
                console.log("i am in addNode : after adding from server : ",response);
                refresh();
            }); 
            refresh();        
        };

        $scope.remove = function(nodeId) {
            console.log(nodeId);
            $http.delete('/nodelist/' + nodeId).success(function(response) {
                console.log(response);
                console.log("node removed hp");
                refresh();
            });
            refresh();
        };

        $scope.edit = function(nodeId) {
            console.log(nodeId);
            $http.get('/nodelist/' +  nodeId).success(function(response) {
                console.log(response);
                $scope.node = response;
            });
        };

        $scope.update = function() {
            console.log($scope.node.nodeId);
            $http.put('/nodelist/' + $scope.node.nodeId, $scope.node).success(function(response) {
                console.log(response);  
                refresh();        
            });
            refresh();
        };

        $scope.deselect = function() {
            $scope.node = "";
        }

/*
 * File Upload
 */

  var csv_content;  
  console.log("Hello from login controller");

    $scope.onFileSelect = function(file) 
    {
        console.log("Inside file");
        if (angular.isArray(file)) 
        {
            console.log("isArray");
            file = file[0];
        }
        console.log(file.type);
        // This is how I handle file types in client side
        if (file.type !== 'text/csv') 
        {
            alert('Only CSV are accepted.');
            return;
        }
 
        //var j = csv2Json(csv_content);
        //console.log(j);
        $scope.upload = Upload.upload({
            url: '/upload/file_nodes/',
            method: 'POST',
            data: {file: file},
            headers: {'Content-Type': undefined}
        }).success(function(data, status, headers, config) {
            refresh();
                     
        }).error(function(err) {
            console.log(err);
        });
        refresh();
    };

    $scope.saveContent  = function($fileContent){
        csv_content = $fileContent;
    }
    }]);


gisApp.controller('EdgeCtrl',['$scope', '$http', 'Upload',
    function($scope, $http, Upload){
        console.log("Hello from controller");



    var refresh = function() {  
        $http.get('/edgelist').success(function(response) {
            console.log("Got requested Data");
            $scope.edgelist = response; 
            $scope.edge = "";
        });
    }

    refresh();

        $scope.addEdge = function() {
            console.log("I am in addEdge: ",$scope.edge);
            $http.post('/edgelist', $scope.edge).success(function(response) {
                console.log("i am in addEdge : after adding from server : ", response);
                refresh();    
            }); 
            refresh();        
        };

        $scope.remove = function(edgeId) {
            console.log(edgeId);
            $http.delete('/edgelist/' + edgeId).success(function(response) {
                console.log(response);
                console.log("edge removed after server");
            });
            refresh();
        };

        $scope.edit = function(edgeId) {
            console.log(edgeId);
            $http.get('/edgelist/' +  edgeId).success(function(response) {
                $scope.edge = response;
                console.log(response);
            });
        };

        $scope.update = function() {
            console.log($scope.edge.edgeId);
            $http.put('/edgelist/' + $scope.edge.edgeId, $scope.edge).success(function(response) {
                  console.log(response);
            });
            refresh();
        };

        $scope.deselect = function() {
            $scope.edge = "";
        }


        var csv_content;  
  console.log("Hello from login controller");

    $scope.onFileSelect = function(file) 
    {
        console.log("Inside file");
        if (angular.isArray(file)) 
        {
            console.log("isArray");
            file = file[0];
        }
        console.log(file.type);
        // This is how I handle file types in client side
        if (file.type !== 'text/csv') 
        {
            alert('Only CSV are accepted.');
            return;
        }
 
        //var j = csv2Json(csv_content);
        //console.log(j);
        $scope.upload = Upload.upload({
            url: '/upload/file_edges/',
            method: 'POST',
            data: {file: file},
            headers: {'Content-Type': undefined}
        }).success(function(data, status, headers, config) {
            refresh();
                     
        }).error(function(err) {
            console.log(err);
        });
        refresh();
    };

    $scope.saveContent  = function($fileContent){
        csv_content = $fileContent;
    }
        
    }]);


gisApp.controller('AppCtrl', ['$scope', '$http', function($scope, $http) {

   
    var colors = ["Blue", "Red", "Pink", "Magenta", "Cyan", "Green", "Teal", "White", "Yellow", "Orange", "Purple", "Violet", "Maroon", "Lime", "Black", "None"];                                                
    var shapes = ["Circle", "Square"];
    $scope.shapes = shapes.sort();
    $scope.colors = colors.sort();
    $scope.flowReps = ["Labels", "Thickness"]
    //var user = "hp";
    //var data = "Bus Network";

    
    var refresh1 = function() {
        $http.get("/NetViz").success(function(res) {
            $scope.NetViz = res[0];
            for (i in res[0]["data"]) {
                if (res[0]["data"][i]["_id"] == data) {
                    response = res[0]["data"][i];
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
                //.append("g")
                .call(zoom)
                .call(tip1);

            var rec = svg.append("rect")
          		.attr("class","holder")
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
                
                if (parseFloat(edgeList[y]["flow"]) < flowMin) { flowMin = parseFloat(edgeList[y]["flow"])};
                if (parseFloat(edgeList[y]["flow"]) > flowMax) { flowMax = parseFloat(edgeList[y]["flow"])};
            }

            var latdiff = latMax - latMin;
            var longdiff = longMax - longMin;
            var stockdiff = stockMax - stockMin;
            var flowdiff = flowMax - flowMin;

            var latfact = ($("#canvas").height() - 100)/latdiff;
            var longfact = ($("#canvas").width() - 100)/longdiff;
            var stockfact = 20/stockdiff;
            var flowfact = 15/flowdiff;

           /*var lines = container.selectAll("line")
                        .data(d3.values(edges))
                        .enter()
                        .append("line");

            var lineAttributes = lines
                                    .attr("x1", function (d) { return longdict[nodes[d["node1"]]["long"]];})
                                    .attr("y1", function (d) { return latdict[nodes[d["node1"]]["lat"]];})
                                    .attr("x2", function (d) { return longdict[nodes[d["node2"]]["long"]];})
                                    .attr("y2", function (d) { return latdict[nodes[d["node2"]]["lat"]];})
                                    .attr("stroke-width", 2)                             
                                    .attr("stroke", $scope.edgeColor)*/
                                    
            var lines = addLines(container,nodes,edges,flowMin,flowMax);                    

            /*var circles = container.selectAll("circle")
                            .data(d3.values(nodes))
                            .enter()
                            .append("circle");
           	
            var circleAttributes = circles
                                    .attr("cx", function (d) { return longdict[d["long"]];})
                                    .attr("cy", function (d) { return latdict[d["lat"]];})
                                    .attr("r", function (d) { console.log(stockMin);return ((d["stock"] - stockMin)*stockfact + 10)/2 ; })
                                    .style("fill", $scope.nodeColor)
                                    .style("stroke", "black")
                                    .attr("stroke-width", 1)
                                    .on('mouseover', tip1.show)
                                    .on('mouseout', tip1.hide);*/

            if ($scope.nodeShape == "Circle") {
            	var nodeShapes = addCircles(container,nodes,stockMin,stockfact);
            }
            else if($scope.nodeShape == "Square"){
            	var nodeShapes = addSquares(container,nodes,stockMin,stockfact);
            }

            nodeShapes.on('mouseover', tip1.show).on('mouseout', tip1.hide);
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
                                    .attr("fill", $scope.labelColor);

            $scope.flowMin = flowMin;
            $scope.flowMax = flowMax;
            $scope.stockMin = stockMin;
            $scope.stockMax = stockMax;
            
        })
    }

    var refresh = function() {
        $http.get("/NetViz").success(function(res) {
            $scope.NetViz = res[0];
            for (i in res[0]["data"]) {
                if (res[0]["data"][i]["_id"] == data) {
                    response = res[0]["data"][i];
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
                //.append("g")
                .call(zoom)
                .call(tip1);

            var rec = svg.append("rect")
            	.attr("class","holder")
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
                if (parseFloat(nodeList[x]["stock"]) < stockMin) { stockMin = parseFloat(nodeList[x]["stock"])};
                if (parseFloat(nodeList[x]["stock"]) > stockMax) { stockMax = parseFloat(nodeList[x]["stock"])};

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
                
                if (parseFloat(edgeList[y]["flow"]) < flowMin) { flowMin = parseFloat(edgeList[y]["flow"])};
                if (parseFloat(edgeList[y]["flow"]) > flowMax) { flowMax = parseFloat(edgeList[y]["flow"])};
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
            

            /*var circles = container.selectAll("circle")
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
                                    .on('mouseout', tip1.hide);*/
            if ($scope.nodeShape == "Circle") {
            	var nodeShapes = addCircles(container,nodes,stockMin,stockfact);
            }
            else if($scope.nodeShape == "Square"){
            	var nodeShapes = addSquares(container,nodes,stockMin,stockfact);
            }

            nodeShapes.on('mouseover', tip1.show).on('mouseout', tip1.hide);

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

    var addCircles = function(container, nodes, stockMin, stockfact) {

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
                                .attr("stroke-width", 2);
        return circleAttributes;                  
    }

    var addSquares = function(container, nodes, stockMin, stockfact) {

    	var squares = container.selectAll("rect")
	                    .data(d3.values(nodes))
	                    .enter()
	                    .append("rect");

	    var squareAttributes = squares
                                .attr("x", function (d) { return longdict[d["long"]] - ((d["stock"] - stockMin)*stockfact + 10)/3;})
                                .attr("y", function (d) { return latdict[d["lat"]] - ((d["stock"] - stockMin)*stockfact + 10)/3;})
                                .attr("width", function (d) { return ((d["stock"] - stockMin)*stockfact + 10)/1.5 ; })
                                .attr("height", function (d) { return ((d["stock"] - stockMin)*stockfact + 10)/1.5 ; })
                                .style("fill", $scope.nodeColor)
                                .style("stroke", "black")
                                .attr("stroke-width", 2);
        return squareAttributes;                  
    }

    var addLines = function(container,nodes,edges,flowMin,flowMax){
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
                                .attr("stroke", $scope.edgeColor);

        var p1 = flowMin + ((flowMax - flowMin + 1)/3) - 1;
        var p2 = flowMin + ((2*(flowMax - flowMin + 1))/3) - 1;

      	var lineAttributes = lineAttributes
      							.style("stroke-dasharray", function (d) {
      								if (d["flow"] <= p1){return ("2","2");}
      								else if (d["flow"] > p1 && d["flow"] <=p2) {return ("7","7");}
   									else if (d["flow"] > p2) {return("1","0");}
      							});
      	$scope.p1 = parseInt(p1);
      	$scope.p2 = parseInt(p2);

    }


    var set = function() {
    	$http.get("/NetViz").success(function(res) {
            $scope.NetViz = res[0];
            data = res[1];
            for (i in res[0]["data"]) {
                if (res[0]["data"][i]["_id"] == data) {
                    response = res[0]["data"][i];
                    break;
                }
            }
            $scope.edgeColor = response["options"]["edgeColor"];
            $scope.nodeColor = response["options"]["nodeColor"];
            $scope.bgColor = response["options"]["background"];
            $scope.flowRep = response["options"]["flowRep"];
            $scope.nodeShape = response["options"]["nodeShape"];
            $scope.labelColor = response["options"]["labelColor"];

        
        })
    }

    $scope.save = function() {
        opt = {};
        opt["nodeColor"] = $scope.nodeColor; 
        opt["edgeColor"] = $scope.edgeColor; 
        opt["background"] = $scope.bgColor; 
        opt["flowRep"] = $scope.flowRep;
        opt["nodeShape"] = $scope.nodeShape;
        opt["labelColor"] = $scope.labelColor;
        for (i in $scope.NetViz["data"]) {
            if ($scope.NetViz["data"][i]["_id"] == data) {
                $scope.NetViz["data"][i]["options"] = opt;
                break;
            }
        }
        $http.put("/NetViz", $scope.NetViz).success(function(res) {
            set();
        }) ;
        
    }

    set();


}]);