(function( glob, undefined ) {

    // Function signatures. It will be deleted.
    var del = /^function\s*\(\s*\)\s*\{\s*\/\*|\*\/\s*;?\s*\}$/g;

    glob.multiline = function( wrap ) {
        /** Returns multiline string from multiline comment of a function.

            >>> var markup = multiline(function() {/*
            ... <dl>
            ...   <dt>Name</dt>
            ...   <dd>Heungsub Lee</dd>
            ...   <dt>Job</dt>
            ...   <dd>Programmer</dd>
            ...   <dt>Homepage</dt>
            ...   <dd>
            ...     <a href="http://heungsub.net/">http://heungsub.net/</a>
            ...   </dd>
            ... </dl>
            ... *\/});
            >>> markup; //doctest: +NORMALIZE_WHITESPACE
            <dl>
              <dt>Name</dt>
              <dd>Heungsub Lee</dd>
              <dt>Job</dt>
              <dd>Programmer</dd>
              <dt>Homepage</dt>
              <dd>
                <a href="http://heungsub.net/">http://heungsub.net/</a>
              </dd>
            </dl>
            >>> $( markup ).appendTo( document.body ); //doctest: +SKIP
        */
        return String( wrap ).replace( del, "" );
    }
})( this );
