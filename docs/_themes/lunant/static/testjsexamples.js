$(function() {

$( ".highlight-jscon pre" ).each(function() {
    var self = $( this ),
        doct = $.doctest( self.text() );

    if ( doct.status.failure.length ) {
        self.addClass( "failure" );
    }
});

});

