var Example = function( source, line, section ) {
        return new Example.fn.init( source, line, section );
    };

Example.fn = Example.prototype = $.extend( new Paragraph, {
    init: function( repl, lineNo, section ) {
        this.lineNo = +lineNo;
        this.section = section;
        this.doctest = section.doctest;

        var example = this.parse( repl );
        this.source = example.source;
        this.want = example.want;
        this.flags = example.flags;
    },

    parse: function( repl ) {
        var example = {},
            lines = repl.split( nl ),
            childLines = [],
            flags,
            flagName,

            isSource = false, isWant = false, hasFlag = false,

            e = DocTest.escapeRegExp,
            r = RegExp,

            prompt = new r( "^" + e( this.doctest.symbols.prompt ) ),
            continued = new r( "^" + e( this.doctest.symbols.continued ) );

        for ( var i in lines ) {
            if ( !isArrayElem( lines, i ) ) {
                continue;
            }
            line = lines[ i ];

            if ( prompt.exec( line ) ) {
                isSource = true;
                line = line.replace( prompt, "" );

            } else if ( isSource ) {
                if ( continued.exec( line ) ) {
                    line = line.replace( continued, "" );
                } else  {
                    isSource = false;
                    example.source = childLines.join( nl );
                    childLines = [];
                    isWant = true;
                }
            }

            if ( isSource || isWant ) {
                childLines.push( line );
            }
        }

        if ( isSource ) {
            example.source = childLines.join( nl );
            example.want = undefined;
        } else if ( isWant ) {
            example.want = childLines.join( nl ).replace( /<BLANKLINE>/, "" );
        }

        hasFlag = example.source.match( flagComment );
        example.flags = [];

        if ( hasFlag ) {
            flags = hasFlag[ 1 ].split( /\s+/ );

            for ( var i in flags ) {
                if ( !isArrayElem( flags, i ) ) {
                    continue;
                }
                flagName = flags[ i ].replace( /^\+/, "" );
                example.flags.push( DocTest.flags[ flagName ] );
            }
        }

        return example;
    },

    test: function() {
        var runner, runnerClass, check;

        try {
            this.got = this.eval( this.source );
        } catch ( error ) {
            this.got = error;
        }

        for ( var i in this.flags ) {
            // runner flag
            if ( !isArrayElem( this.flags, i ) ) {
                continue;
            } else if ( this.flags[ i ].prototype instanceof Runner ) {
                runnerClass = this.flags[ i ];
            } else if ( $.isFunction( this.flags[ i ] ) ) {
                check = this.flags[ i ];
            }
        }
        check = check || Example.check;
        runnerClass = runnerClass || Example.assert;
        runner = runnerClass( this.doctest.log, check );

        try {
            runner.reportStart( this );
            runner.run( this );
            runner.reportSuccess( this );
            this.doctest.trigger( "success", this );
            return true;
        } catch ( error ) {
            if ( error instanceof Failure ) {
                runner.reportFailure( this, error );
            } else {
                runner.reportError( this, error );
            }
            this.doctest.trigger( "failure", this, error );
            return false;
        }
    },

    eval: function( source ) {
        with ( window ) {
            return window.eval.call( window, source );
        }
    }
});

Example.fn.init.prototype = Example.fn;
Example.extend = Example.fn.extend = $.extend;

Example.extend({
    check: function( example ) {
        var want = String( example.want ),
            got = String( example.got );
        return want === got;
    },
    assert: Runner.extend({
        run: function( example ) {
            if ( this.check( example ) ) {
                return true;
            } else {
                throw new Failure( example );
            }
        },
        reportFailure: function( example, error ) {
            var msg = error.message;
            msg += " (line " + example.lineNo + " of ";
            msg += example.doctest.name + ")";
            this.log.error( msg );
        }
    })
});

DocTest.Example = Example;
