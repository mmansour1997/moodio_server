$(function() { //jquery function

    function refreshSwatch() { //function that sets the slider
        var yellow = $("#yellow").slider("value"); //gets the rgb value from the slider
        var alpha = yellow / 255; //divides by 255
        var perc = parseInt(alpha * 100); //multiplies by 100 to get the percentage
        $("label").css("background-color", "rgba(255, 255, 0, " + alpha + ");"); //adjusts the lamp intensity according to the slider
        $("#lightlevel").text(perc + "%"); //displays the percentage as a paragraph in the html

    }

    $("#yellow").slider({ //slider properties
        orientation: "horizontal",
        range: "min",
        max: 255,
        value: 127,
        slide: refreshSwatch, //calls the refresh to set the slider on sliding
        change: refreshSwatch //calls the refresh to set the slider on changing by clicking anywhere
    });

    $("#yellow").slider("value", 255); //on the homepage loading sets the slider to 100%

});