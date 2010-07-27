var Section = function( source, lineNo, doctest ) {
    /** .. class:: DocTest.Section( source[, lineNo, doctest] )

    It wraps a docstring within :data:`DocTest.symbols.start`, and
    :data:`DocTest.symbols.end`. Such as:

        >>> var docstring = [
        ...     "/** Like it!",
        ...     "",
        ...     "This is a bug.",
        ...     "Hi, bug?",
        ...     "(BANG!)",
        ...     "It's dead.",
        ...     "",
        ...     ">>> Section.fn instanceof Object;",
        ...     "true",
        ...     "*" + "/"
        ... ].join( "\n" );
        >>> var sect = DocTest.Section( docstring );
        >>> sect.description.length;
        3
        >>> sect.description[ 0 ] instanceof DocTest.Comment;
        true
        >>> sect.description[ 2 ] instanceof DocTest.Example;
        true
    */
    return new Section.fn.init( source, lineNo, doctest );
};

Section.fn = Section.prototype = {
    init: function( source, lineNo, doctest ) {
        this.source = source;
        this.lineNo = +lineNo || 1;
        this.doctest = doctest || DocTest.fn;
        this.options = this.doctest.options;
        this.status = {
            done: [],
            success: [],
            failure: [],
            examples: []
        };
        this.description = this.describe();
    },

    describe: function() {
        return this.parse( this.source );
    },

    parse: function( source ) {
        var description = [],
            lines = source.split( nl ),

            line, example, comment, childLines = [], lineNo,

            isExample = false, isComment = false, blankLine, 

            e = DocTest.escapeRegExp,
            r = RegExp,

            prompt = new r( __ + e( this.doctest.symbols.prompt ) + xx ),
            continued = new r( __ + e( this.doctest.symbols.continued ) + xx ),

            keepExample = function( childLines ) {
                var source = trimIndent( childLines.join( nl ) ),
                    example = Example( source, lineNo, this );
                description.push( example );
                this.status.examples.push( example );
                isExample = false;
            },
            keepComment = function( childLines ) {
                var body = trimIndent( childLines.join( nl ) );
                description.push( Comment( body, lineNo, this ) );
                isComment = false;
            };

        for ( var i in lines ) {
            if ( !isArrayElem( lines, i ) ) {
                continue;
            }
            line = lines[ i ];
            blankLine = blank.exec( line );

            if ( prompt.exec( line ) ) {
                if ( isExample ) {
                    keepExample.call( this, childLines );
                    childLines = [];
                } else if ( isComment ) {
                    keepComment.call( this, childLines );
                    childLines = [];
                }
                isExample = true;
                lineNo = +i + this.lineNo;

            } else if ( isExample ) {
                if ( blankLine ) {
                    keepExample.call( this, childLines );
                    childLines = [];
                }
            } else if ( isComment && blankLine ) {
                keepComment.call( this, childLines );
                childLines = [];
            } else if ( !blankLine ) {
                isComment = true;
                lineNo = +i + this.lineNo;
            }

            if ( isExample || isComment ) {
                childLines.push( line );
            }
        }
        if ( isExample ) {
            keepExample.call( this, childLines );
        } else if ( isComment ) {
            keepComment.call( this, childLines );
        }

        return description;
    },

    testAll: function() {
        for ( var i in this.description ) {
            if ( !isArrayElem( this.description, i ) ) {
                continue;
            }
            var example = this.description[ i ];
            if ( example instanceof Example ) {
                if ( example.test() ) {
                    this.status.success.push( example );
                } else {
                    this.status.failure.push( example );
                }
                this.status.done.push( example );
            }
        }

        return this.status;
    }
};

Section.fn.init.prototype = Section.fn;
Section.extend = Section.fn.extend = $.extend;

DocTest.Section = Section;
