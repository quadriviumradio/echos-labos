//

 document.addEventListener("deviceready", onDeviceReady, false);

 function init() {

 }
 
 
 
 var jsonfile='def_content.json';   //*******fichier json*******
 
var nextLabId=0;
var nextLabLat=0;
var nextLabLng=0;
var nextLabName="";
var watchID;
var lastLabId=0;
var GeoMarker ;
var photoSwipe;

var centerPos;
var deviceready=false;
var contentType="";
var geolocActivated=false;  // activation ou non de la géolocalisation
var label;

var userPosition = new google.maps.Marker({
					position: null,
					map: null
				});
var marker = new google.maps.Marker({
					position: null,
					map: null,
					title:""
				});

function onDeviceReady() {
	deviceready=true;
	//géolocalisation, on suit les changements de la position de l'utilisateur
	 if (!navigator.geolocation) {
		alert("Impossible de trouver la géolocalisation");
	}
	
	//navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
	
	//options = { timeout: 2000 };
	
	//watchID = navigator.geolocation.watchPosition(onSuccess, onError, options);
	
    }
$(document).ready(function(){
	//déclaration des templates

	templateLabo = _.template($("#templateLabo").html());
	templateHomepage = _.template($("#templateHomepage").html());
		
	templatePhotos = _.template($("#templatePhotos").html());
	templateGalerie= _.template($("#templateGalerie").html());
	//génrerer le contenu de la page d'accueil
	initialiserHomepage();
	//genererCarte();
	$('#titreglobal').click(function() {
		reinitialiserContenu();
	});
	mapheight = $('.map').height();
	//tableau de booléens : la galerie d'un labo est activée si l'on a visité sa fiche et si l'on a écouté le son correspondant jusqu'à la fin
	galleryUnlocked= new Array();
	options = {enableHighAccuracy:true,frequency:2000 };
	// pour gallerie photoswipe
	genererCarte();

/*	dirService = new google.maps.DirectionsService();
	dirRenderer = new google.maps.DirectionsRenderer({suppressMarkers: true, preserveViewport: true});
	dirRenderer.setMap(gmap);*/
	//centerPos=window.setInterval("gmap.panTo(GeoMarker.getPosition())",3000);
});

function genererCarte() {
	//génération de la google map
	$('#map2').hide();
	gmap = new google.maps.Map(document.getElementById("map2"), {
    center: new google.maps.LatLng(nextLabLat,nextLabLng),
    zoom: 17,
    mapTypeId: google.maps.MapTypeId.ROADMAP
	});
	//setTimeout("userPosition.setMap(gmap)",5000);
	label = new Label({
               map: gmap,
			   position: new google.maps.LatLng(nextLabLat,nextLabLng),
			   text:""
          });
	
}

function onSuccess(position) { //si geolocalisation réussie
	
	if (geolocActivated==true) {
		//$("#geotest").html(" latitude : "+position.coords.latitude +", longitude : " + position.coords.longitude);
		//suivre la position de l'utilisateur
		
		//si la position a changé, regarder si l'on est près du prochain laboratoire et, si oui, afficher sa fiche
		var margin=0.0006; //
		
		 if (position.coords.latitude>=nextLabLat-margin && position.coords.latitude<=nextLabLat+margin &&  position.coords.longitude>=nextLabLng-margin && position.coords.longitude<=nextLabLng+margin)
			{
			
			afficherLabo(nextLabId,true);
			
		}
	
	}
}
function onError(error) {
	// alert('geolocation error, code: '    + error.code    + '\n' +
        //  'message: ' + error.message + '\n');
	//$("#geotest").html('geolocation error, code: '    + error.code    + '\n' +  'message: ' + error.message + '\n');
}	

function toggleGeoloc() {
	
		geolocActivated=true;
		GeoMarker = new GeolocationMarker(gmap);
		GeoMarker.setPositionOptions(options);
		centerPos=window.setInterval("gmap.panTo(GeoMarker.getPosition())",3000);
		if (watchID==undefined) 
			watchID = navigator.geolocation.watchPosition(onSuccess, onError, options);
		if (nextLabId==0)
			afficherLabo(nextLabId,"toggle");
		else 
			afficherLabo(nextLabId-1,"toggle");
	
	
}
function reinitialiserContenu() {
	
	$('#contenu').html(homepageContentHTML);
	contentType="";
	// si activée à partir de la fiche d'un labo
	if (page=="labo") 
		{
		$('#map2').hide();
		$('#map').show();
		$('.map').stop().animate({
	   height:(mapheight)
	   },400);
	  
	}
	// si activée à partir de la galerie
	else if (page=="galerie") {
		$("#map").show();
		$("#map2").hide();
		$('.map').height(mapheight);
		$("#galleryContainer").hide();
		$("#contenu").show();
	}

	
	
	else if (page=="grande galerie") {
		$("#map").show();
		
		$("#map2").hide();
		$('.map').height(mapheight);
		$("#galleryContainer").hide();
		$("#contenu").show();
	}
	else if (page=="a propos") {
		$("#apropos").hide();
		$("#map").show();
		$("#contenu").show();
		$('.map').height(mapheight);
	}
	page="home";
}

function initialiserHomepage() {
	//contenu de la première page
	homepageContentHTML="<div class='row-fluid content'>\
			<div class='span4'>\
			  <div class='title'>\
				<h1>Téléportation</h1>\
				<p>Trasportez-vous à Luminy</p>\
				<p>Choisissez votre labo</p>\
			  </div>\
			</div>";
	var i=1;
	//parcours du fichier json
	$.getJSON(jsonfile, function(item,index) {
		$.each(item,function(index) {
			galleryUnlocked.push(false); // initialisation de l'état de la galerie du laboratoire
			if (item[index].labo.id==nextLabId) {
				nextLabLat=parseFloat(item[index].labo.gps.x);
				nextLabLng=parseFloat(item[index].labo.gps.y);
				nextLabName=item[index].labo.name;
			}
			if (item[index].labo.id>lastLabId) {
				lastLabId=item[index].labo.id;
			}
			if (i==3)
				{
				homepageContentHTML+="</div> \
					<div class='row-fluid content'>"
				i=0;
			}
			homepageContentHTML+=(templateHomepage(item[index]));
			i++;
			});
		$("#contenu").html(homepageContentHTML);
	map2=$("#map2");	
	page="home";
	});
}


function afficherLabo(num,origin) {
	
	//var phonegapmedia;
	if (origin!="toggle")	nextLabId=num+1;
	//on arrête le suivi de position tant que l'on n'a pas terminé d'écouter le son correspondant au labo
	if (origin==true) {
		window.clearInterval(centerPos);
		geolocActivated=false;
		if (GeoMarker !=undefined) GeoMarker.setMap(null);
		}
	if (watchID!= undefined)
		navigator.geolocation.clearWatch(watchID);
	//taille et affichage de la carte
	if (page=="home") {
		$('#map2').show();
		$('.map').stop().animate({
		   height:(mapheight*2)
		   },400);
		$('#map').hide();
		 
	
		setTimeout("google.maps.event.trigger(gmap, 'resize')",400);
	}
	
	//dirRenderer.setMap(null); // effacer les directions
	//parcours du json
	$.getJSON(jsonfile, function(item,index) {
		$.each(item,function(index) {
			if (item[index].labo.id==num)
			{	
				//place un marqueur au niveau du labo sur la carte
				//gmap.setCenter(new google.maps.LatLng(item[index].labo.gps.x,item[index].labo.gps.y));
				
				$("#contenu").html(templateLabo(item[index]));
				if (geolocActivated==false) {
					if (num!=0)
						$("#prec").show();
					if (num!=lastLabId)
						$("#suiv").show();
				}
			
				$('video,audio').mediaelementplayer({ audioWidth: 290,audioHeight:60});
				//phonegapmedia=new Media(item[index].labo.sound.file);
				
				
				marker.setMap(null);
				marker = new google.maps.Marker({
					position: new google.maps.LatLng(item[index].labo.gps.x,item[index].labo.gps.y),
					  map: gmap,
					
					title:item[index].labo.name
				});
				 label.set('zIndex', 1200);
				  label.bindTo('position', marker, 'position');
				  label.set('text', item[index].labo.name);
				google.maps.event.trigger(gmap, 'resize');
				gmap.panTo(marker.getPosition());
				
				
				
				//return false;
			}
			if (item[index].labo.id==nextLabId)
				{
				//prend les coordonnées du prochain labo
				nextLabLat = parseFloat(item[index].labo.gps.x);
				nextLabLng = parseFloat(item[index].labo.gps.y);
				nextLabName = item[index].labo.name;
				return false;
				}
			/*else if (num==lastLabId) {
				nextLabLat=null;
				nextLabLng=null;
			}*/
			});
		//joue le son lorsque l'on arrive sur la page du labo
		var player = document.getElementById("player");
		
		if (origin==true) player.play();
		//setTimeout(function(){if (player.ended==true) phonegapmedia.play()},1000);
		
							//débloque la galerie et reprend la géolocalisation lorsque le son est terminé
		 player.addEventListener('ended', function(){
				if (galleryUnlocked[num]==false) {
					galleryUnlocked[num]=true;
					//alert("galerie débloquée");
					$(".tooltip").show();
					window.setTimeout('	$(".tooltip").hide();',3000);
				}
				if (num!= lastLabId )				{	// on reprend la géolocalisation si on n'a pas atteint le dernier labo
					var pos=new google.maps.LatLng(nextLabLat,nextLabLng);
					marker.setPosition(pos);
					  label.set('text', nextLabName);
					gmap.panTo(pos);
					if (geolocActivated==true) {
						watchID = navigator.geolocation.watchPosition(onSuccess, onError, options);
					//	dirRenderer.setMap(gmap);
						centerPos=window.setInterval("gmap.panTo(GeoMarker.getPosition())",3000);
					}
				}
			 });
	});
	page="labo";
	contentType="labo";
}

function afficherGrandeGalerie() { // affiche la liste des laboratoires dont la galerie est débloquée

		
	page="grande galerie";
	$('.map').hide();   			//cache la carte
	$("#apropos").hide();
	galleryContentHTML="";
	galleryContentHTML+="<div> Galeries </div>";
	var i=0;
	$.getJSON(jsonfile, function(item,index) {
		$.each(item,function(index) {
			if (galleryUnlocked[item[index].labo.id]==true) {		// vérifie que la galerie est débloquée
				
				galleryContentHTML+="<ul class='gallery'>";
			 
			 
			galleryContentHTML+=(templateGalerie(item[index]));
			
			
				
				
			}
		});
		galleryContentHTML+="</ul>";
		galleryContentHTML+="<button class='btn btn-inverse' id='return' onclick='Retour()'> Retour à la page précédente </button>";
		$("#contenu").hide();
		$("#galleryContainer").html(galleryContentHTML);
		$("#galleryContainer").show();
	});

}
	

function afficherGalerie(num) {  		// affiche la galerie d'un laboratoire
	
	if (galleryUnlocked[num]==true) {
		
		
		page="galerie";
		
		$('.map').hide(); // cache la carte pour laisser la place à l'affichage de la galerie
		var i=0;
		galleryContentHTML="";
		$.getJSON(jsonfile, function(item,index) {
			$.each(item,function(index) {
				if (item[index].labo.id==num) {
					//galleryContentHTML+="<div> Galerie </div>";
					galleryContentHTML+="<ul id='Gallery' class='gallery'>";
				   $.each(item[index].labo.photos,function(index2) {   
				   /*if (i==3)
						{
						galleryContentHTML+="</div> \
							<div class='row-fluid content'>";
						i=0;
					}*/
					if (index2>0)
						galleryContentHTML+=(templatePhotos(item[index].labo.photos[index2]));
					//i++;
				
					
					});
					return false;
				}
			});
		galleryContentHTML+="</ul>";
		galleryContentHTML+="<button class='btn btn-inverse' id='return' onclick='Retour()'> Retour à la page précédente </button>";
		$("#contenu").hide();
		$("#galleryContainer").html(galleryContentHTML);
		$("#galleryContainer").show();
		photoSwipe = $("#Gallery a").photoSwipe({captionAndToolbarAutoHideDelay:0});
		});
	
	
	
	}
}

function aPropos() {
	page="a propos";
	$("#apropos").show();
	$("#contenu").hide();
	$(".map").hide();
	$("#galleryContainer").hide();
}

function Retour() {
	
	$("#galleryContainer").hide();
	$("#contenu").show();
	$("#apropos").hide();
	if (page=="grande galerie")
			$("#galleryContainer").hide();
	if (contentType=="labo") {
		$("#map2").show();
		page="labo";
		}
	else {
		page="home";
		$("#map").show();
	
		}
	
	
		

}