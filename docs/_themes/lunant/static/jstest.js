$(function() {

$( ".highlight-jscon pre" ).each(function() {
    var self = $( this );
    if ( $.doctest( self.text() ).status.failure.length ) {
        self.addClass( "failure" );
    }
});

});

