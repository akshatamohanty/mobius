mobius.directive('viewport', ['generateCode', '$rootScope', '$compile', function(generateCode, $rootScope, $compile) {
    return {
        restrict: 'E',
        replace: true,
        scope: {}, 
        template: '<div><div class="doormat" style="z-index: 10 !important;">\
	                    <div>{{viewport.name + " View"}} </div>\
	                    <div dropdown on-toggle="toggled(open)" class="menu-left">\
	                    	<button class="button viewport-menu-button" dropdown-toggle\
	                            style="width: 28px !important;" title="set viewport">\
	                            <i class="fa fa-eye fa-lg"></i>\
	                        </button>\
	                        <ul class="dropdown-menu" style="right: 2px!important;top:2px">\
	                            <li ng-repeat="v in viewports"><a href="#" ng-click="setViewport($index)">{{v.name}}</a></li>\
	                        </ul>\
	                    </div>\
	                </div>\
	                <div id="vp-container" style="height: 95vh;"><!-- fix style--></div></div>',
        link: function (scope, elem, attrs) {

        	scope.viewportName = "viewport";

        	scope.viewports = [{ name: "Geometry", dir: "three-viewport" },
        					   { name: "Topology", dir: "topo-viewport" },
        					   { name: "Data", dir: "data-viewport" },
        					   { name: "Code", dir: "code-viewport" },
        					   { name: "Text", dir: "text-viewport" },
        					   { name: "Vizicities", dir: "vizi-viewport" }];

        	scope.index = 0;
            scope.viewport = scope.viewports[scope.index];

        	scope.setViewport = function(index){

                if(index == scope.index)
                    return;

                scope.index = index;
        		scope.viewport = scope.viewports[index];
        		$('#vp-container').empty();
        		$('#vp-container').append($compile( "<" + scope.viewports[index].dir + ">" + "</" + scope.viewports[index].dir + ">" )( scope ));
        	}

			$rootScope.$on('runNewScene', function(){
				// do something to refresh all views
			});

        }
    }
}]);
