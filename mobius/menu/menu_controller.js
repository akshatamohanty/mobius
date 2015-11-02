//
// Controller for menubar
//

vidamo.controller('menuCtrl',['$scope','$rootScope','$timeout','consoleMsg','generateCode','nodeCollection','$http','hotkeys',
    function($scope,$rootScope,$timeout,consoleMsg,generateCode,nodeCollection,$http,hotkeys){

        // store json url
        $scope.sceneUrl= '';
        $scope.jsUrl = '';
        $scope.libUrl = '';
        $scope.nodeUrl = '';

        // listen to graph to get current selected node
        // for export selected node
        $rootScope.$on("nodeIndex", function(event, message) {
            $scope.nodeIndex = message;
        });


        // create new scene

        $scope.newScene = function(){
            // prompt user to save the current scene
            if (confirm("Save the current scene before you create a new scene?") === true) {
                setTimeout(function(){
                    document.getElementById('saveSceneJson').click()
                },0);
            }

            // reset procedure / interface / graph and refresh viewport
            generateCode.setChartViewModel(new flowchart.ChartViewModel({
                    "nodes": [],
                    "connections": []
                }
            ));
            generateCode.setDataList([]);
            generateCode.setInterfaceList([]);

            var scope = angular.element(document.getElementById('threeViewport')).scope();
            var scopeTopo = angular.element(document.getElementById('topoViewport')).scope();

            setTimeout(function(
            ){
                scope.$apply(function(){scope.viewportControl.refreshView();} );
                scopeTopo.$apply(function(){scopeTopo.topoViewportControl.refreshView();} );
            },0);

            consoleMsg.confirmMsg('newSceneCreated');
            $rootScope.$broadcast('runNewScene');
        };

        $scope.loadExample = function(exampleFile){
            $http({
                method: 'GET',
                url: 'examples/' + exampleFile,
                data: {},
                transformResponse: function (data) {
                    // since example files is not standard .json and can't parse correctly by $http
                    // overwrite the default response
                    return data;
                }
            }).success(
                function(response) {
                    var graphJsonString;
                    var procedureJsonString;
                    var interfaceJsonString;
                    var graphJsonObj;
                    var procedureJsonObj;
                    var interfaceJsonObj;

                    graphJsonString = response.split("//procedure json")[0];
                    var secondhalf = response.split("//procedure json")[1];
                    procedureJsonString = secondhalf.split("//interface json")[0];
                    interfaceJsonString = secondhalf.split("//interface json")[1];

                    graphJsonObj = JSON.parse(graphJsonString);
                    procedureJsonObj = JSON.parse(procedureJsonString);
                    interfaceJsonObj = JSON.parse(interfaceJsonString);

                    generateCode.setChartViewModel(new flowchart.ChartViewModel(graphJsonObj));
                    generateCode.setDataList(procedureJsonObj);
                    generateCode.setInterfaceList(interfaceJsonObj);
                    consoleMsg.confirmMsg('exampleImport');
                    generateCode.generateCode();

                    var scope = angular.element(document.getElementById('threeViewport')).scope();
                    var scopeTopo = angular.element(document.getElementById('topoViewport')).scope();

                    setTimeout(function(
                    ){
                        scope.$apply(function(){scope.viewportControl.refreshView();} );
                        scopeTopo.$apply(function(){scopeTopo.topoViewportControl.refreshView();} );
                        $rootScope.$broadcast('runNewScene');
                    },0);
                }
            );
        };


        // open and read json file for scene
        $scope.openSceneJson = function(files){
            var f = files[0];
            var jsonString;
            var graphJsonString;
            var procedureJsonString;
            var interfaceJsonString;
            var graphJsonObj;
            var procedureJsonObj;
            var interfaceJsonObj;

            var reader = new FileReader();

            reader.onload = (function () {
                return function (e) {

                    if(f.name.split('.').pop() == 'json') {

                        jsonString = e.target.result;

                        graphJsonString = jsonString.split("//procedure json")[0];
                        var secondhalf = jsonString.split("//procedure json")[1];
                        procedureJsonString = secondhalf.split("//interface json")[0];
                        interfaceJsonString = secondhalf.split("//interface json")[1];

                        graphJsonObj = JSON.parse(graphJsonString);
                        procedureJsonObj = JSON.parse(procedureJsonString);
                        interfaceJsonObj = JSON.parse(interfaceJsonString);

                        // update the graph
                        generateCode.setChartViewModel(new flowchart.ChartViewModel(graphJsonObj));

                        // update the procedure
                        generateCode.setDataList(procedureJsonObj);

                        // update the interface
                        generateCode.setInterfaceList(interfaceJsonObj);

                        consoleMsg.confirmMsg('sceneImport');
                    }else{
                        consoleMsg.errorMsg('invalidFileType');
                    }
                    generateCode.generateCode();
                };
            })(f);

            reader.readAsText(f);

            var scope = angular.element(document.getElementById('threeViewport')).scope();
            var scopeTopo = angular.element(document.getElementById('topoViewport')).scope();

            setTimeout(function(
            ){
                scope.$apply(function(){scope.viewportControl.refreshView();} );
                scopeTopo.$apply(function(){scopeTopo.topoViewportControl.refreshView();} );
                $rootScope.$broadcast('runNewScene');
            },0);

        };

        // save json file for scene
        $scope.saveSceneJson = function(){

            var graphJson = JSON.stringify(generateCode.getChartViewModel().data, null, 4);

            var procedureJson = JSON.stringify(generateCode.getDataList(), null, 4);

            var interfaceJson = JSON.stringify(generateCode.getInterfaceList(), null, 4);


            var sceneBlob = new Blob([graphJson + '\n\n' + '//procedure json\n'
                                    + procedureJson + '\n\n' + '//interface json\n'
                                    + interfaceJson], {type: "application/json"});

            $scope.sceneUrl = URL.createObjectURL(sceneBlob);
        };


        // import pre-defined node
        $scope.importNode = function (files) {

            var jsonString;
            var nodeJsonString;
            var procedureJsonString;
            var interfaceJsonString;

            var nodeJsonObj;
            var procedureJsonObj;
            var interfaceJsonObj;

            for(var i = 0; i < files.length ; i ++ ){
                var f = files[i];

                var reader = new FileReader();

                reader.onload = (function () {

                    return function (e) {
                        if(f.name.split('.').pop() == 'json') {

                            jsonString = e.target.result;

                            nodeJsonString = jsonString.split("//procedure json")[0];

                            var temp = jsonString.split("//procedure json")[1];
                            procedureJsonString = temp.split("//interface json")[0];
                            interfaceJsonString = temp.split("//interface json")[1];

                            nodeJsonObj = JSON.parse(nodeJsonString);
                            procedureJsonObj = JSON.parse(procedureJsonString);
                            interfaceJsonObj = JSON.parse(interfaceJsonString);
                            var newNodeName = nodeJsonObj.type;

                            console.log('1:  ', nodeJsonObj);

                            // install new imported node into nodeCollection
                            nodeCollection.installNewNodeType(newNodeName,
                                                                nodeJsonObj.inputConnectors,
                                                                nodeJsonObj.outputConnectors,
                                                                procedureJsonObj,
                                                                interfaceJsonObj);

                            consoleMsg.confirmMsg('nodeImport');
                        }else{
                            consoleMsg.errorMsg('invalidFileType');
                        }
                    };
                })(f);

                reader.readAsText(f);
            }
        };

        // export selected node
        // nodeType follows the original node name
        $scope.exportNode = function (){

            var nodeJson = JSON.stringify(generateCode.getChartViewModel().nodes[$scope.nodeIndex].data, null, 4);

            var procedureJson = JSON.stringify(generateCode.getDataList()[$scope.nodeIndex], null, 4);

            var interfaceJson = JSON.stringify(generateCode.getInterfaceList()[$scope.nodeIndex], null, 4)

            var nodeBlob = new Blob([nodeJson + '\n\n' +
                                    '//procedure json\n' + procedureJson + '\n\n' +
                                    '//interface json\n' + interfaceJson +'\n\n\n\n'],
                                    {type: "application/json"});

            $scope.nodeUrl = URL.createObjectURL(nodeBlob);
        };

        // save generated js file
        $scope.downloadJs = function(){

            var jsBlob = new Blob([generateCode.getJavascriptCode()], {type: "application/javascript"});

            $scope.jsUrl = URL.createObjectURL(jsBlob);
        };

        // save vidamo library file
        $scope.downloadLib = function(){
            $http.get("mobius/module.js")
                .success(
                function(response) {
                    var libBlob = new Blob([response], {type: "application/javascript"});
                    $scope.libUrl = URL.createObjectURL(libBlob);
                }
            );
        };

        $scope.toggleCheatSheet = function(){
            hotkeys.toggleCheatSheet();
        };
    }]);