//ACS_Survey_Map_

console.log('maps.js loaded')

dsripMap=function(){
    // ini
    if(location.search.length>0){
        dsripMap.parms={}
        location.search.slice(1).split('&').map(function(pp){
            pp=pp.split('=')
            dsripMap.parms[pp[0]]=pp[1]
        })
        if(!dsripMap.parms.valParm){
            dsripMap.parms.valParm='fraction_population_hispanic'
        }
    }else{
        dsripMap.parms=dsripMap.parms||{}
        dsripMap.parms.valParm='fraction_population_hispanic'
    }

    var rows = JSON.parse(sessionStorage.getItem('rows')) 
    if(!rows){
        dsripMap.boxCom()
    }else{
        console.log(rows.length+'rows loaded from sessionStorage')
        dsripMap.plot(rows)
    }
}

dsripMap.availParms = ["total_population", "land_area_square_meters", "population_density_per_square_kilometer", "total_population_non_hispanic", "total_population_hispanic", "fraction_population_non_hispanic", "fraction_population_hispanic", "total_households", "spanish_language_households", "fraction_spanish_language_households", "english_language_households", "fraction_english_language_households", "median_age", "median_household_income_2013", "per_capita_income_2013", "total_households_receiving_snap", "total_households_with_one_disability", "fraction_receiving_snap", "fraction_with_one_disability", "total_households_owner_occupied", "total_households_renter_occupied", "fraction_households_owner_occupied", "fraction_households_renter_occupied", "total", "total_white", "total_african_american", "total_native_american", "total_asian_american", "total_two_or_more_races", "fraction_population_white", "fraction_population_african_american", "fraction_population_native_american", "fraction_population_asian_american", "fraction_population_two_or_more_races","x","y"].sort()    
dsripMap.stats={} // we'll keep them here
dsripMap.cPdf=function(x,u,s){
    u=u||0
    s=s||1
    return Math.round(255*(1/(s*Math.sqrt(2*Math.PI)))*(Math.exp((-Math.pow((x-u),2))/(2*Math.pow(s,2))))/(1/(s*Math.sqrt(2*Math.PI))))
}
dsripMap.plot=function(rows){
    dsripMap.rows=rows
    dsripMap.markers={} // keep markers here
    dsripMapsMsg.innerHTML='<span style="color:blue">Loaded '+rows.length+' records, displaying <select id="selectValParm" style="color:blue"></span>: '
    dsripMap.setSelectOpt()
    dsripMap.unpack = function (key) { // note this is scoping rows
        return rows.map(function(row) {
            return parseFloat(row[key])
        })
    }

    $('<div id="suffolkGmaps" style="height:70%"></div>').appendTo(dsripMapsAction)

    dsripMap.initMap=function() {
        // Create a map object and specify the DOM element for display.
        dsripMap.map=new google.maps.Map(document.getElementById('suffolkGmaps'), {
            center: {lat: 40.9332373, lng: -72.7924525},
            scrollwheel: false,
            zoom: 10
        })
        // Prepare statistics for all
        dsripMap.stats.all={}
        dsripMap.stats.all.parmSelected = dsripMap.unpack(dsripMap.parms.valParm)
        dsripMap.stats.all.parmSelected_max=dsripMap.stats.all.parmSelected.reduce(function(a,b){
            if(a>b){return a}else{return b}
        })
        dsripMap.stats.all.parmSelected_min=dsripMap.stats.all.parmSelected.reduce(function(a,b){
            if(a<b){return a}else{return b}
        })
        4
        /*
        dsripMap.stats.all.parmSelected_max = dsripMap.stats.all.parmSelected[0]
        dsripMap.stats.all.parmSelected.forEach(function(v){
            if(v>dsripMap.stats.all.parmSelected_max){
                dsripMap.stats.all.parmSelected_max=v
            }
        })
        */
        var cmax = dsripMap.stats.all.parmSelected_max
        var cmin = dsripMap.stats.all.parmSelected_min
        var cval = dsripMap.stats.all.parmSelected
        //cval=cval.map(function(v){
        //    return (v||0)
        //})

        dsripMap.rowPoly={} // notice how this is being passed as an object, not as an array
        rows.forEach(function(row,i){
             // prepare the map
            
            dsripMap.rowPoly[i]={}
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
                    //var r = Math.round(255*cval[i]/cmax)
                    //var c ='rgb('+r+','+(255-r)+',0)'
                    var c = dsripMap.color((cval[i]-cmin)/(cmax-cmin))
                    dsripMap.rowPoly[i][j]= new google.maps.Polygon({
                        paths: pp,
                        strokeColor: c,
                        strokeOpacity: 0.8,
                        strokeWeight: 1,
                        fillColor: c,
                        fillOpacity: 0.35,
                        i:i
                    })
                    dsripMap.rowPoly[i][j].addListener('click',dsripMap.polyClick)
                    dsripMap.rowPoly[i][j].addListener('mouseover',dsripMap.polyMouseover)
                    dsripMap.rowPoly[i][j].setMap(dsripMap.map)
                })
            }      
        })        
    }
    $.getScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyCD8nqFzanGQj5u51jAC6GN5TLjWv95cFo&callback=dsripMap.initMap')
    setTimeout(dsripMap.plotStats,5000)
}

dsripMap.reMap=function(valParm){
    dsripMap.parms.valParm=valParm||dsripMap.parms.valParm
    // Prepare statistics for all
    // Prepare statistics for all
    dsripMap.stats.all={}
    dsripMap.stats.all.parmSelected = dsripMap.unpack(dsripMap.parms.valParm)
    dsripMap.stats.all.parmSelected_max=dsripMap.stats.all.parmSelected.reduce(function(a,b){
        if(a>b){return a}else{return b}
    })
    dsripMap.stats.all.parmSelected_min=dsripMap.stats.all.parmSelected.reduce(function(a,b){
        if(a<b){return a}else{return b}
    })
    var cmax = dsripMap.stats.all.parmSelected_max
    var cmin = dsripMap.stats.all.parmSelected_min
    var cval = dsripMap.stats.all.parmSelected
    cval=cval.map(function(v){
        return (v||0)
    })
    var c='' // color
    for(var i in dsripMap.rowPoly){
        for(var j in dsripMap.rowPoly[i]){
            c=dsripMap.color((cval[i]-cmin)/(cmax-cmin))
            dsripMap.rowPoly[i][j].setOptions({
                strokeColor: c,
                fillColor: c
            })
        }
        4
    }
    4
}

dsripMap.setSelectOpt=function(){
    dsripMap.availParms.forEach(function(p){
        var opt = document.createElement('option')
        opt.value=opt.textContent=p
        //opt.style.color='blue'
        if(p===dsripMap.parms.valParm){
            opt.selected=true
        } 
        selectValParm.appendChild(opt)
    })
    selectValParm.onchange=function(){
        dsripMap.reMap(this.children[this.selectedIndex].value)
    }
}

dsripMap.polyClick=function(){
    //this.setMap(null)
    //this.setOptions({'fillColor':'blue'})
    var row = dsripMap.rows[this.i]
    statsClicked.innerHTML=this.i+') '+row.geo_name+' zip '+row.intersects_zip.slice(1,-1)+' ('+row.intersects_county_subdivision.slice(1,-1)+')'
    //this.i+') '+row.geo_name+''//<select id="parm_Y"></select><div id="statsClickedPlot"></div><select id="parm_X"></select>'
    
    // add marker
    if(!dsripMap.markers[this.i]){ // if there is no marker there add one
        dsripMap.markers[this.i]=new google.maps.Marker({
            position: {lat: parseFloat(row.y), lng: parseFloat(row.x)},
            map: dsripMap.map,
            title: this.i+') '+row.geo_name
        });
    }else{
        dsripMap.markers[this.i].setMap(null)
        delete dsripMap.markers[this.i]
    }
    // summary statistics
    //statsClicked.innerHTML=this.i+') '+row.geo_name+' zip '+row.intersects_zip.slice(1,-1)+' ('+row.intersects_county_subdivision.slice(1,-1)+')'
    var h="(click on colored regions for cumulative statistics)"
    var markerInd=Object.getOwnPropertyNames(dsripMap.markers)
    if(markerInd.length>0){
        h='<h4 style="color:blue">Average values for blocks # '+markerInd.join(', ')+'</h4>'
        var va = 0 
        for(var i = 0 ; i< markerInd.length ; i++){
            va+=parseFloat(dsripMap.rows[markerInd[i]][dsripMap.parms.valParm])
        }
        h+='<li>'+dsripMap.parms.valParm+'= '+va/markerInd.length+'</li>'
    }
    statsClicked.innerHTML=h
    4
    // plot it using Plotly
    
}

dsripMap.polyMouseover=function(){
    //this.setMap(null)
    //this.setOptions({'fillColor':'blue'})
    var row = dsripMap.rows[this.i]
    statsMouseover.innerHTML='<b style="color:blue">'+this.i+')</b> '+row.geo_name+' zip '+row.intersects_zip.slice(1,-1)+' ('+row.intersects_county_subdivision.slice(1,-1)+')<li>'+dsripMap.parms.valParm+'= '+row[dsripMap.parms.valParm]+'</li>'
}

dsripMap.plotStats=function(){
    //dsripMapsStats.innerHTML='<table><tr><td id="statsAll"></td><td id="statsClicked"></td><td id="statsMouseover"></td></tr></table>'
    dsripMapsStats.innerHTML='<span id="statsMouseover"></span><br><span id="statsClicked"></span>'
    
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

dsripMap.color=function(val,cm){
    //if(!cm){
    //    // blue red
    //    //cm=[[0,0,143],[0,0,159],[0,0,175],[0,0,191],[0,0,207],[0,0,223],[0,0,239],[0,0,255],[0,16,255],[0,32,255],[0,48,255],[0,64,255],[0,80,255],[0,96,255],[0,112,255],[0,128,255],[0,143,255],[0,159,255],[0,175,255],[0,191,255],[0,207,255],[0,223,255],[0,239,255],[0,255,255],[16,255,239],[32,255,223],[48,255,207],[64,255,191],[80,255,175],[96,255,159],[112,255,143],[128,255,128],[143,255,112],[159,255,96],[175,255,80],[191,255,64],[207,255,48],[223,255,32],[239,255,16],[255,255,0],[255,239,0],[255,223,0],[255,207,0],[255,191,0],[255,175,0],[255,159,0],[255,143,0],[255,128,0],[255,112,0],[255,96,0],[255,80,0],[255,64,0],[255,48,0],[255,32,0],[255,16,0],[255,0,0],[239,0,0],[223,0,0],[207,0,0],[191,0,0],[175,0,0],[159,0,0],[143,0,0],[128,0,0]]
    //    // green red
    //    //cm = [[0,255,0],[0,254,0],[0,254,0],[0,254,0],[0,253,0],[0,253,0],[0,252,0],[0,252,0],[0,251,0],[0,250,0],[0,248,0],[0,247,0],[0,245,0],[0,243,0],[0,240,0],[0,236,0],[0,232,0],[0,227,0],[0,221,0],[0,214,0],[0,206,0],[0,196,0],[0,185,0],[0,171,0],[0,156,0],[0,139,0],[0,120,0],[0,99,0],[0,76,0],[0,51,0],[0,26,0],[0,0,0],[0,0,0],[26,0,0],[51,0,0],[76,0,0],[99,0,0],[120,0,0],[139,0,0],[156,0,0],[171,0,0],[185,0,0],[196,0,0],[206,0,0],[214,0,0],[221,0,0],[227,0,0],[232,0,0],[236,0,0],[240,0,0],[243,0,0],[245,0,0],[247,0,0],[248,0,0],[250,0,0],[251,0,0],[252,0,0],[252,0,0],[253,0,0],[253,0,0],[254,0,0],[254,0,0],[254,0,0],[255,0,0]]
    //}
    if(Array.isArray(val)){
        return val.map(function(v){
            return dsripMap.color(v)
        })
    }else{
        //var c = Math.round(val*255)
        //return 'rgb('+c+','+(255-c)+','+Math.abs(c-127)+')'
        val = val*255
        return 'rgb('+dsripMap.cPdf(val,255,35)+','+dsripMap.cPdf(val,0,35) +','+dsripMap.cPdf(val,100,35)+')'
    }
    //var cc = cm[Math.floor(val*63)]
    //console.log(val,cc)
    //return 'rgb('+cc[0]+','+cc[1]+','+cc[2]+')'
    
}

// ...

$(document).ready(function(){
    dsripMap()
})


