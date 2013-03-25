//

 document.addEventListener("deviceready", onDeviceReady, false);

 function init() {
	genererCarte();
 }
var nextLabId=0;
var nextLabLat=0;
var nextLabLng=0;
var watchID;
var lastLabId=0;
var GeoMarker ;

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

	//géolocalisation, on suit les changements de la position de l'utilisateur
	 if (!navigator.geolocation) {
		alert("Impossible de trouver la géolocalisation");
	}
	options = {enableHighAccuracy:true,frequency:2000 };
	//navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
	
	//options = { timeout: 2000 };
	
	watchID = navigator.geolocation.watchPosition(onSuccess, onError, options);
	
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
	//tableau de booléens : la galerie d'un labo est activée si l'on a visité sa fiche et si l'on a écouté le son correspondant jusqu'à la fin
	galleryUnlocked= new Array();
	
});

function genererCarte() {
	//génération de la google map
	$('#map2').hide();
	gmap = new google.maps.Map(document.getElementById("map2"), {
    center: new google.maps.LatLng(43.231572,5.437317),
    zoom: 17,
    mapTypeId: google.maps.MapTypeId.ROADMAP
	});
	//setTimeout("userPosition.setMap(gmap)",5000);
	GeoMarker = new GeolocationMarker(gmap);
	GeoMarker.setPositionOptions(options);
}

function onSuccess(position) { //si geolocalisation réussie
	
	
	$("#geotest").html(" latitude : "+position.coords.latitude +", longitude : " + position.coords.longitude);
	//suivre la position de l'utilisateur
	//*****ne fonctionne pas*****
	if (gmap !=undefined) {
		userCoord = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
		//userPosition.setPosition(userCoord);
		//gmap.setCenter(userCoord);
		gmap.panTo(userCoord);
	}
	//si la position a changé, regarder si l'on est près du prochain laboratoire et, si oui, afficher sa fiche
	var margin=0.00025
	 if (position.coords.latitude>=nextLabLat-margin && position.coords.latitude<=nextLabLat+margin &&  position.coords.longitude>=nextLabLg-margin && position.coords.longitude<=nextLabLng+margin)
		afficherLabo(nextLabId);
	//alert('Latitude: '          + position.coords.latitude);
}
function onError(error) {
	// alert('geolocation error, code: '    + error.code    + '\n' +
        //  'message: ' + error.message + '\n');
	$("#geotest").html('geolocation error, code: '    + error.code    + '\n' +  'message: ' + error.message + '\n');
}	
function reinitialiserContenu() {
	
	$('#contenu').html(homepageContentHTML);
	// si activée à partir de la fiche d'un labo
	if (page=="labo") 
		{
		$('#map2').replaceWith(map);
		$('.map').animate({
	   height:($('.map').height()/2)
	   },400);
	  
	}
	// si activée à partir de la galerie
	else if (page=="galerie") {
		var previousheight = $('.map').height();
		$("#map2").replaceWith(map);
		$('.map').height(previousheight/2);
		
	}
	else if (page=="grande galerie labo") {
		$("#map").show();
		var previousheight = $('.map').height();
		
		$("#map2").replaceWith(map);
		$('.map').height(previousheight/2);
	
	}
	else if (page=="grande galerie") {
		$("#map").show();
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
	$.getJSON('def_content.json', function(item,index) {
		$.each(item,function(index) {
			galleryUnlocked.push(false);
			if (item[index].labo.id==nextLabId) {
				nextLabLat=item[index].labo.gps.x;
				nextLabLng=item[index].labo.gps.y;
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


function afficherLabo(num) {
	
	//var phonegapmedia;
	nextLabId++;
	//on arrête le suivi de position tant que l'on n'a pas terminé d'écouter le son correspondant au labo
	if (watchID!= undefined)
		navigator.geolocation.clearWatch(watchID);
	//taille et affichage de la carte
	$('.map').animate({
	   height:($('.map').height()*2)
	   },400);
	map=$('#map').replaceWith(map2)
	$('#map2').show();
	
	setTimeout("google.maps.event.trigger(gmap, 'resize')",400);
	
	//parcours du json
	$.getJSON('def_content.json', function(item,index) {
		$.each(item,function(index) {
			if (item[index].labo.id==num)
			{	
				//place un marqueur au niveau du labo sur la carte
				gmap.setCenter(new google.maps.LatLng(item[index].labo.gps.x,item[index].labo.gps.y))
				
				$("#contenu").html(templateLabo(item[index]));
				$('video,audio').mediaelementplayer({ audioWidth: 290});
				//phonegapmedia=new Media(item[index].labo.sound.file);
				
				
				marker.setMap(null);
				marker = new google.maps.Marker({
					position: new google.maps.LatLng(item[index].labo.gps.x,item[index].labo.gps.y),
					  map: gmap,
					title:item[index].labo.name
				});
				google.maps.event.trigger(gmap, 'resize');
				gmap.panTo(marker.getPosition());
				
				
				//return false;
			}
			if (item[index].labo.id==num+1)
				{
				//prend les coordonnées du prochain labo
				nextLabLat = item[index].labo.gps.x;
				nextLabLng = item[index].labo.gps.y;
				return false;
				}
			/*else if (num==lastLabId) {
				nextLabLat=null;
				nextLabLng=null;
			}*/
			});
		//joue le son lorsque l'on arrive sur la page du labo
		var player = document.getElementById("player");
		
		player.play();
		//setTimeout(function(){if (player.ended==true) phonegapmedia.play()},1000);
		
							//débloque la galerie et reprend la géolocalisation lorsque le son est terminé
		 player.addEventListener('ended', function(){
				galleryUnlocked[num]=true;
				alert("galerie débloquée");
				marker.setPosition(new google.maps.LatLng(nextLabLat,nextLabLng));
				gmap.panTo(marker.getPosition());
				if (num!= lastLabId)											// on reprend la géolocalisation si on n'a pas atteint le dernier labo
					watchID = navigator.geolocation.watchPosition(onSuccess, onError, options);
			 });
	});
	page="labo";
}

function afficherGrandeGalerie() { // affiche la liste des laboratoires dont la galerie est débloquée
	if (page== "labo") page="grande galerie labo";
	else  page="grande galerie";
	$('#map2').hide();   			//cache la carte
	$('#map').hide();
	galleryContentHTML="";
	galleryContentHTML+="<div> Galeries </div>";
	var i=0;
	$.getJSON('def_content.json', function(item,index) {
		$.each(item,function(index) {
			if (galleryUnlocked[item[index].labo.id]==true) {		// vérifie que la galerie est débloquée
				
				galleryContentHTML+="<div class=row-fluid content>";
			 
			   if (i==3)
					{
					galleryContentHTML+="</div> \
						<div class='row-fluid content'>";
					i=0;
				}
			galleryContentHTML+=(templateGalerie(item[index]));
			i++;
			
				
				
			}
		});
		galleryContentHTML+="</div>";
		$("#contenu").html(galleryContentHTML);
	});

}
	

function afficherGalerie(num) {  		// affiche la galerie d'un laboratoire
	
	if (galleryUnlocked[num]==true) {
		page="galerie";
		$('#map2').hide(); // cache la carte pour laisser la place à l'affichage de la galerie
		var i=0;
		galleryContentHTML="";
		$.getJSON('def_content.json', function(item,index) {
			$.each(item,function(index) {
				if (item[index].labo.id==num) {
					galleryContentHTML+="<div> Galerie </div>";
					galleryContentHTML+="<div class=row-fluid content>";
				   $.each(item[index].labo.photos,function(index2) {   
				   if (i==3)
						{
						galleryContentHTML+="</div> \
							<div class='row-fluid content'>";
						i=0;
					}
					galleryContentHTML+=(templatePhotos(item[index].labo.photos[index2]));
					i++;
				
					
					});
					return false;
				}
			});
		galleryContentHTML+="</div>";
		$("#contenu").html(galleryContentHTML);
		});
	
	
	
	}
}