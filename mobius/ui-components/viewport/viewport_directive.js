mobius.directive('viewport', ['$compile', function($compile) {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'mobius/ui-components/viewport/viewport.html',
        link: function (scope, elem, attrs) {

        	scope.view = undefined;

        	// make this a service?
        	scope.viewports = [
        		{name: "3D Geometry", id: 0, directive: 'three-viewport'},
        		{name: "Topology", id: 1, directive: 'topo-viewport'},
        		{name: "Vizicities", id: 2, directive: 'vizi-viewport'},
        		{name: "Data Tables", id: 3, directive: 'data-viewport'},
        		{name: "Full Code", id: 4, directive: 'code-viewport'},
        		{name: "Text View", id: 5, directive: 'text-viewport'}
        	];

        	var view;
        	scope.changeView = function(viewport_id){
        		scope.selected = viewport_id;
        		
        		// remove view if already existing
        		if (scope.view !== undefined) {
                    scope.view.empty();
                    scope.view.remove();
                    scope.view.$$childScope().$destroy();
                    scope.view = undefined;
                }
        		
        		/*scope.view = $compile('<div ' + scope.viewports[scope.selected].directive + '></div>')(scope);
                elem.append(scope.view);*/

        		scope.activeView = scope.viewports[scope.selected].name;

        	}

        	scope.selected = 0;
        	scope.changeView(scope.selected);

    	}
    }
}]);