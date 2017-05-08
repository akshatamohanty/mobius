mobius.directive('codeViewport', ['generateCode',  function(generateCode) {
    return {
        restrict: 'E',
        replace: true,
        scope: {}, 
        template: '<div style="height: 100%;margin: 0px;" \
	                     ui-ace="{ mode: \'javascript\',theme: \'tomorrow\'}"\
	                     ng-model="javascriptCode"\
	                     readonly="{{true}}">\
	                </div>',
	    link: function(scope, elem, attrs){
	        // generated javascript code
	        scope.javascriptCode = generateCode.getJavascriptCode();

	        scope.aceLoaded = function(_editor) {
	            // Options
	            _editor.setReadOnly(true);
	        };

	        scope.$watch(function () { return generateCode.getRawJSCode(); }, function (newValue, oldValue) {
	            if(newValue !== oldValue){
	                scope.javascriptCode = generateCode.getJavascriptCode();
	            }
	        },true);
	    }
	}
}]);