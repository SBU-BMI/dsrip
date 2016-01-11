//ACS_Survey_Map_

console.log('maps.js loaded')

dsripMap=function(){
    // ini
    dsripMap.boxCom()
    //dsripMap.plot(JSON.parse(sessionStorage.getItem('rows')))
}

dsripMap.stats={} // we'll keep them here

dsripMap.plot=function(rows){
    dsripMap.rows=rows
    dsripMapsMsg.innerHTML='<span style="color:blue">loaded '+rows.length+' records</a>'
    dsripMap.unpack = function (key) { // note this is scoping rows
        return rows.map(function(row) {
            return parseFloat(row[key])
        })
    }

    $('<div id="suffolkGmaps" style="height:70%"></div>').appendTo(dsripMapsAction)

    dsripMap.initMap=function() {
        // Create a map object and specify the DOM element for display.
        var map = new google.maps.Map(document.getElementById('suffolkGmaps'), {
            center: {lat: 40.9332373, lng: -72.7924525},
            scrollwheel: false,
            zoom: 10
        });
        // Prepare statistics for all
        dsripMap.stats.all={}
        dsripMap.stats.all.fraction_population_hispanic = dsripMap.unpack('fraction_population_hispanic')
        dsripMap.stats.all.fraction_population_hispanic_max = 0
        dsripMap.stats.all.fraction_population_hispanic.forEach(function(v){
            if(v>dsripMap.stats.all.fraction_population_hispanic_max){
                dsripMap.stats.all.fraction_population_hispanic_max=v
            }
        })
        var cmax = dsripMap.stats.all.fraction_population_hispanic_max
        var cval = dsripMap.stats.all.fraction_population_hispanic
        cval=cval.map(function(v){
            return (v||0)
        })

        rows.forEach(function(row,i){
            var polys = JSON.parse(row.geom_geojson) // polygons for a row
            if(!polys.coordinates){
                console.log(i,'no coordinates')
            }else{
                polys.coordinates.forEach(function(cr,j){ // for each polygon coordinate set
                    //console.log(i,j)                
                    if(cr.length==1){
                        cr=cr[0]
                        //console.log('cr fix')
                    } // some bug here in row 5, ask Janos
                    var pp= cr.map(function(ci){ // coordinates as gmaps path obj https://developers.google.com/maps/documentation/javascript/shapes
                        return {lat:ci[1],lng:ci[0]}
                    })
                    var r = Math.round(255*cval[i]/cmax)
                    var c ='rgb('+r+','+(255-r)+',0)' 
                    var poly = new google.maps.Polygon({
                        paths: pp,
                        strokeColor: c,
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: c,
                        fillOpacity: 0.35,
                        i:i
                    })
                    poly.addListener('click',dsripMap.polyClick)
                    poly.addListener('mouseover',dsripMap.polyMouseover)
                    poly.setMap(map)
                    if(!dsripMap.maps){dsripMap.maps=[]}
                    if(!dsripMap.maps[i]){dsripMap.maps[i]=[]}
                    dsripMap.maps[i].push(poly)
                })
            }      
        })        
    }
    $.getScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyCD8nqFzanGQj5u51jAC6GN5TLjWv95cFo&callback=dsripMap.initMap')
    setTimeout(dsripMap.plotStats,5000)
}

dsripMap.polyClick=function(){
    //this.setMap(null)
    //this.setOptions({'fillColor':'blue'})
    var row = dsripMap.rows[this.i]
    statsMouseover.innerHTML=row.geo_name
}

dsripMap.polyMouseover=function(){
    //this.setMap(null)
    //this.setOptions({'fillColor':'blue'})
    var row = dsripMap.rows[this.i]
    statsMouseover.innerHTML=row.geo_name
}

dsripMap.plotStats=function(){
    dsripMapsStats.innerHTML='<table><tr><td id="statsAll"></td><td id="statsClicked"></td><td id="statsMouseover"></td></tr></table>'
    // all stats
    


    4
}

dsripMap.readFileUrl=function(url){
    dsripMapsMsg.innerHTML='<span style="color:red">loading ...</a>'
    Plotly.d3.csv(url, function(err, rows){
        rows = rows.filter(function(r){return r.county_name=='Suffolk'})
        dsripMap.plot(rows)
        sessionStorage.setItem('rows',JSON.stringify(rows)) // remove after dev
    }) 
}

dsripMap.boxCom=function(){
    dsripMapsAction.innerHTML='<div id="box-select" data-link-type="direct" data-multiselect="YOUR_MULTISELECT" data-client-id="eec5ta84z8jw4flacxu3f4g5lo5jsdr6"></div>'
    $.getScript("https://app.box.com/js/static/select.js").then(function(){
        dsripMap.boxCom.buttonLoaded=true
        $(document).ready(function(){
            var boxSelect = new BoxSelect();
            // Register a success callback handler
            boxSelect.success(function(response) {
                //console.log(response);
                dsripMap.readFileUrl(response[0].url)
            });
            // Register a cancel callback handler
            boxSelect.cancel(function() {
                console.log("The user clicked cancel or closed the popup");
            });
        });
    })
}

// ...

$(document).ready(function(){
    dsripMap()
})


