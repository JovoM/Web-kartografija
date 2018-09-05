  var mousePositionControl = new ol.control.MousePosition({
        coordinateFormat: ol.coordinate.createStringXY(4),
        projection: 'EPSG:4326',
        // comment the following two lines to have the mouse position
        // be placed within the map.
        className: 'custom-mouse-position',
        target: document.getElementById('mouse-position'),
        undefinedHTML: '&nbsp;'
      });
	  
     var overlay = new ol.Overlay(({
     element: document.getElementById('popup'),
     autoPan: true,
     autoPanAnimation: {
     duration: 250
    }
    }));
	 
    var map = new ol.Map({
        layers: [
	    new ol.layer.Tile({
		source: new ol.source.OSM(),
	    zIndex: 0,
		visible: true,
		}),
		

		new ol.layer.Group({
			  openInLayerSwitcher: true,
            layers: [
			 new ol.layer.Tile({
                        title: 'MapBox',
                        visible: false,
                        source: new ol.source.XYZ({
                        url: 'https://api.mapbox.com/styles/v1/mapbox/streets-v8/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoicHNpbWljIiwiYSI6ImNqNDQyMWExZzB6YmozMm14YmJsaGtzc2QifQ.ALO89YGqQNx2HPBtobU2uw'
                        })
                    }),
             new ol.layer.Tile({
             source: new ol.source.TileWMS({
		     url: 'http://osgl.grf.bg.ac.rs/geoserver/osgl_3/wms',
             params: {'LAYERS': 'osgl_3:povrsina_lokalnosti_975_region', 'TILED': true},
             serverType: 'geoserver'
          })
          }),
		
					
		 new ol.layer.Tile({
          source: new ol.source.TileWMS({
			
            url: 'http://localhost:4848/geoserver/wfs',
            params: {'LAYERS': 'ITK-Jovo:nac', 'TILED': true},
            serverType: 'geoserver'
          })
		  
        }),
		 new ol.layer.Tile({
          source: new ol.source.TileWMS({
			
            url: 'http://localhost:4848/geoserver/wfs',
            params: {'LAYERS': 'ITK-Jovo:Parcele', 'TILED': true},
            serverType: 'geoserver'
          })
        }), 
			  
            ]
          })
        ],
		overlays: [overlay],
        target: 'map',
		controls: ol.control.defaults().extend([
			new ol.control.ScaleLine(),
			new ol.control.ZoomSlider(),
			mousePositionControl,
		
		
	    ]),
        view: new ol.View({
          center: ol.proj.transform([20.447316, 43.904041], "EPSG:4326", "EPSG:3857"),
          zoom: 7
        })
        });
	  
	  function transformacija() {
	  var wgs84 = new proj4.Proj('EPSG:4326');
	  var gk7 = "+proj=tmerc +lat_0=0 +lon_0=21 +k=0.9999 +x_0=7500000 +y_0=0 +ellps=bessel +towgs84=574.027,170.175,401.545,4.88786,-0.66524,-13.24673,0.99999311067 +units=m";
	
	  var x,y,z;
	  x=Number(document.form2.longituda.value);
	  y=Number(document.form2.latituda.value);
	  var p =proj4(wgs84,gk7,[x,y]);
	  document.form2.longituda1.value= p[0];
	  document.form2.latituda1.value= p[1];
	
		var t = Math.tan(y*Math.PI/180);
		var n = 0.0818191910428158*Math.cos(y*Math.PI/180);
		var c1 =(1+Math.pow(n,2))*Math.pow(Math.cos(y*Math.PI/180),2)/2;
		var c2 = (5-4*Math.pow(t,2))*Math.pow(Math.cos(y*Math.PI/180),4)/24;
		l=(x-21)*Math.PI/180;
		var c= 0.9999*(1+c1*Math.pow(l,2)+c2*Math.pow(l,4));
		var dc1=(-c+1)*100000;
	     document.form2.dc.value= dc1;
		 
		 //Download
		 download_vector_local = function(layer_name){
         var url = "http://localhost:4848/geoserver/wfs?service=wfs&version=2.0.0&request=GetFeature&typeName="+
        layer_name+"&outputFormat=shape-zip";
         window.open(url);
          }
   
        $("#l-nap-b").on('click', function() {
		download_vector_osgl('ITK-Jovo:nac',nacp);
	    });

	    };
       map.on("click", function(evt) {
       var coord = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:3909');
       var lon = coord[0];
       var lat = coord[1];
       var cooord = [lon, lat];
       var sf = ol.coordinate.createStringXY();
       var out = sf(cooord);
       alert (cooord);
       });

       function bindInputs(layerid, layer) {
        var visibilityInput = $(layerid + ' input.visible');
        visibilityInput.on('change', function() {
        layer.setVisible(this.checked);
        });
        visibilityInput.prop('checked', layer.getVisible());

        var opacityInput = $(layerid + ' input.opacity');
        opacityInput.on('input change', function() {
          layer.setOpacity(parseFloat(this.value));
        });
        opacityInput.val(String(layer.getOpacity()));
      }
      map.getLayers().forEach(function(layer, i) {
        bindInputs('#layer' + i, layer);
        if (layer instanceof ol.layer.Group) {
          layer.getLayers().forEach(function(sublayer, j) {
            bindInputs('#layer' + i + j, sublayer);
          });
        }
      });

      $('#layertree li > span').click(function() {
        $(this).siblings('fieldset').toggle();
      }).siblings('fieldset').hide();
	
     zoomslider= new ol.control.ZoomSlider();
     map.addControl(zoomslider);

     var projectionSelect = document.getElementById('projection');
      projectionSelect.addEventListener('change', function(event) {
        mousePositionControl.setProjection(ol.proj.get(event.target.value));
      });

      var precisionInput = document.getElementById('precision');
      precisionInput.addEventListener('change', function(event) {
        var format = ol.coordinate.createStringXY(event.target.valueAsNumber);
        mousePositionControl.setCoordinateFormat(format);
     });
     proj4.defs("EPSG:3909","+proj=tmerc +lat_0=0 +lon_0=21 +k=0.9999 +x_0=7500000 +y_0=0 +ellps=bessel +towgs84=682,-203,480,0,0,0,0 +units=m +no_defs");
  
  
  //za Skidanje karte
  
  document.getElementById('export-png').addEventListener('click', function() {
        map.once('postcompose', function(event) {
          var canvas = event.context.canvas;
          if (navigator.msSaveBlob) {
            navigator.msSaveBlob(canvas.msToBlob(), 'map.png');
          } else {
            canvas.toBlob(function(blob) {
              saveAs(blob, 'map.png');
            });
          }
        });
        map.renderSync();
      });

	  //Dobijanje informacija
	  
	  var singleClickEvent = map.on('singleclick', function(evt) {
	
		var features = putevi.getSource().getFeaturesAtCoordinate(evt.coordinate);

		if(features.length > 0) {

		var prozor = document.getElementById("prozor");
	
		document.getElementById("povrsina").innerHTML = features[0].get('Površina');
		document.getElementById("naziv").innerHTML = features[0].get('Naziv');
		document.getElementById("osnovan").innerHTML = features[0].get('Osnovan');

		prozor.style.top = evt.pixel[1].toString() + "px";
		prozor.style.left = evt.pixel[0].toString() + "px";
	}
	});

    function zatvoriProzor() {
	var prozor = document.getElementById("prozor");
	prozor.style.top = "-500px";
	prozor.style.left = "-500px";
}
	  