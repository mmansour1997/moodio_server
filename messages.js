$(document).ready(function() { // this js file gets the quote messages randomly

    var mQuotes = [ //quotes to get
        'Never look down on someone, unless you are helping them up',
        'Whoever is trying to bring you down, is already beneath you.',
        'The best project you will ever work on is YOU.',
        'Confidence is Silent. Insecurities are loud.',
        'The man on top of the mountain did not fall there.',
        'Waste no more time arguing about what a good man should be. Be one.'
    ];

    /*
    Gets random quote on homepage loading
    */
    var item = mQuotes[Math.floor(Math.random() * mQuotes.length)]; //gets random quote as soon as page loads
    $('.text').html('\"' + item + '\"');

    $(".button").on("click", function() { //gets random quote on clicking get quote button
        var item = mQuotes[Math.floor(Math.random() * mQuotes.length)];
        $('.text').html('\"' + item + '\"');
    });

});