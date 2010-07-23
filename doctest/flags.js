$.extend( DocTest.flags, {
    NORMALIZE_WHITESPACE: function( example ) {
        /** .. js:attribute:: DocTest.flags.NORMALIZE_WHITESPACE

        If you want to test by normalized values use this flag.

            >>> "abc\n\ndef\t  ghi\r\r\r."; //doctest: +NORMALIZE_WHITESPACE
            abc        def
            ghi    .
        */
        var whitespace = /[ \t\n\s]+/g,
            normalize = function( str ) {
                return $.trim( str.replace( whitespace, " " ) );
            };

        return normalize( example.want ) === normalize( example.got );
    },
    ELLIPSIS: function( example ) {
        /** .. js:attribute:: DocTest.flags.ELLIPSIS

        You can use ``...`` for wildcard. It matches any characters.

            >>> "I threw away, but who was thrown is just me.";
            ... //doctest: +ELLIPSIS
            I...was thrown....
        */
        var e = DocTest.escapeRegExp,
            ellipsis = new RegExp( e( e( "..." ) ), "g" );
            pattern = e( example.want ).replace( ellipsis, ".*" );
        return !!(new RegExp( pattern )).exec( example.got );
    },
    SKIP: Runner.extend({
        /** .. js:attribute:: DocTest.flags.SKIP

        DocTest does not test example that has ``SKIP`` flag.

            >>> false === true; //doctest: +SKIP
            true
        */
        reportSuccess: function( example ) {
            this.log.info( "skipped." );
        }
    })
});
