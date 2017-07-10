mobius.controller('codeCtrl',[
    '$scope',
    'generateCode',
    function($scope,generateCode) {

        // generated javascript code
        $scope.javascriptCode = generateCode.getJavascriptCode();

        $scope.aceLoaded = function(_editor) {
            // Options
            _editor.setReadOnly(true);
        };

        $scope.$watch(function () { return generateCode.getRawJSCode(); }, function (newValue, oldValue) {
            if(newValue !== oldValue){
                $scope.javascriptCode = generateCode.getJavascriptCode();
            }
        },true);
        
    }]);


// code-viewport-directive
mobius.directive('codeViewport', function() {
        return {
            restrict: 'A',
            template: "<div style='position: absolute; width: 100%; height: 100%;' ui-ace=\"{ mode: 'javascript', theme: 'tomorrow', onLoad: aceLoaded}\" ng-model='javascriptCode' readonly=true></div>",
            controller: 'codeCtrl' 
        }
});

