function initializeMap() {
    
    $('#button').click(function(){
        $('#overlay').css("display","none")
    });
    
    var map = L.map('map', {
        center: [53.142180, -1.390985],
        zoom: 5
    });
    
    var basemap = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);
    
    $('#game-select').change(function(e){
        $("#player-select").val('top');
        $("#nat-select").val('top');
        var value = $('#game-select').val();
        map.eachLayer(function (layer) {
            if (layer != basemap) {
                map.removeLayer(layer);
            };
        });
        updateMap(map,value);
    });
    
    $('#nat-select').change(function(e){
        $("#player-select").val('top');
        $("#game-select").val('top');
        var value = $('#nat-select').val();
        map.eachLayer(function (layer) {
            if (layer != basemap) {
                map.removeLayer(layer);
            };
        });
        var option = 'nation'
        playerAdd(map,value,option);
    });
    
    $('#player-select').change(function(e){
        $("#game-select").val('top');
        $("#nat-select").val('top');
        var value = $('#player-select').val();
        map.eachLayer(function (layer) {
            if (layer != basemap) {
                map.removeLayer(layer);
            };
        });
        var option = 'player'
        playerAdd(map,value,option);
    });
    
}; // end initializeMap

function playerAdd(map,value,option){
    
    if (option == 'player'){
        var sql = "SELECT the_geom, name, nation, city, min FROM fisherjohnmark.pl_players_total where name='"+value+"'&api_key=default_public";
    } else {
        var sql = "SELECT the_geom, name, nation, city, min FROM fisherjohnmark.pl_players_total where nation='"+value+"'&api_key=default_public";
    };
    
    var getURL = 'https://fisherjohnmark.carto.com/api/v2/sql?format=GeoJSON&q=';
    
    var playerMarker = {
        radius: 5,
        color: "#C8102E",
        fillOpacity: 0.5
    };

    $.getJSON(getURL+sql, function(data){
        
        var features = data.features;
        
        var allPoints = [];
        
        var playerMarkers = L.markerClusterGroup();
        
        var players = L.geoJSON(features, {
            pointToLayer: function (feature, latlng) {
                allPoints.push(latlng);
                return L.circleMarker(latlng,playerMarker);
            },
            onEachFeature: playerData
        });
        
        playerMarkers.addLayer(players);
        
        map.addLayer(playerMarkers);

        var bounds = L.latLngBounds(allPoints);
        
        map.fitBounds(bounds, {
            maxZoom: 7
        });
    });
    
}; // end playerAdd

function updateMap(map,value) {
    
    var qseason = value.slice(0,4)+value.slice(5)
    
    var getURL = 'https://fisherjohnmark.carto.com/api/v2/sql?format=GeoJSON&q=';
    var sql = 'SELECT the_geom, name, nation, city, s'+qseason+' min FROM fisherjohnmark.pl_players where s'+qseason+' > 0&api_key=default_public';
    
    var playerMarker = {
        radius: 5,
        color: "#C8102E",
        fillOpacity: 0.5
    };

    $.getJSON(getURL+sql, function(data){
        
        var features = data.features;
        
        var allPoints = [];
        
        var playerMarkers = L.markerClusterGroup();
        
        var players = L.geoJSON(features, {
            pointToLayer: function (feature, latlng) {
                allPoints.push(latlng);
                return L.circleMarker(latlng,playerMarker);
            },
            onEachFeature: playerData
        });
        
        playerMarkers.addLayer(players);
        
        map.addLayer(playerMarkers);
        
        var bounds = L.latLngBounds(allPoints);
        
        map.fitBounds(bounds);
    });
}; // end updateMap

function playerData(feature,layer){
    
    var minutes = feature.properties.min.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    
    var popupContent = "<b>"+feature.properties.name+"</b><br>Birth City: "+feature.properties.city+"<br>Nationality: "+feature.properties.nation+"<br>Minutes Played: "+minutes;
    
    layer.bindPopup(popupContent, {
        offset: [0,-2],
        direction: 'top',
        className: 'popupPlayer'});
    
}; // end of playerData

function fillSelects() {
    
    var getURL = 'https://fisherjohnmark.carto.com/api/v2/sql?format=JSON&q=';
    var sql_player = 'SELECT name FROM fisherjohnmark.pl_players order by name&api_key=default_public';
    var sql_nat = 'SELECT distinct(nation) FROM fisherjohnmark.pl_players order by nation&api_key=default_public';
    
    $.getJSON(getURL+sql_player, function(data){
        
        var names = data.rows;
        
        for (i=0;i<names.length;i++){
            
            $('#player-select').append($('<option></option>').attr('value', names[i].name).text(names[i].name));
        };
    });
    
    $.getJSON(getURL+sql_nat, function(data){
        
        var nats = data.rows;
        
        for (i=0;i<nats.length;i++){
            
            $('#nat-select').append($('<option></option>').attr('value', nats[i].nation).text(nats[i].nation));
        };
    });
    
    seasons = ['1992-1993','1993-1994','1994-1995','1995-1996','1996-1997','1997-1998','1998-1999','1999-2000','2000-2001','2001-2002','2002-2003','2003-2004','2004-2005','2005-2006','2006-2007','2007-2008','2008-2009','2009-2010','2010-2011','2011-2012','2012-2013','2013-2014','2014-2015','2015-2016','2016-2017','2017-2018','2018-2019'];
    
    for (i=0;i<seasons.length;i++){
        
        $('#game-select').append($('<option></option>').attr('value', seasons[i]).text(seasons[i]));
    };
    
}; // end fillSelect

function screenSize(){
    
    var width = $( window ).width();
    var height = $( window ).height();
    
    if (height>width){
        
        $('#main').css({"width":'95%',
                       "margin-left": '2.5%',
                       "margin-right": '2.5%'})
    };
    
}; // end screenSize

function tooltipping(){
    
    function showYNWA(){
        $('#ynwa-text').css( "visibility", "visible" );
    };
    
    function hideYNWA(){
        $('#ynwa-text').css( "visibility", "hidden" );
    };
    
    $('.ynwa').hover(showYNWA,hideYNWA)
    $('[data-toggle="tooltip"]').tooltip();
    
}; // end tooltipping

$(document).ready(screenSize);
$(document).ready(fillSelects);
$(document).ready(initializeMap);
$(document).ready(tooltipping);