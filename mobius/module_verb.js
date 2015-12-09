/*
 *	Module, with verb.js
 */
 
var MOBIUS = ( function (mod){	

	/*
	 *
	 * General Functions,
	 * Input - according to requirements; Output - non-geometric primitives
	 *
	 */

	//
	//
	// frame functions
	//
	//
	mod.frm = {}; 
	
	mod.frm.byXYPoints = function(origin, xPoint, yPoint){
	    
	    // how to you make sure the two axes are perpendicular
		var xaxis = [xPoint[0]-origin[0], xPoint[1]-origin[1], xPoint[2]-origin[2]];
		var yaxis = [yPoint[0]-origin[0], yPoint[1]-origin[1], yPoint[2]-origin[2]];

		if( mod.mtx.dot(xaxis, yaxis) != 0)
			mod.msc.print("Axes are not perpendicular");

		return new mObj_frame(origin, xaxis, yaxis, undefined);

	};
	        
	mod.frm.byXZPoints = function(origin, xPoint, zPoint){		

		var xaxis = [xPoint[0]-origin[0], xPoint[1]-origin[1], xPoint[2]-origin[2]];
		var zaxis = [zPoint[0]-origin[0], zPoint[1]-origin[1], zPoint[2]-origin[2]];		

		if( mod.mtx.dot(xaxis, zaxis) != 0)
			mod.msc.print("Axes are not perpendicular");

		return new mObj_frame(origin, xaxis, undefined, zaxis);

	};

	mod.frm.byYZPoints = function(origin, yPoint, zPoint){

		var yaxis = [yPoint[0]-origin[0], yPoint[1]-origin[1], yPoint[2]-origin[2]];
		var zaxis = [zPoint[0]-origin[0], zPoint[1]-origin[1], zPoint[2]-origin[2]];		

		if( mod.mtx.dot(zaxis, yaxis) != 0)
			mod.msc.print("Axes are not perpendicular");

		return new mObj_frame(origin, undefined, yaxis, zaxis)
	
	};

	mod.frm.byXYAxes = function(origin, xAxis, yAxis){

		if( mod.mtx.dot(xAxis, yAxis) != 0)
			mod.msc.print("Axes are not perpendicular");

		return new mObj_frame(origin, xAxis, yAxis, undefined);

	};

	mod.frm.byXZAxes = function(origin, xAxis, zAxis){

		if( mod.mtx.dot(xAxis, zAxis) != 0)
			mod.msc.print("Axes are not perpendicular");

		return new mObj_frame(origin, xAxis, undefined, zAxis);

	};

	mod.frm.byYZAxes = function(origin, yAxis, zAxis){

		if( mod.mtx.dot(zAxis, yAxis) != 0)
			mod.msc.print("Axes are not perpendicular");

		return new mObj_frame(origin, undefined, yAxis, zAxis);

	};

	//
	//
	// solid functions
	//
	//
	mod.sld = {};

	/**
	 * Returns a mobiusobject containing a solid (array of surfaces)
	 * @param {mobius surface} surface - Mobius Surface Object to be extruded
	 * @param {array} extrusion vector - Direction of extrusion in [x, y, z] format
	 * @returns {mobiusobject}  - Solid
	 */
	mod.sld.byExtrusion = function(surface, frame, xDistance, yDistance, zDistance){

		var bottomSurface = surface;
		var topSurface = MOBIUS.makeCopy( bottomSurface );
		MOBIUS.shiftObject(topSurface, frame, xDistance, yDistance, zDistance, false);

		var solid = [ bottomSurface, topSurface ];
		// join boundary points of the two surfaces
		var edges_b = bottomSurface.getGeometry().boundaries(); 
		var edges_t = bottomSurface.getGeometry().boundaries(); 
		for(var e=0; e < edges_b.length; e++ ){
			var edge_b = edges_b[e];
			var edge_t  = edges_t[e];
			var extrusionVector = verb.core.Mat.sub(MOBIUS.object.getCentre(edge_t) - MOBIUS.object.getCentre(edge_b));
			var srf = new mObj_geom_Surface(  new verb.geom.ExtrudedSurface( edge_b, extrusionVector ) );
			solid.push(srf);
		}

		return new mObj_geom_Solid( solid );

	};

	mod.sld.bySurfaces = function (listOfSurfaces){
		return new mObj_geom_Solid( listOfSurfaces );
	};

	//
	//
	// surface functions
	//
	//
	mod.srf = {};

	/**
	 * Returns a mobiusobject containing a NURBS Surface
	 * @param {int} degreeU - DegreeU of the Surface
	 * @param {int} degreeV - DegreeV of the Surface
	 * @param {array} knotsU - Knots in U Direction
	 * @param {array} knotsV - Knots in V Direction
	 * @param {array} controlPoints - Array of points / vertices through which the curve passes ( [[x1, y1, z1], [x2, y2, z2], [x3, y3, z3], [x4, y4, z4], ...] )
	 * @param {array} weights - Weights
	 * @returns {mobiusobject}  - NURBS Surface
	 */
	mod.srf.nurbsByData = function ( degreeU,degreeV,knotsU,knotsV,controlPoints,weights ){
		
		var controlPoints = controlPoints.map( function(p){ 
								
								if(p.getGeometry != undefined) 
									return p.getGeometry(); 
								else 
									return p; } )

		return new mObj_geom_Surface( new verb.geom.NurbsSurface.byKnotsControlPointsWeights( degreeU,degreeV,knotsU,knotsV,controlPoints,weights ) ) ;
	};


	/**
	 * Returns a mobiusobject containing a NURBS Surface
	 * @param {array} point - Corner points in [x,y,z] format / Vertex Objects
	 * @returns {mobiusobject}  - NURBS Surface
	 */
	mod.srf.nurbsByCorners = function ( cornerpoints ){

		var point0 = cornerpoints[0];
		var point1 = cornerpoints[1];
		var point2 = cornerpoints[2];
		var point3 = cornerpoints[3];

		if( point0.getGeometry != undefined )
			point0 = point0.getGeometry();
		if( point1.getGeometry != undefined )
			point1 = point1.getGeometry();
		if( point2.getGeometry != undefined )
			point2 = point2.getGeometry();
		if( point3.getGeometry != undefined )
			point3 = point3.getGeometry();

		return new mObj_geom_Surface( new verb.geom.NurbsSurface.byCorners ( point0, point1, point2, point3 ) ) ;
	};

	/**
	 * Returns a mobiusobject containing a NURBS Surface
	 * @param {mobiusobject} mObjProfile - Array of mobiusobject with NURBS Curve Geometry
	 * @param {array} direction - Direction of Sweep in [x,y,z] format	 
	 * @returns {mobiusobject}  - NURBS Surface
	 */
	mod.srf.nurbsByExtrusion  = function(curve, direction){

		var profile = curve.getGeometry();
		return new mObj_geom_Surface(  new verb.geom.ExtrudedSurface( profile, direction ) ) ;

	};

	/**
	 * Returns a mobiusobject containing a NURBS Surface
	 * @param {array} listOfCurves - Array of mobiusobject with NURBS Curve Geometry
	 * @param {int} degree - Degree of the Surface
	 * @returns {mobiusobject}  - NURBS Surface
	 */
	mod.srf.nurbsByLoft = function(listOfCurves, degree){

		var deg = degree || 3;
		var curves = []; 
		
		for(var c=0; c<listOfCurves.length; c++)
			curves.push(listOfCurves[c].getGeometry()); 

		return new mObj_geom_Surface( new verb.geom.NurbsSurface.byLoftingCurves( curves, deg ) ) ;
		
	};

	/**
	 * Returns a mobiusobject containing a NURBS Surface
	 * @param {mobiusobject} mObj - mobiusobject with NURBS Curve Geometry
	 * @param {array} centerPoint - CentrePoint in [x,y,z] format or Vertex Object
	 * @param {array} axis - Axis of revolution in [x,y,z] format	 
	 * @param {float} angle - Angle of revolution in radians
	 * @returns {mobiusobject}  - NURBS Surface
	 */
	mod.srf.nurbsByRevolution = function(sectionCurve, frame, angle){

		var profile = sectionCurve.getGeometry();

		if (frame == undefined)
			return new mObj_geom_Surface( new verb.geom.RevolvedSurface( profile, [0,0,0], [0,1,0], angle ) ) ;
		else
			return new mObj_geom_Surface( new verb.geom.RevolvedSurface( profile, frame.origin, frame.zaxis, angle ) ) ;

	};

	/**
	 * Returns a mobiusobject containing a NURBS Surface
	 * @param {mobiusobject} mObj - mobiusobject with NURBS Curve Geometry
	 * @param {mobiusobject} mObj - mobiusobject with NURBS Curve Geometry
	 * @returns {mobiusobject}  - NURBS Surface
	 */
	mod.srf.nurbsBySweep = function( sectionCurve, railCurve ){
		
		var profile = sectionCurve.getGeometry();
		var rail = railCurve.getGeometry();
		
		return new mObj_geom_Surface( new verb.geom.SweptSurface ( profile, rail ) ) ;
		
	};

	/**
	 * Returns a mobiusobject containing a NURBS Surface
	 * @param {array} centrePoint - CentrePoint in [x,y,z] format or Vertex Object	 
	 * @param {float} radius - Radius of the Sphere 	 
	 * @returns {mobiusobject}  - NURBS Surface
	 */
	mod.srf.nurbsSphere = function(frame, radius){
					
		var sphere = new verb.geom.SphericalSurface( [0,0,0], radius );
		sphere = sphere.transform( frame.matrix );

		return new mObj_geom_Surface( sphere );

	};

	/**
	 * Returns a mobiusobject containing a NURBS Surface
	 * @param {array} axis - Axis Direction of the cone in [x,y,z] format
	 * @param {array} xaxis - Direction of x-axis of cone in [x,y,z] format
	 * @param {float} base - Radius of cone base
	 * @param {float} height - Height of the cone
	 * @param {float} radius - Radius of cone
	 * @returns {mobiusobject}  - NURBS Surface
	 */
	mod.srf.nurbsCone = function(frame, height, radius1, radius2){

		var profile = MOBIUS.crv.line([radius1, 0, 0], [radius2, height, 0]);

		var surface = MOBIUS.srf.nurbsByRevolution( profile, undefined, 2*Math.PI);
		surface.setGeometry(  surface.getGeometry().transform( frame.matrix ) );

		return surface;

	};

	mod.srf.nurbsPipe = function(centreCurve, radius){

	};

	mod.srf.uvGridByNumber = function(surface, uSegments, vSegments, method){

	};

	mod.srf.uvGridByDistance = function(surface, uDistance, vDistance, method){

	};

	/**
	 * Returns a point or list of points on the surface at the given parameter values
	 * @param {mobiusobject} surface - mobiusobject with NURBS Surface
	 * @param {int} u - Parameter in u-direction
	 * @param {int} v - Parameter in v-direction
	 * @returns {array} point [x,y,z]
	 */
	mod.srf.getPoints = function(surface, uvList){
		
		var srf = surface.getGeometry();		

		if(uvList.constructor.name == "Array"){

			var points = uvList.map( function(p){
				return new mobj_geom_Vertex( srf.point( p[0], p[1] ) );
			})
			
			return points;
		}
		else
			return new mobj_geom_Vertex( srf.point( u, v ) );

	};

	mod.srf.getFrames = function( surface, uvList ){

	};

	mod.srf.getNormals = function( surface, uvList ){

	};

	mod.srf.getTangents = function( surface, uvList ){

	}; 
 
	mod.srf.getIsoCurves = function( surface, uvList ){

	};

	/**
	 * Subdivides a surface into smaller surfaces
	 * @param {mobiusobject} surface - mobiusobject with NURBS Surface
	 * @param {int} ugrid - Divisions in u-direction
	 * @param {int} vgrid - Divisions in v-direction
	 * @returns {array} Array of mobiusobjects with NURBS Surfaces
	 */
	mod.srf.divide = function(surface, uvGrid, method){
		
		var srf = surface.getGeometry(); 
		
		var div_surfaces = [], 
		gridPoints = [];
		var uincr = 1/ugrid;
		var vincr = 1/vgrid;

		//for uv lines
		for(var i=0; i <= ugrid; i++){
			for(var seg=0; seg <= vgrid; seg++)
				gridPoints.push(srf.point(i*uincr, seg*vincr)); 
		}
		// creation of polygons from the gridPoints
		for(var i=0; i< gridPoints.length-vgrid-2; i++){
			if((i+vgrid+2)%(vgrid+1) != 0 || i==0){
				// construction of the verbs four point surface
				var mbObj =  new mObj_geom_Surface( new verb.geom.NurbsSurface.byCorners(gridPoints[i], gridPoints[i+1],  gridPoints[i+vgrid+2], gridPoints[i+vgrid+1]) );
				div_surfaces.push(mbObj); 
			}
		}
		return new mObj_geom_Solid( div_surfaces );

	};

	mod.srf.carve = function(surface, uv1, uv2, hole){

	};


	//
	//
	// Curves
	//
	//
	mod.crv = {};

	/**
	 * Returns a mobiusobject containing a NURBS Curve
	 * @param {int} degree - Degree of the Curve
	 * @param {array} knots - Knots
	 * @param {array} controlPoints - Array of points / vertices through which the curve passes ( [[x1, y1, z1], [x2, y2, z2], [x3, y3, z3], [x4, y4, z4], ...] )
	 * @param {array} weights - Weights
	 * @returns {mobiusobject}  - NURBS Curve
	 */
	mod.crv.nurbsByData = function( degree, knots, controlPoints, weights ){

		controlPoints = controlPoints.map( function(p){ 
								
								if(p.getGeometry != undefined) 
									return p.getGeometry(); 
								else 
									return p; } )

		return new mObj_geom_Curve( new verb.geom.NurbsCurve.byKnotsControlPointsWeights( degree, knots, controlPoints, weights ) ) ;

	};


	/**
	 * Returns a mobiusobject containing a NURBS Curve
	 * @param {array} points - Array of points / vertices through which the curve passes ( [[x1, y1, z1], [x2, y2, z2], [x3, y3, z3], [x4, y4, z4], ...] )
	 * @param {int} degree - Degree of the Curve
	 * @returns {mobiusobject}  - NURBS Curve
	 */
	mod.crv.nurbsByPoints = function( points, degree ){

		points = points.map( function(p){ 
								
								if(p.getGeometry != undefined) 
									return p.getGeometry(); 
								else 
									return p; } )

		return new mObj_geom_Curve( new verb.geom.NurbsCurve.byPoints( points, degree ) ) ;
	};

	/**
	 * Returns a mobiusobject containing a NURBS Curve
	 * @param {array} points - Array of Control Points for the Bezier Curve ( [[x1, y1, z1], [x2, y2, z2], [x3, y3, z3], [x4, y4, z4], ...] or Vertices )
	 * @param {array} weights - Weights
	 * @returns {mobiusobject}  - NURBS Curve
	 */
	mod.crv.bezierByPoints = function(points, weights) {

		points = points.map( function(p){ 
								
								if(p.getGeometry != undefined) 
									return p.getGeometry(); 
								else 
									return p; } );

		return new mObj_geom_Curve( new verb.geom.BezierCurve( points, weights ) ) ;
	};


	/**
	 * Returns a mobiusobject containing a NURBS Curve
	 * @param {array} centerPoint - Centre point of the Arc in [x,y,z] format or Vertex Object
	 * @param {array} xaxis - Direction of X-Axis of the Arc in [x,y,z] format 
	 * @param {array} yaxis - Direction of Y-Axis of the Arc in [x,y,z] format 
	 * @param {array} radius - Radius of the Arc
	 * @param {float} minAngle - Minimum Angle in Radians
	 * @param {float} maxAngle - Maximum Angle in Radians
	 * @returns {mobiusobject}  - NURBS Curve
	 */
	mod.crv.arc = function(frame, radius, minAngle, maxAngle){

		var xaxis = MOBIUS.vec.resize( frame.xaxis, xRadius );
		var yaxis = MOBIUS.vec.resize( frame.yaxis, yRadius );

		return new mObj_geom_Curve( new verb.geom.Arc( frame.origin, xaxis, yaxis, radius, minAngle, maxAngle) ) ;

	};

	mod.crv.arcByPointsSOE = function(startPoint, onArcPoint, endPoint){

	};

	mod.crv.arcByPointsCSE = function(centrePoint, startPoint, endPoint){

	};

	/**
	 * Returns a mobiusobject containing a NURBS Curve
	 * @param {array} centerPoint - Centre point of the Circle in [x,y,z] format or Vertex Object
	 * @param {array} xaxis - Direction of X-Axis of the Circle in [x,y,z] format 
	 * @param {array} yaxis - Direction of Y-Axis of the Circle in [x,y,z] format 
	 * @param {array} radius - Radius of the Arc
	 * @returns {mobiusobject}  - NURBS Curve
	 */
	mod.crv.circleBoundary = function(frame, radius){

		var xaxis = MOBIUS.vec.resize( frame.xaxis, xRadius );
		var yaxis = MOBIUS.vec.resize( frame.yaxis, yRadius );

		return new mObj_geom_Curve( new verb.geom.Circle( frame.origin, xaxis, yaxis, radius ) ) 
	};

	/**
	 * Returns a mobiusobject containing a NURBS Curve
	 * @param {array} centerPoint - Centre point of the Ellipse in [x,y,z] formats or Vertex Object
	 * @param {array} xaxis - Direction of X-Axis of the Ellipse in [x,y,z] format; Length of this vector determines length of x-Axis of ellipse;
	 * @param {array} yaxis - Direction of Y-Axis of the Ellipse in [x,y,z] format; Length of this vector determines length of y-Axis of ellipse;
	 * @returns {mobiusobject}  - NURBS Curve
	 */
	mod.crv.ellipse = function(frame, xRadius, yRadius) {

		var xaxis = MOBIUS.vec.resize( frame.xaxis, xRadius );
		var yaxis = MOBIUS.vec.resize( frame.yaxis, yRadius );

		return new mObj_geom_Curve( new verb.geom.Ellipse( frame.origin, xaxis, yaxis ) ); 
		
	};

	/**
	 * Returns a mobiusobject containing a NURBS Curve
	 * @param {array} centerPoint - Centre point of the EllipseArc in [x,y,z] formats or Vertex Object
	 * @param {array} xaxis - Direction of X-Axis of the EllipseArc in [x,y,z] format; Length of this vector determines length of x-Axis of ellipse;
	 * @param {array} yaxis - Direction of Y-Axis of the EllipseArc in [x,y,z] format; Length of this vector determines length of y-Axis of ellipse;
	 * @param {float} minAngle - Minimum Angle in Radians
	 * @param {float} maxAngle - Maximum Angle in Radians
	 * @returns {mobiusobject}  - NURBS Curve
	 */
	mod.crv.ellipseArc = function(frame, xRadius, yRadius, minAngle, maxAngle){

		var xaxis = MOBIUS.vec.resize( frame.xaxis, xRadius );
		var yaxis = MOBIUS.vec.resize( frame.yaxis, yRadius );

		return new mObj_geom_Curve( new verb.geom.EllipseArc( frame.origin, xaxis, yaxis, minAngle, maxAngle ) ) 
	};


	/**
	 * Returns a Mobius Curve object
	 * @param {array} startPoint - Starting point of the line in [x,y,z] format or Vertex Object
	 * @param {array} endPoint - Ending point of the line in [x,y,z] format	or Vertex Object
	 * @returns {MobiusObject}  - NURBS Curve
	 */
	mod.crv.line = function(startPoint, endPoint){

		if( startPoint.getGeometry != undefined )
			startPoint = startPoint.getGeometry();
		if( endPoint.getGeometry != undefined )
			endPoint = endPoint.getGeometry();
	
		return new mObj_geom_Curve( new verb.geom.Line(startPoint, endPoint) );

	};

	// what's method?
	mod.crv.tListByNumber = function(curve, numPoints, method){


	};

	mod.crv.tListByDistance = function(curve, distance, method){


	};

	mod.crv.getPoints = function(curve, tList){
		
		var crv = curve.getGeometry();		

		if(tList.constructor.name == "Array"){

			var points = tList.map( function( t ){
				return new mobj_geom_Vertex( curve.point( t ) );
			})
			
			return points;
		}
		else
			return new mobj_geom_Vertex( curve.point( t ) );
	
	};

	mod.crv.getFrames = function(curve, tList, upVector){

		var frames = tList.map( function(t){
			return new mObj_frame( curve.point(t), curve.tangent(t), undefined, upVector );
		})

		return frames;

	};
	
	mod.crv.getTangents = function(curve, tList){
	
		var crv = curve.getGeometry();		

		if(tList.constructor.name == "Array"){

			var points = tList.map( function( t ){
				return new mobj_geom_Vertex( curve.tangent( t ) );
			})
			
			return points;
		}
		else
			return new mobj_geom_Vertex( curve.tangent( t ) );

	};

	mod.crv.carve = function(curve, t1, t2, hole){

	}; 

	mod.crv.divide = function(curve, tList){

		var tPoints = tList.map( function(t){
			return curve.point(t);
		})

		var result = [];
		var crv = curve;
		for(var t=0; t<tList.length; t++){

			var tPoint = curve.point(t);

			var crvs = crv.split( crv.param(tPoint) );
			
			result.push(crvs[0]);
			crv = crvs[1];
		}

		return result;

	};

	mod.crv.convertToPolyline = function(curve, tList){

		var plinePoints = []
		for(var p=0; p<tList.length; p++){
			plinePoints.push(curve.point(tList[p]));
		}

		return MOBIUS.crv.nurbsByPoints( plinePoints, 1, undefined);

	};

	//
	//
	// Points
	//
	//
	mod.pnt = {};

	mod.pnt.byCoords = function(x, y, z){
		return [x, y, z];
	}

	/**
	 * Returns the mid-point between two points
	 * @param {point / vertex} point - [x, y , z] or Vertex
	 * @returns {float} Distance 
	 */
	mod.pnt.midPoint = function(point1, point2){

		if( point1.getGeometry != undefined )
			point1 = point1.getGeometry();
		if( point2.getGeometry != undefined )
			point2 = point2.getGeometry();

		return [ (point1[0] + point2[0])/2, (point1[1] + point2[1])/2, (point1[2] + point2[2])/2 ];
	};	


	/**
	 * Returns the distance between two points or vertices
	 * @param {point / vertex} point - [x, y, z] or vertex object
	 * @returns {float} Distance 
	 */
	mod.pnt.distance = function(point1, point2){

		if( point1.getGeometry != undefined )
			point1 = point1.getGeometry();
		if( point2.getGeometry != undefined )
			point2 = point2.getGeometry();
				 
		var deltaX, deltaY, deltaZ;

		deltaX = point1[0] - point2[0];
		deltaY = point1[1] - point2[1];
		deltaZ = point1[2] - point2[2];

		var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
		return distance;
	};

	//
	//
	//	Vector functions
	//
	//
	mod.vec= {};

	mod.vec.byCoords = function(x, y, z){
		return [x, y, z];
	};

	/**
	 * Computes angle between two vectors
	 * @param {array} vector1  - Vector 1 in [x, y, z] format
	 * @param {array} vector2  - Vector 2 in [x, y, z] format
	 * @returns {float} radians
	 */
	mod.vec.angle = function(vector1, vector2){
		var dotP = MOBIUS.mtx.dot( vector1,  vector2 );
		var cos_t = dotP / (MOBIUS.vec.length( vector1 ) * MOBIUS.vec.length( vector2 ) );
		return Math.cosh(cos_t);
	};

	/**
	 * Computes length of the vector
	 * @param {array} vector  - Vector in [x, y, z] format
	 * @returns {float} length
	 */
	mod.vec.length = function(vector){
		return Math.sqrt( vector[0]*vector[0] + vector[1]*vector[1] + vector[2]*vector[2] );
	};

	/**
	 * Makes a copy of the vector and sets the length
	 * @param {float / int } factor - Value to be multiplied
	 * @param {array} vector  - Vector in [x, y, z] format 
	 * @returns {array} 
	 */
	mod.vec.resize = function(vector, length){

		var unitV = verb.core.Vec.normalized( vector );
		return [ length*unitV[0], length*unitV[1], length*unitV[2] ] ;
	};


	/**
	 * Makes a copy of the vector and sets the length
	 * @param {float / int } factor - Value to be multiplied
	 * @param {array} vector  - Vector in [x, y, z] format 
	 * @returns {array} 
	 */
	mod.vec.scale = function(vector, factor){

		return [ factor*vector[0], factor*vector[1], factor*vector[2] ] ;
	}


	/**
	 * Computes unit vector
	 * @param {array} vector  - Vector in [x, y, z] format
	 * @returns {array} Unit Vector
	 */
	mod.vec.normalize = function(vector){
		return verb.core.Vec.normalized( vector );
	}


	//
	//
	//	Objects
	//
	//
	mod.obj = {};

	/**
	 * Creates a unique copy of the object with the same geometry, transformations, material and data at the same location
	 * @param {mobiusobject} mObj - Object to be cloned
	 * @returns {mobiusobject} Cloned object
	 */
	mod.obj.copy = function( object ){

		if( object.getGeometry == undefined ){
			console.log("Non-Mobius passed to copy function");
			return object;
		}

		// fix: make this into one line code with 'eval'
		var newcopy;
		if(object instanceof mObj_geom_Vertex)
			newcopy = new mObj_geom_Vertex( object.getGeometry() );
		else if(object instanceof mObj_geom_Curve)
			newcopy = new mObj_geom_Curve( object.getGeometry() );
		else if(object instanceof mObj_geom_Surface)
			newcopy = new mObj_geom_Surface( object.getGeometry() );
		else if(object instanceof mObj_geom_Solid)
			newcopy = new mObj_geom_Solid( object.getGeometry() );

		newcopy.setData( object.getData() );
		newcopy.setMaterial( object.getMaterial() );	

		return newcopy;
		
	};

	/**
	 * Adds material to an object
	 * @param {mobiusobject} obj - Object to which material is to be added
	 * @param {String} material_type - "MeshBasicMaterial", "MeshNormalMaterial", "MeshLambertMaterial", "LineBasicMaterial" etc... 
	 * @param {boolean} wireframe - 'True' if wireframe is required. 
	 * @param {hexCode} color - Hex Code of the color
	 * @param {boolean} transparent - 'True' if transparency is required. 
	 * @returns null
	 */
	mod.obj.addMaterial = function(obj, material_type, wireframe, color_hex, transparent){
		var option = {	
			wireframe: wireframe,
			color: color_hex,
			transparent: transparent,
			side: THREE.DoubleSide
		};
		var material = new THREE[material_type](option);
		
		obj.setMaterial(material);

		return obj;
	};

	/**
	 * Adds data to an object
	 * @param {mobiusobject} obj - Object to which data is to be added
	 * @param {String} dataName - Name of the property
	 * @param {String / int / object ... } dataValue - Value of the property
	 * @returns null
	 */
	mod.obj.addData = function(obj, dataName, dataValue){

		// decide on topology heirarchy also - if edge gets a property, do the vertices also get the same property?
		if(obj.constructor === Array){
			for(var i=0; i<obj.length; i++){
				if(obj[i].getData() == undefined)
					var new_data = {};
					new_data[dataName] = dataValue;
					obj[i].setData( new_data );
			}
		} else{
			if(obj.getData() == undefined)
				var new_data = {};
				new_data[dataName] = dataValue;
				obj.setData( new_data );
		}
	};

	/**
	 * Returns the centre of a NURBS Curve, NURBS Surface or geometry for which centre is defined
	 * @param {array} mObj - Mobius object
	 * @returns {array} Point - [x, y, z]
	 */
	mod.obj.getCentre = function(object){
		//calculate centre based on what kind of object
		var geometry = object.getGeometry();  

		if(geometry.center != undefined)
			return geometry.center();
		else if(geometry instanceof verb.geom.NurbsCurve)
			return geometry.point(0.5);
		else if(geometry instanceof verb.geom.NurbsSurface)
			return geometry.point(0.5, 0.5);
		else
			return "Invalid Input"
	};


	//
	//
	//	Transformation functions
	//
	//
	mod.trn = {};

	/**
	 * Reflects the object about the XY plane of the frame
	 * @param {mobiusobject} mObj - Object to be reflected
	 * @param {array} planeABC - Parameters A, B, C, D from the plane equation (Ax+By+Cz-D=0) as an array  
	 * @param {radians} angle - Angle (in Radians) about y-axis
	 * @returns Null
	 */
	mod.trn.reflect = function(object, frame, copy){

		if (object instanceof mObj_geom_Solid)
			object = object.getGeometry();

		if (object instanceof Array){

			var newobject = [];
			
			for(var obj=0; obj < object.length; obj++)
				newobject.push(MOBIUS.trn.reflect( object, frame, copy ));	
			
			return newobject;
		}

		if( copy )
			object = MOBIUS.obj.copy( object );

		var geom = object.getGeometry();

		var trnMat = [ [ 1, 0, 0, 0],
						[ 0, 1, 0, 0],
							[ 0, 0, -1, 0],
								[0, 0, 0, 1]
					];
						
		if( frame != undefined ){
			geom = geom.transform( frame.toLocal() );
			geom = geom.transform( trnMat ); 
			geom = geom.transform( frame.toGlobal() );
		}
		else
			geom = geom.transform( trnMat );
		
		object.setGeometry( geom ); 

		return object;
	
	};


	/**
	 * Rotates the object about the axes of the frame. 
	 * @param {mobiusobject} mObj - Object to be rotated
	 * @param {array} axis - Axis in [x, y, z] format
	 * @param {radians} angle - Angle (in Radians) about y-axis
	 * @returns Null
	 */
	mod.trn.rotate = function(object, frame, angleX, angleY, angleZ, copy){

		if (object instanceof mObj_geom_Solid)
			object = object.getGeometry();

		if (object instanceof Array){

			var newobject = [];
			
			for(var obj=0; obj < object.length; obj++)
				newobject.push(MOBIUS.trn.rotate( object, frame, angleX, angleY, angleZ, copy ));	
			
			return newobject;
		}

		if( copy )
			object = MOBIUS.obj.copy( object );

		var geom = object.getGeometry();

	    // zaxis [0,0,1]
	    var cost = Math.cos( angleZ );
	    var sint = Math.sin( angleZ );
	    var mat_rot_z = [ [ cost, -sint, 0, 0 ],
	                            [ sint, cost, 0, 0 ],
	                                [ 0, 0, 1, 0 ],
	                                    [ 0, 0, 0, 1 ]
	                        ];

	    // yaxis [0,1,0]
	    var cost = Math.cos( angleY );
	    var sint = Math.sin( angleY );
	    var mat_rot_y = [ [ cost, 0, sint, 0 ],
	                            [ 0,  1,  0, 0 ],
	                                [ -sint, 0, cost, 0],
	                                    [ 0, 0, 0, 1 ]
	                        ];

	    // xaxis [1,0,0]
	    var cost = Math.cos( angleX );
	    var sint = Math.sin( angleX );
	    var mat_rot_x = [ [ 1, 0, 0, 0 ],
	                            [ 0,  cost, -sint, 0 ],
	                                [ -sint,  sint, cost, 0 ],
	                                    [ 0, 0, 0, 1 ]
	                        ];
		
		if( frame != undefined ){
			geom = geom.transform( frame.toLocal() );
			
			geom = geom.transform( mat_rot_z );
			geom = geom.transform( mat_rot_y );
			geom = geom.transform( mat_rot_x );
			
			geom = geom.transform( frame.toGlobal() );
		}
		else
			geom = geom.transform( trnMat );
		
		object.setGeometry( geom ); 

		return object;
	
	};


	/**
	 * Scales the object along different axes
	 * @param {mobiusobject} mObj - Object to be scaled
	 * @param {float} scaleX - Scaling-factor along the x-direction; Should be set to '1' if no scaling is required.
	 * @param {float} scaleY - Scaling-factor along the y-direction; Should be set to '1' if no scaling is required.
	 * @param {float} scaleZ - Scaling-factor along the z-direction; Should be set to '1' if no scaling is required.
	 * @returns Null
	 */
	mod.trn.scale = function(object, frame, scaleX, scaleY, scaleZ, copy) {

		if (object instanceof mObj_geom_Solid)
			object = object.getGeometry();

		if (object instanceof Array){

			var newobject = [];
			
			for(var obj=0; obj < object.length; obj++)
				newobject.push(MOBIUS.trn.scale(object, frame, scaleX, scaleY, scaleZ, copy));	
			
			return newobject;
		}

		if( copy )
			object = MOBIUS.obj.copy( object );

		var geom = object.getGeometry();
			
		var trnMat = [ [ scaleX, 0, 0, 0 ],
						[ 0, scaleY, 0, 0],
							[ 0, 0, scaleZ, 0 ],
								[ 0, 0, 0, 1 ]
					];
			
		if( frame != undefined ){
			geom = geom.transform( frame.toLocal() );
			geom = geom.transform( trnMat );
			geom = geom.transform( frame.toGlobal() );
		}
		else
			geom = geom.transform( trnMat );
		
		object.setGeometry( geom ); 

		return object;


	};

	/**
	 * Shifts the object relative to its current position
	 * @param {mobiusobject} mObj - Object to be moved
	 * @param {float} shiftX - Distance to be moved in x-direction
	 * @param {float} shiftY - Distance to be moved in y-direction
	 * @param {float} shiftZ - Distance to be moved in z-direction
	 * @returns Null
	 */
	mod.trn.shift = function(object, frame, shiftX, shiftY, shiftZ, copy){

		if (object instanceof mObj_geom_Solid)
			object = object.getGeometry();

		if (object instanceof Array){

			var newobject = [];
			
			for(var obj=0; obj < object.length; obj++)
				newobject.push(MOBIUS.trn.shift( object[obj], shiftX, shiftY, shiftZ, copy ));	
			
			return newobject;
		}
		
		if( copy )
			object = MOBIUS.obj.copy( object );

		var geom = object.getGeometry();

		var trnMat = [ [ 1, 0, 0, shiftX ], 
							[ 0, 1, 0, shiftY ], 
								[ 0, 0, 1, shiftZ ], 
									[ 0, 0, 0, 1 ]
					 	] 
	
		if( frame != undefined ){
			geom = geom.transform( frame.toLocal() );
			geom = geom.transform( trnMat );
			geom = geom.transform( frame.toGlobal() );
		}
		else
			geom = geom.transform( trnMat );
		
		object.setGeometry( geom ); 

		return object;
		
	};


	/**
	 * Moves the centre of the object to a target point
	 * @param {mobiusobject} mObj - Object to be moved
	 * @param {float} xCoord - x-coordinate of the target point where the clone appears
	 * @param {float} yCoord - y-coordinate of the target point where the clone appears
	 * @param {float} zCoord - z-coordinate of the target point where the clone appears
	 * @returns Null
	 */
	mod.trn.move = function(object, point, copy){

		if (object instanceof mObj_geom_Solid)
			object = object.getGeometry();
	
		var orCenter = MOBIUS.obj.getCentre(object);
			
		// translation required
		var tx = point[0] - orCenter[0];
		var ty = point[1] - orCenter[1];
		var tz = point[2] - orCenter[2]; 
		
		return MOBIUS.trn.shift( object, undefined, tx, ty, tz, copy );		
	};


	//
	//
	// Matrix operations
	//
	//
	mod.mtx = {};

	/**
	 * Computes dot product of two matrices
	 * @param {array} mat1  - Matrix 1
	 * @param {array} mat2  - Matrix 2
	 * @returns {float} 
	 */
	mod.mtx.dot = function( matrix1, matrix2 ){
		return verb.core.Vec.dot(matrix1, matrix2);
	};

	/**
	 * Computes cross product of two matrices
	 * @param {array} mat1  - Matrix 1
	 * @param {array} mat2  - Matrix 2
	 * @returns {array} 
	 */
	mod.mtx.cross = function( matrix1, matrix2 ){
		return verb.core.Vec.cross(matrix1, matrix2);
	};

	//
	//
	// Lists
	//
	//
	mod.lst = {};


	/**
	 * Returns the length of the list 
	 * @param {array} valueList - List which is to be analyzed
	 * @returns {int} 
	 */
	mod.lst.length = function(list){
		return valueList.length
	};

	/**
	 * Finds the index of the first occurence of an array element. 
	 * @param {array} list  - List in which an element needs to be searched
	 * @param {array element} object - Element to be searched for
	 * @returns {int} Returns -1 if the element doesn't exist in array. 
	 */
	mod.lst.find = function(list, item){
		return list.indexOf( item );
	};

	mod.lst.append = function(list, itemOrList){
		list.push(itemOrList);
	};

	mod.lst.insert = function(list, item, index){

		var newlist = [];
		for(var i=0; i<=list.length; i++){
			
			if(i < index)
				newlist.push(list[i]);
			else if(i == index)
				newlist.push(item);
			else
				newlist.push(list[i-1]);
		}
			
	};

	mod.lst.extend = function(list, extension_list){
		
		extension_list.map( function(t){
			list.push(t);
		});

	};

	/**
	 * Removes an array element from a list by it's index number
	 * @param {array} list  - List in which an element needs to be removed
	 * @param {int} index - Index to be removed
	 * @returns {null} 
	 */
	mod.lst.remove = function(list, index) {
		list.splice(index, 1);
	};


	/**
	 * Returns a number sequence in the form of an array
	 * @param {float or int} start  - Starting value of the sequence
	 * @param {float or int} end  - Ending value of the sequence (not included in the sequence)
	 * @param {float or int} stepSize  - Increment or Decrement value to get to the 'end' value from the 'start' value
	 * @returns {array} 
	 */
	mod.lst.sequence = function(start, end, stepSize){

		var arr = [];
		if( start == end ){
			arr.push(start);
		}
		else if(start > end && stepSize < 0){
			for(var i = start; i > end; i = i + stepSize)
				arr.push(i);
		} 
		else{
			for(var i = start; i < end; i = i + stepSize)
				arr.push(i);
		}

		return arr;
	};

	//
	//
	// Numeric lists
	//
	//

	/**
	 * Gets the avaerage of a numeric array
	 * @param {array} valueList - List which is to be averaged
	 * @returns {float / int} 
	 */
	mod.lst.average = function(numericList){
		return MOBIUS.lst.sum( valueList )/ valueList.length;
	};


	/**
	 * Gets the minimum value in a numeric array
	 * @param {array} valueList - List from which minimum value is required
	 * @returns {float / int} 
	 */
	mod.lst.min = function(numericList){
		
		var minValue = valueList[0];
		
		for(var i=0; i<valueList.length; i++)
			minValue = Math.min(minValue, valueList[i]);
		
		return minValue;
	
	};

	/**
	 * Gets the maximum value in a numeric array
	 * @param {array} valueList - List from which maximum value is required
	 * @returns {float / int} 
	 */
	mod.lst.max = function(numericList){
		
		var maxValue = valueList[0];
		
		for(var i=0; i<valueList.length; i++)
			maxValue = Math.max(maxValue, valueList[i]);
		
		return maxValue;
	
	};


	/**
	 * Gets the sum of a numeric array
	 * @param {array} valueList - List which is to be summed
	 * @returns {float / int} 
	 */
	mod.lst.sum = function( numericList ){
		
		var sum = 0;
		
		for(var i=0; i<valueList.length; i++)
			sum += valueList[i];
		
		return sum;
	
	};

	/**
	 * Returns the span of the list - the difference between the maximum and the minimum value in the list
	 * @param {array} valueList - List which is to be analyzed
	 * @returns {float / int} 
	 */
	mod.lst.range = function( numericList ){
		
		return MOBIUS.lst.max( valueList ) - MOBIUS.lst.min( valueList );
	
	};


	//
	//
	// Misc functions
	//
	//
	mod.msc = {};

	/**
	 * Converts degrees into radians
	 * @param {float} degree - Degrees to be converted
	 * @returns {float} 
	 */
	mod.msc.degToRad = function(degree){
		return 0.01745*degrees;
	};

	/**
	 * Converts radians into degrees
	 * @param {float} radians - Radians to be converted
	 * @returns {float} 
	 */
	mod.msc.radToDeg = function(radians){
		return 57.29*radians;
	};

	/**
	 * Converts RGB values into Hex color code
	 * @param {int} red - Value between 0-255 for red color
	 * @param {int} green - Value between 0-255 for green color
	 * @param {int} blue - Value between 0-255 for blue color
	 * @returns {string} - HexValue
	 */
	mod.msc.rgbToHex = function(red, green, blue){
		
		return '0x'+toHex(red)+toHex(green)+toHex(blue);
			
		function toHex(n) {
			 n = parseInt(n,10);
			 if (isNaN(n)) return "00";
			 n = Math.max(0,Math.min(n,255));
			 return "0123456789ABCDEF".charAt((n-n%16)/16)
				  + "0123456789ABCDEF".charAt(n%16);
		}
	};
	
	/**
	 * Returns value of a number upto significant digits
	 * @param {float} number  - Number
	 * @param {int} number  - Number of significant digits needed
	 * @returns {float} 
	 */
	mod.msc.sigDig = function(number, number){
		return number.toFixed(digits);
	};

	/**
	 * Prints to console
	 * @param {string} content - Message to be printed on the console
	 * @returns {null}
	 */
	mod.msc.print = function(content){
		// try to find MOBIUS web app, if found print in MOBIUS console

		this.content = content;

		try{
			var logString = "<div style='color: green;'>" + this.content + '</div>';
			document.getElementById('log').innerHTML += logString;
		}catch(err){
			console.log('warnning: MOBIUS web app not connected.');
		}
	};

	//
	//
	//
	//
	mod.import = {}; 
	mod.import.loadShapeFile = function ( data ){
		
	var data = {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"OBJECTID":1,"LOT_KEY":"MK03-02485P","INC_CRC":"73960B9B","FMEL_UPD_D":"2015-09-21T00:00:00.000Z","X_ADDR":23381.2466,"Y_ADDR":29035.88,"SHAPE_Leng":8.77884353446,"SHAPE_Area":2.17080000077},"geometry":{"type":"Polygon","coordinates":[[[23381.62000000011,29034.519999999553],[23379.650000000373,29037.820000000298],[23382.46999999974,29035.300000000745],[23381.62000000011,29034.519999999553]]]}},
					{"type":"Feature","properties":{"OBJECTID":2,"LOT_KEY":"MK20-02759V","INC_CRC":"256B177E","FMEL_UPD_D":"2015-09-21T00:00:00.000Z","X_ADDR":28208.9416,"Y_ADDR":41250.172,"SHAPE_Leng":97.2662908614,"SHAPE_Area":416.536549986},"geometry":{"type":"Polygon","coordinates":[[[28226.150000000373,41238.73000000045],[28224.419999999925,41237.01999999955],[28220.790000000037,41232.74000000022],[28191.570000000298,41257.47000000067],[28191.830000000075,41257.72000000067],[28200.139999999665,41264.91000000015],[28202.509999999776,41266.699999999255],[28226.150000000373,41238.73000000045]]]}},
						{"type":"Feature","properties":{"OBJECTID":3,"LOT_KEY":"MK04-00514C","INC_CRC":"118A1D63","FMEL_UPD_D":"2015-09-21T00:00:00.000Z","X_ADDR":21893.4044,"Y_ADDR":34626.8145,"SHAPE_Leng":130.148409016,"SHAPE_Area":729.688199994},"geometry":{"type":"Polygon","coordinates":[[[21910.58999999985,34605.550000000745],[21874.730000000447,34621.169999999925],[21873.16000000015,34621.41000000015],[21873.44000000041,34621.77999999933],[21876.139999999665,34623.789999999106],[21879.790000000037,34626.00999999978],[21880.429999999702,34626.49000000022],[21880.91000000015,34628.08999999985],[21881.549999999814,34631.75999999978],[21882.349999999627,34633.18999999948],[21883.94000000041,34635.419999999925],[21885.21999999974,34638.9299999997],[21887.450000000186,34643.080000000075],[21890.16000000015,34646.90000000037],[21891.599999999627,34648.97000000067],[21893.349999999627,34652],[21894.41000000015,34653],[21895.040000000037,34651.960000000894],[21910.58999999985,34605.550000000745]]]}},
							{"type":"Feature","properties":{"OBJECTID":4,"LOT_KEY":"MK18-99302N","INC_CRC":"C6709D25","FMEL_UPD_D":"2015-09-21T00:00:00.000Z","X_ADDR":27927.375,"Y_ADDR":37455.9051,"SHAPE_Leng":63.9966574206,"SHAPE_Area":157.569900007},"geometry":{"type":"Polygon","coordinates":[[[27918.62000000011,37445.88000000082],[27930.759999999776,37468.77999999933],[27936.12999999989,37465.9299999997],[27923.990000000224,37443.02999999933],[27920.110000000335,37445.08999999985],[27918.62000000011,37445.88000000082]]]}}]
				}

	function addPoint(){

	}

	function addLine(){

	}

	function addPolygon( geomData ){

	}

	for(var i=0; i < data.features.length; i++){
		
		var geoFeature = data.features[i]; 

		var geoFeature_prop = geoFeature.properties;
		var geoFeature_geom = geoFeature.geometry;

		if(geomFeature_geom.type == 'Point')
			addPoint( geoFeature_geom, scale );
		else if(geomFeature_geom.type == 'Line')
			addPoint( geoFeature_geom, scale );
		else if(geomFeature_geom.type == 'Polygon')
			addPolygon( geomFeature_geom, scale );

	}

/*		init_d3 = function() {

				    geoConfig = function() {

				        this.mercator = d3.geo.equirectangular();
				        this.path = d3.geo.path().projection(this.mercator);

				        var translate = this.mercator.translate();
				        translate[0] = 500;
				        translate[1] = 0;

				        this.mercator.translate(translate);
				        this.mercator.scale(0.3);
				    }

				    this.geo = new geoConfig();
				}


		add_countries = function(data) { 

			    var countries = [];
			    var i, j;
			    
			    // convert to threejs meshes
			    for (i = 0 ; i < data.features.length ; i++) {
			        var geoFeature = data.features[i]; console.log(geoFeature);
			        var properties = geoFeature.properties;
			        var feature = this.geo.path(geoFeature);

			        if(feature == undefined || feature.length == undefined){
			         	console.log(i, "skipped");
			         	continue;
			        }

			        // we only need to convert it to a three.js path
			        var mesh = transformSVGPathExposed(feature); // this gives you a shape
			        console.log("this->", i, feature.length);


			        // add to array
					countries.push({"data": properties, "mesh": mesh});
			    } 

				// extrude paths and add color
			    for (i = 0 ; i < countries.length ; i++) {

			        // create material color based on average       
			        var material = new THREE.MeshPhongMaterial({
			            opacity:0.5
			        }); 

			        // extrude mesh 
			        
				    var shape3d = countries[i].mesh.extrude({
			            amount: 1, 
			            bevelEnabled: false
			        });

			        // create a mesh based on material and extruded shape
			        var toAdd = new THREE.Mesh(shape3d, material); 
			        shapefile.add(toAdd); //console.log("appended");
			    }
			}

			init_d3();
			var shapefile = new THREE.Object3D(); 
			add_countries( data ); s = shapefile;
			return shapefile;*/
	};


	// data conversion module
	mod.dataConversion = function(data){

		for(var i = 0; i < data.length; i++) {
			for (var m in data[i].value) {

				if (data[i].value[m] !== undefined) {

					if (data[i].value[m].constructor !== Array) {
						extract(data[i].value[m],
							data[i].geom,
							data[i].geomData);
					}
					else {
						var tempGeom = [];
						var tempData = [];

						for (var n = 0; n < data[i].value[m].length; n++) {

							extract(data[i].value[m][n],
								tempGeom,
								tempData);
						}
						data[i].geom.push(tempGeom);
						data[i].geomData.push(tempData);
					}
				}
			}
		}

		function extract (obj,geom,geomData){
			if(obj.constructor === Array){
				var tempGeom0 = [];
				var tempData0 = [];

				for(var k = 0; k < obj.length ; k++){
					extract(obj[k],tempGeom0,tempData0);
				}

				geom.push(tempGeom0);
				geomData.push(tempData0);
			}
			else if(obj instanceof  mObj_geom_Solid || obj instanceof  mObj_geom_Surface ||
						obj instanceof  mObj_geom_Curve || obj instanceof  mObj_geom_Vertex || obj instanceof mObj_frame){
				geom.push( obj.extractThreeGeometry() );
				geomData.push( obj.extractData() );
			}else{
				for(var key in obj){
					extract(obj[key],geom,geomData);
				}
			}
		}

		return data;
	};

	return mod;

})(window.MOBIUS || {});


/*
 *
 * Bridging Functions for all libraries used in Module - for geometry and topology
 *
 */

//
//	Functions forming bridge between data structure, topology and modules
//	Dependent on the modules being used for geometry and topology
//

//
//	Requirements
//	Function names should remain the same
//

var TOPOLOGY_DEF = {"vertices":[], "edges":[], "faces":[]}
//
//	Function to convert module geometry into three.js Mesh geometry
//  Add another if-else condition for each new geometry
//
var convertGeomToThree = function( geom ){

	// internal function
	convertToThree = function(singleDataObject){

		if( singleDataObject instanceof verb.geom.NurbsSurface )
			return ( new THREE.Mesh( singleDataObject.toThreeGeometry() ) );
		else if( singleDataObject instanceof verb.geom.NurbsCurve )
			return ( new THREE.Line( singleDataObject.toThreeGeometry() ) );
		else if(singleDataObject instanceof Array){
			// means it is a point
			var dotGeometry = new THREE.Geometry();
			dotGeometry.vertices.push( new THREE.Vector3(singleDataObject[0], singleDataObject[1], singleDataObject[2]) );
			return new THREE.PointCloud( dotGeometry );
		}
		else {
			console.log("Module doesnt recognise either!", singleDataObject);
		}
	}

	var rawResult = convertToThree( geom );
	
	return rawResult;
}

//
// Takes native topology and converts it into three.js format
//
var convertTopoToThree = function( topology ){

	var topo = new THREE.Object3D();
	
	// convert vertices
	var topoPointMaterial = new THREE.PointsMaterial( { size: 5, sizeAttenuation: false, color:0xCC3333 } );
	var dotGeometry = new THREE.Geometry(); 
	for(var v = 0; v < topology.vertices.length; v++){
		var vertex = topology.vertices[v].getGeometry();
		dotGeometry.vertices.push( new THREE.Vector3(vertex[0], vertex[1], vertex[2]) );
	}
	var allVertices = new THREE.Points( dotGeometry, topoPointMaterial );
	topo.add(allVertices);

 	
	// convert edges
	var topoEdgeMaterial = new THREE.LineBasicMaterial({
							    side: THREE.DoubleSide,
							    linewidth: 100,
							    color: 0x003366
							    });
	for(var e = 0; e < topology.edges.length; e++){ 
		var edge = convertGeomToThree(topology.edges[e].getGeometry());
		edge.material = topoEdgeMaterial;
		topo.add(edge);


	}

	// convert faces
	var topoSurfaceMaterial = new THREE.MeshLambertMaterial( {
									    side: THREE.DoubleSide,
									    wireframe: false,
									    shading: THREE.SmoothShading,
									    transparent: false,
									    color: 0x6666FF
									    } );
	for(var f = 0; f < topology.faces.length; f++){ 
		var face = convertGeomToThree(topology.faces[f].getGeometry());
		face.material = topoSurfaceMaterial;
		topo.add(face);

		//addNumber( "FaceNumber"+f, face);
	} 

	return topo;

}

//
//	Takes native geometry ( geometry from module ) and converts it into native topology - edges, faces, vertices
//
var computeTopology = function( mObj ){

	var geom = mObj.getGeometry(); 
	var topology = {};


	if(mObj instanceof mObj_geom_Vertex){
		topology.vertices = [];
		topology.edges = [];
		topology.faces = [];
	}
	else if(mObj instanceof mObj_geom_Curve){
		topology.vertices = [ new mObj_geom_Vertex(geom.point(0)) , new mObj_geom_Vertex(geom.point(1)) ];
		topology.edges = [ mObj ];
		topology.faces = [];
	}	
	else if(mObj instanceof mObj_geom_Surface){
		topology.vertices = [ new mObj_geom_Vertex(geom.point(0,0)), 
								 new mObj_geom_Vertex(geom.point(1,0)), 
									 new mObj_geom_Vertex(geom.point(1,1)), 
										 new mObj_geom_Vertex(geom.point(0,1))];
		topology.edges = geom.boundaries().map( function( boundary ) { return new mObj_geom_Curve( boundary )} );
		topology.faces = [mObj];
	}	
	else if(mObj instanceof mObj_geom_Solid){
		// means it is a solid - collection of surfaces
		topology.vertices = [];
		topology.edges = [];
		topology.faces = [];

		for(var srf=0; srf < geom.length; srf++){
			var surfaceTopo = geom[srf].getTopology(); 
			topology.vertices = topology.vertices.concat(surfaceTopo.vertices); 
			topology.edges = topology.edges.concat(surfaceTopo.edges);
			topology.faces = topology.faces.concat(surfaceTopo.faces);		
		}

		// remove clones - doesn't do well with the edges :/
/*		topology.vertices = removeClonesInList( topology.vertices ); 
		topology.edges = removeClonesInList( topology.edges );
		topology.faces = removeClonesInList( topology.faces ); */
	}
	else
		topology = undefined;	


	return topology;
}

//
// function to remove clones
//
//
var removeClonesInList = function( list ){
		var newArray = [];
		
		for(var v=0; v < list.length; v++){

			var thisObject = list[v].getGeometry() ; 
			var duplicate = false;
			//console.log(thisObject);
			for(nextV=v+1; nextV < list.length; nextV++){
			
				var nextObject = list[nextV].getGeometry() ; 

				if(thisObject._data != undefined)
					thisObject = thisObject._data;
				if (nextObject._data != undefined)		
					nextObject = nextObject._data; 

				if( thisObject.constructor.name == "Array" ){ 
					if( JSON.stringify( thisObject ) == JSON.stringify( nextObject ) ){
						duplicate = true; console.log(thisObject);
						break; 
					}
				}else{
						for(property in thisObject){
							if(thisObject.hasOwnProperty(property)){ 
								if(thisObject[property] != nextObject[property]){
									duplicate = false; 
									break;
								}
								else
									duplicate = true;	
							}
						}
					if(!duplicate)
						break;	
				}
			}
			
			if( !duplicate )
				newArray.push(list[v]);
		}

		return newArray;
}