$(document).ready(function(){
	templateLabo = _.template("\
		<div class='row-fluid menu2'>\
			<div class='span2'> \
			</div>\
			<div class='span2' onclick='afficherGallerie(<%=labo.id%>)'> \
			</div>\
			<div class='span8'> \
			ESCALE <%=labo.id%>: <%=labo.name%> \
			</div>\
		</div>\
		<div class='row-fluid content'>\
			<div class='span6'> \
			<img src='<%=labo.photos[0].file%>'> \
			</div>\
			<div class='span6'>\
				 <div class='module'> \
					<h2><%=labo.name%></h2>\
					<p><%=labo.sound.title%></p>\
				  </div>	\
				  <audio controls> \
				<source src='<%=labo.sound.file%>'>\
				</audio>\
			</div>	\
		</div>\
		");
	templateHomepage = _.template($("#templateHomepage").html());
		
	templatePhotos = _.template("\
			<div class='span4' onclick='afficherLabo(<%=labo.id%>)'>  \
			  <div class='module'>\
				<h2><%=labo.name%></h2>\
				<p><%=labo.sound.title%></p>\
			  </div>\
			  <img src='<%=labo.photos[0].file%>' />\
			</div>\
		");
	initialiserHomepage();
	
	$('#titreglobal').click(function() {
		reinitialiserContenu();
		
	});
});

function reinitialiserContenu() {
	$('#contenu').html(homepageContentHTML);
	if (inLab==true) 
		{
		$('.map').animate({
	   height:($('.map').height()/2)
	   },400);
	}
	inLab=false;
}

function initialiserHomepage() {
	homepageContentHTML="<div class='row-fluid content'>\
			<div class='span4'>\
			  <div class='title'>\
				<h1>Téléportation</h1>\
				<p>Trasportez-vous à Luminy</p>\
				<p>Choisissez votre labo</p>\
			  </div>\
			</div>";
	var i=1;
	$.getJSON('def_content.json', function(item,index) {
		$.each(item,function(index) {
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
	inLab=false;
	});
}

function afficherLabo(num) {
	$('.map').animate({
	   height:($('.map').height()*2)
	   },400);
	$.getJSON('def_content.json', function(item,index) {
		$.each(item,function(index) {
			if (item[index].labo.id==num)
			{	
				$("#contenu").html(templateLabo(item[index]));
				return false;
			}
			});
	});
	inLab=true;
}


/*function afficherGallerie(num) {
	mapHTML=$('
	$.getJSON('def_content.json', function(item,index) {
		$.each(item,function(index) {
			if (item[index].labo.id==num)
			{	
				//$("#contenu").html(templatePhotos(item[index]));
				return false;
			}
			});
	});

}*/