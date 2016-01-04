//ACS_Survey_Map_

console.log('maps.js loaded')

dsripMap=function(){
    // ini
    dsripMap.boxCom()
}

dsripMap.readFileUrl=function(url){
    $.get(url).then(function(txt){
        // convert csv into array of arrays
        txt = txt.split(/\n/).map(function(txti){
            // concate {} arrays
            return txti.split(',')
        })
        // parse it into a structure
        


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


