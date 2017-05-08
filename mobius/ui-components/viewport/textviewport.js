// text editor viewport example
mobius.directive('textViewport', ["$rootScope", "generateCode", function($rootScope,generateCode) {
        return {
            restrict: 'E',
            template:   '<div>\
                            <div style="width: 100%;top:32px;left:0;bottom: 0;position: absolute;">\
                                <textarea\
                                        style="width: 100%; height: 100%;">{{currentTextVersionGeom}}\
                                </textarea>\
                            </div>\
                        </div>',
            link: function (scope, elem, attr) {
                
                // geometry list for visualising after node selection
                scope.outputGeom =[];
                scope.currentTextVersionGeom = {geom:"Hi, No node is selected."};
                scope.nodeIndex = '';

                scope.$watch(function () { return generateCode.getOutputGeom(); }, function () {
                    scope.outputGeom = generateCode.getOutputGeom(); 
                });

                scope.chartViewModel = generateCode.getChartViewModel();

                scope.$watch(function(){return generateCode.getChartViewModel()},function(){
                    scope.chartViewModel = generateCode.getChartViewModel();
                });

                // listen to the graph, when a node is clicked, update text accordingly
                $rootScope.$on("nodeIndex", function(event, message) {

                    console.log(" i detected and i am text");

                    if(scope.nodeIndex !== message && message !== undefined && message !== "port"){
                        scope.nodeIndex = message;
                        displayText();
                        updateJson();
                    }else if(message === undefined){
                        scope.nodeIndex = message;
                    }

                    function displayText(){
                        var selectedNodes = scope.chartViewModel.getSelectedNodes();
                        for(var i = 0; i < scope.outputGeom.length; i++){
                            for(var j =0; j < selectedNodes.length; j++){
                                if(scope.outputGeom[i].name === selectedNodes[j].data.name){
                                    for(var i = 0; i < scope.outputGeom.length; i++){
                                        for(var j =0; j < selectedNodes.length; j++){
                                            if(scope.outputGeom[i].name === selectedNodes[j].data.name){
                                                scope.currentTextVersionGeom.geom = scope.outputGeom[i].geom;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                });

                // Serialize the data model as json and update the textarea.
                var updateJson = function () {
                    if (scope.currentTextVersionGeom.geom) {
                        var json = scope.currentTextVersionGeom.geom;
                        //var json = JSON.stringify(scope.viewModel.geom);

                        $(elem).val(json);
                    }
                };

                // First up, set the initial value of the textarea.
                updateJson();

            }
        }
}]);

