var DocTest = function( script, options ) {
        return new DocTest.fn.init( script, options );
    },
    self = DocTest,

    // Check if this line has flags
    flagComment = /\/\/.*doctest:\s*(.+)\s*$/,
    blank = /^\s*$/,
    scriptUrl = /\.js/,
    __ = "^\\s*",
    xx = "(.+)$",
    nl = "\n",
    spaces = new RegExp( __ ),

    // Test types
    fileType = "file",
    funcType = "func",
    srcType = "src",
    nullType = "null",

    isArrayElem = function( collection, index ) {
        var exists = collection[ index ] !== undefined;
        return exists && !isNaN( +index );
    },

    ____ = "    ",

    shift = function( text, depth ) {
        depth = depth || 1;

        var lines = text.split( nl ), output = [], buffer;
        for ( var i in lines ) {
            buffer = "";
            for ( var j = 0; j < depth; j++ ) {
                buffer += ____;
            }
            buffer += lines[ i ];
            output.push( buffer );
        }
        return output.join( nl );
    },

    trimIndent = function( text ) {
        var lines = text.split( nl ), output = [],
            indent, minIndent;
        for ( var i in lines ) {
            if ( blank.exec( lines[ i ] ) ) {
                continue;
            }
            indent = lines[ i ].match( spaces )[ 0 ];
            if ( minIndent === undefined || indent.length < minIndent.length ) {
                minIndent = indent;
            }
        }
        indent = new RegExp( "^" + minIndent );
        for ( var i in lines ) {
            output.push( lines[ i ].replace( indent, "" ) );
        }
        return output.join( nl );
    };

DocTest.fn = DocTest.prototype = {
    options: {
        /** .. js:attribute:: DocTest.options

        Default options.

            >>> var opt = $.doctest.fn.options;
            >>> "<<<o>>> <<<o" + opt.symbols.prompt
            <<<o>>> <<<o>>> 
        */
        test: true,
        loadScript: true,
        log: window.console ? {
            info: $.proxy( window.console.log, window.console ),
            warn: $.proxy( window.console.warn, window.console ),
            error: $.proxy( window.console.error, window.console )
        } : {
            info: alert,
            warn: alert,
            error: alert
        },
        symbols: {
            start: "/**",
            end: "*/",
            prompt: ">>> ",
            continued: "... "
        },
        events: {
            success: null,
            failure: null,
            described: null,
            complete: null
        }
    },

    init: function( script, options ) {
        /** .. js:function:: DocTest.init( script, options )

        Initialize doctest document.

            >>> var noTest = {
            ...     test: false
            ... };
            >>> var nulldoc = $.doctest( null, noTest );
            >>> nulldoc instanceof $.doctest;
            true

        You can customize symbols for doctest parsing with options param.

            >>> var customdoc = $.doctest( null, $.extend({
            ...     symbols: {
            ...         end: "END"
            ...     }
            ... }, noTest ) );
            >>> customdoc.symbols.end;
            END
            >>> "[ " + customdoc.symbols.continued + "]";
            [ ... ]

        Custom log object.

            >>> var customlog = $.doctest( null, $.extend({
            ...     log: {
            ...         info: window.alert
            ...     }
            ... }, noTest ) ).log;
            >>> customlog.info.name;
            alert
            >>> customlog.warn === $.doctest.fn.options.log.warn;
            true

        The type of the first argument.

            >>> var filedoc = $.doctest( "nothing.js", noTest );
            >>> filedoc.type;
            file
            >>> $.doctest(function() {}, noTest ).type;
            func
            >>> var srcdoc = $.doctest( "var a = 1;", noTest );
            >>> srcdoc.type;
            src
            >>> srcdoc.source;
            var a = 1;

            >>> $.isArray( filedoc.sections );
            true
        */
        this.options = $.extend( true, {}, this.options, options );
        this.log = this.options.log;
        this.symbols = this.options.symbols;

        // Handle $.doctest( "example.js" )
        if ( scriptUrl.exec( script ) ) {
            this.hash = self.hash( script );
            this.name = this.scriptUrl = script;
            this.type = fileType;

        // Handle $.doctest( exampleFunction )
        } else if ( $.isFunction( script ) ) {
            this.hash = self.hash( script );
            this.name = script.name || ("function#" + this.hash);
            this.source = self.unescape( script );
            this.type = funcType;

        // Handle $.doctest( "/** >>> 'Hi'; ..." )
        } else if ( script ) {
            this.hash = self.hash( script );
            this.name = "source#" + this.hash;
            this.source = self.unescape( script );
            this.type = srcType;

        // Handle $.doctest()
        } else {
            this.type = nullType;
            return;
        }

        this.status = {
            done: [],
            success: [],
            failure: [],
            examples: []
        };
        this.described = this.completed = this.testing = false;
        this.sections = this.describe();

        if ( this.options.test ) {
            this.testAll();
        }
    },

    describe: function() {
        var sections = [],
            describe = $.proxy(function( source ) {
                $.extend( sections, this.parse( source ) );
                this.described = true;
                this.trigger( "described", this );
            }, this );

        if ( this.source ) {
            describe( this.source );
        } else if ( this.scriptUrl ) {
            // Get source of the script and run tests
            $.ajax({
                url: this.scriptUrl,
                dataType: "text",
                context: this,
                success: function( source ) {
                    this.source = source;
                    describe( this.source );
                    if ( this.testing ) {
                        this.testAll( true );
                    }
                },
                error: function( xhr ) {
                    if ( this.testing ) {
                        for ( var i in self.queue ) {
                            if ( self.queue[ i ] === this ) {
                                delete self.queue[ i ];
                                break;
                            }
                        }
                    }
                    throw new HTTPError( xhr );
                }
            });
        }

        return sections;
    },

    parse: function( source ) {
        source = self.unescape( source );

        var section,
            sections = [],
            lines = source.split( nl ),
            line,
            lineNo,
            sectionLines = [],
            sectionCode,

            // Modes
            isSection = false, hasFlag = false,

            e = self.escapeRegExp,

            start = new RegExp( __ + e( this.symbols.start ) ),
            end = new RegExp( __ + e( this.symbols.end ) );

        for ( var i in lines ) {
            if ( !isArrayElem( lines, i ) ) {
                continue;
            }
            line = lines[ i ];

            // When the start line of a docstring
            if ( start.exec( line ) ) {
                isSection = true;
                lineNo = +i + 1;
                line = line.replace( this.symbols.start, "" );

            // When the end line of a docstring
            } else if ( isSection && end.exec( line ) ) {
                sectionCode = trimIndent( sectionLines.join( nl ) );
                section = Section( sectionCode, lineNo, this );
                sections.push( section );
                var oldExamples = this.status.examples,
                    newExamples = section.status.examples;
                this.status.examples = $.merge( oldExamples, newExamples );
                sectionLines = [];
                isSection = false;
            }

            // When the line in a docstring
            if ( isSection ) {
                sectionLines.push( line );
            }
        }

        return sections;
    },

    testAll: function( noQueue ) {
        var first = false, sectionStatus, where;

        noQueue || self.queue.push( this );

        for ( where in self.queue ) {
            first = this === self.queue[ where ];
            break;
        }

        if ( this.described && first ) {
            for ( var i in this.sections ) {
                if ( !isArrayElem( this.sections, i ) ) {
                    continue;
                } else if ( this.options.loadScript ) {
                    var script = $( '<script class="doctest"></script>' );
                    script.text( this.source ).appendTo( document.body );
                }
                sectionStatus = this.sections[ i ].testAll();
                for ( var j in this.status ) {
                    if ( $.isArray( sectionStatus[ j ] ) ) {
                        $.merge( this.status[ j ], sectionStatus[ j ] );
                    }
                }
            }
            this.trigger( "complete", this );
            this.completed = true;

            // Pop
            delete self.queue[ where ];

            for ( var i in self.queue ) {
                self.queue[ i ].testAll( true );
                break;
            }

            this.testing = false;
        } else {
            // Pauses a testing
            this.testing = true;
        }

        return this.status;
    },

    trigger: function( eventType, arg1, arg2/*, ...*/ ) {
        var fn = this.options.events[ eventType ],
            args = Array.prototype.slice.call( arguments, 1 );
        if ( $.isFunction( fn ) ) {
            return fn.apply( this, args );
        } else {
            return null;
        }
    },

    toString: function() {
        return "[doctest " + this.name + "]";
    }
};

/**
Made ``DocTest.fn.init`` can returns ``DocTest`` object.

    >>> $.doctest() instanceof $.doctest;
    true
*/
DocTest.fn.init.prototype = DocTest.fn;
DocTest.extend = DocTest.fn.extend = $.extend;

DocTest.extend({
    version: "@VERSION",

    queue: [],

    hash: function( data, size ) {
        /** .. classmethod:: DocTest.hash

        Simple hash

            >>> $.doctest.hash( "a" );
            97
            >>> $.doctest.hash( "Hello, world!" );
            7981
        */
        var hash = 0;
        data = String( data ),
        size = size || Math.pow( 10, 20 );
        for ( var i = 0; i < data.length; i++ ) {
            hash += data.charCodeAt( i ) * (i + 1);
        }
        return Math.abs( hash ) % size;
    },

    escapeRegExp: function( t ) {
        var specials = [
            "/", ".", "*", "+", "?", "|",
            "(", ")", "[", "]", "{", "}", "\\"
        ];
        var r = new RegExp( "(\\" + specials.join( "|\\" ) + ")", "g" );

        return t.replace( r, "\\$1" );
    },

    unescape: function( doc ) {
        /** .. classmethod:: DocTest.unescape

        Unescapes a docstring

            >>> $.doctest.unescape( "\//*****\\/" ).length;
            8
        */
        return String( doc ).replace( /\*\\\//g, "*/" );
    },

    flags: {}
});
