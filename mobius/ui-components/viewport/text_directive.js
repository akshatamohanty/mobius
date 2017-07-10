// text editor viewport example
mobius.directive('textViewportEditor', function() {
        return {
            restrict: 'A',
            scope: {
                viewModel: "="
            },
            template: "<div style='width: 100%; top:32px; left:0; bottom: 0; position: absolute;'>\
                            <textarea\
                                    style='width: 100%; height: 100%;'\
                                    text-viewport-editor\
                                    view-model='currentTextVersionGeom'>\
                            </textarea>\
                        </div>",
            controller: 'textCtrl',
            link: function (scope, elem, attr) {

                // Serialize the data model as json and update the textarea.
                var updateJson = function () {

                    if (scope.viewModel.geom) {
	                    var json = scope.viewModel.geom;
                        //var json = JSON.stringify(scope.viewModel.geom);

                        $(elem).val(JSON.stringify(json));
                    }
                };

                // First up, set the initial value of the textarea.
                updateJson();

                // Watch for changes in the data model and update the textarea whenever necessary.
                scope.$watch("viewModel.geom", updateJson);
            }
        }
});

mobius.controller('textCtrl',
    ['$scope','$rootScope', 'generateCode',
        function($scope,$rootScope,generateCode) {
            // geometry list for visualising after node selection
            $scope.outputGeom =[];
            $scope.currentTextVersionGeom = {geom:"Hi, No node is selected."};
            $scope.nodeIndex = '';

            $scope.$watch(function () { return generateCode.getOutputGeom(); }, function () {
                $scope.outputGeom = generateCode.getOutputGeom(); 
            });

            $scope.chartViewModel = generateCode.getChartViewModel();

            $scope.$watch(function(){return generateCode.getChartViewModel()},function(){
                $scope.chartViewModel = generateCode.getChartViewModel();
            });

            // listen to the graph, when a node is clicked, update text accordingly
            $rootScope.$on("nodeIndex", function(event, message) {
                if($scope.nodeIndex !== message && message !== undefined && message !== "port"){
                    $scope.nodeIndex = message;
                    displayText();
                }else if(message === undefined){
                    $scope.nodeIndex = message;
                }
                function displayText(){
                    var selectedNodes = $scope.chartViewModel.getSelectedNodes();
                    for(var i = 0; i < $scope.outputGeom.length; i++){
                        for(var j =0; j < selectedNodes.length; j++){
                            if($scope.outputGeom[i].name === selectedNodes[j].data.name){
                                for(var i = 0; i < $scope.outputGeom.length; i++){
                                    for(var j =0; j < selectedNodes.length; j++){
                                        if($scope.outputGeom[i].name === selectedNodes[j].data.name){
                                            $scope.currentTextVersionGeom.geom = $scope.outputGeom[i].geom;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }]);