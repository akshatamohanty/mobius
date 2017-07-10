mobius.controller('layoutCtrl',['$scope','$rootScope','hotkeys',
    function($scope,$rootScope,hotkeys) {

        //hotkeys.add({
        //    combo: 'ctrl+`',
        //    description: 'Toggle procedure panel',
        //    callback: function(event,hotkey) {
        //        $scope.$emit("editProcedure");
        //    }
        //});

        $scope.bodySize = document.getElementById('layout').offsetWidth;
        $scope.height = document.getElementById('layout').offsetHeight;

        // initial layout
        $scope.viewportSize = $scope.bodySize * 0.35;
        $scope.graphSize = $scope.bodySize * 0.25;
        $scope.procedureSize = $scope.bodySize * 0.20;
        $scope.toolkitSize = $scope.bodySize * 0.20;

        $scope.viewportWidth = $scope.viewportSize +'px';
        $scope.procedureWidth = $scope.procedureSize +'px';
        $scope.graphWidth = $scope.graphSize +'px';
        $scope.toolkitWidth = $scope.toolkitSize + 'px';

        $scope.consoleHeight = 150;
        $scope.graphHeight = ($scope.height - $scope.consoleHeight);
        //$scope.interfaceHeight = 0;

        // templates not in use
        $scope.showGraph = function(){
            if($scope.graphHeight !== $scope.height - 150){
                $scope.graphHeight = ($scope.height -  150);
                $scope.consoleHeight = 150;
            }else{
                $scope.graphHeight = ($scope.height - 150);
                $scope.consoleHeight = 150;
            }
        };

        // console and graph are tied together
        $scope.showConsole = function(){
            if($scope.consoleHeight !== $scope.height - 32){
                $scope.consoleHeight = $scope.height;
                $scope.graphHeight = 0;
            }else{
                $scope.consoleHeight = $scope.height;
                $scope.graphHeight = 0;
            }
        };

        var collapsedContainers = [];


        $scope.$on('ui.layout.resize', function(e, beforeContainer, afterContainer){
            
            $scope[beforeContainer.id + "Size"] = beforeContainer.size; 
            $scope[afterContainer.id + "Size"] = afterContainer.size; 

            if(beforeContainer.minSize == beforeContainer.size){
                console.log(beforeContainer.id);
                $scope[beforeContainer.id + "Size"] += 50;
                $scope[beforeContainer.id + "Width"] = $scope[beforeContainer.id + "Size"] + 'px';
            }
            

            if(afterContainer.minSize == afterContainer.size)
                console.log($scope[afterContainer.id + "Width"]);

        });

    }]);
