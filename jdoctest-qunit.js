(function( window, jDoctest ) {

var j = jDoctest;

j.testWithQUnit = function( fileName, options ) {
    /**:jDoctest.testWithQUnit( fileName[, options ] )

    `QUnit`_ is a powerful, easy-to-use, JavaScript test suite that used by
    the jQuery project. Our doctests could be runned within QUnit frame::

        jDoctest.testWithQUnit( "source-which-contains-some-docstrings.js" );

    .. seealso::

       - :meth:`jDoctest.testSource`

    .. _QUnit: http://docs.jquery.com/Qunit
    */
    var materials = this.getMaterials( options ),
        parser = materials.parser,
        runner = new this.QUnitRunner( materials.runner );
    $.get( fileName, function( src ) {
        var doctests = parser.getDoctests( src, fileName );
        if ( !options || !options.alreadyLoaded ) {
            window.eval.call( window, src );
        }
        for ( var i = 0; i < doctests.length; i++ ) {
            runner.run( doctests[ i ] );
        }
    }, "text" );
};

j.QUnitRunner = j.Runner.extend({
    start: function() {
        start();
    },
    runDoctest: function( doctest ) {
        module( doctest.name );
    },
    runExample: function( exam, doctest ) {
        var testFunc = $.proxy(function() {
                try {
                    var output = this.getOutput( exam.source );
                    equals( output, exam.want, exam.source );
                } catch ( error ) {
                    if ( error instanceof j.errors.StopRunning ) {
                        stop();
                    } else {
                        throw error;
                    }
                }
            }, this ),
            source = exam.source.split( "\n" );
        if ( source.length === 1 ) {
            source = source[ 0 ];
        } else {
            source = source[ 0 ] + "...";
        }
        test( source + " (line " + exam.lineNo + ")", testFunc );
    },
    runFinally: function() {
        start();
    }
});

})( this, jDoctest );

