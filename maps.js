//ACS_Survey_Map_

console.log('maps.js loaded')

dsripMap=function(){
    // ini
    dsripMap.boxCom()
}

dsripMap.readFileUrl=function(url){
    dsripMapsMsg.innerHTML='<span style="color:red">loading ...</a>'
    Plotly.d3.csv(url, function(err, rows){
        rows = rows.filter(function(r){return r.county_name=='Suffolk'})
        dsripMapsMsg.innerHTML='<span style="color:blue">loaded '+rows.length+' records</a>'
        var unpack = function (key) { // note this is scoping rows
            return rows.map(function(row) {
                return row[key]
            })
        }
        $('<div id="suffolkPlotly" style="width:100%;height:100%"></div>').appendTo(dsripMapsAction)
        var lat = unpack('y').map(function(yi){return parseFloat(yi)}) // latitude
        var lon = unpack('x').map(function(xi){return parseFloat(xi)}) // latitude      
        var data = [{
        type: 'scattergeo',
        mode: 'markers+text',
        //text: unpack('geo_name'),
        lon: lon,
        lat: lat 
        }]
        var layout = {
            title: 'Suffolk county',
            font: {
                family: 'Droid Serif, serif',
                size: 6
            },
            titlefont: {
                size: 16
            },
            geo: {
                scope: 'usa',
                resolution: 50,
                lonaxis: {
                    'range': [Math.min.apply(null,lon), Math.max.apply(null,lon)]
                },
                lataxis: {
                    'range': [Math.min.apply(null,lat), Math.max.apply(null,lat)]
                },
                showrivers: true,
                rivercolor: '#fff',
                showlakes: true,
                lakecolor: '#fff',
                showland: true,
                landcolor: '#EAEAAE',
                countrycolor: '#d3d3d3',
                countrywidth: 1.5,
                subunitcolor: '#d3d3d3'
            }
        };

        Plotly.newPlot(suffolkPlotly, data, layout)

        $('<div id="suffolkLeaflet"></div>').appendTo(dsripMapsAction)
        


        4
    })
    4
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


