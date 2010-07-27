$.extend( DocTest.flags, {
    NORMALIZE_WHITESPACE: function( example ) {
        var whitespace = /[ \t\n\s]+/g,
            normalize = function( str ) {
                return $.trim( str.replace( whitespace, " " ) );
            };

        return normalize( example.want ) === normalize( example.got );
    },
    ELLIPSIS: function( example ) {
        var e = DocTest.escapeRegExp,
            ellipsis = new RegExp( e( e( "..." ) ), "g" );
            pattern = e( example.want ).replace( ellipsis, ".*" );
        return !!(new RegExp( pattern )).exec( example.got );
    },
    SKIP: Runner.extend({
        reportSuccess: function( example ) {
            this.log.info( "skipped." );
        }
    })
});
