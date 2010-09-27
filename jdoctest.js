/*
jDoctest
~~~~~~~~

Tests interactive JavaScript examples such as Python's doctest module.

Links
`````

* `documentation`_
* `development version`_

.. _documentation:
   http://jdoctest.lunant.com/
.. _development version:
   http://github.com/lunant/jdoctest/zipball/master#egg=jdoctest-dev
*/
this.jDoctest = (function( window, $ ) { var meta = {
   NAME: "jDoctest",
VERSION: "0.0.9",
AUTHORS: ["Lee Heung-sub <sublee@lunant.com>"],
    URL: "http://jdoctest.lunant.com/",
 GITHUB: "http://github.com/lunant/jdoctest"
};

// Checks dependencies
if ( !$ ) {
    throw new ReferenceError( "jDoctest needs jQuery framework" );
}

/***********************************************************************
* jDoctest
***********************************************************************/
var jDoctest = j = function( examples, name, source, fileName, lineNo ) {
    /**class: jDoctest( examples[, name[, source[, fileName[, lineNo ] ] ] )

    A collaction of examples.

        >>> new jDoctest([], "lykit", "", "lykit.js" );
        <jDoctest lykit from lykit.js:1 (no examples)>
        >>> new jDoctest([ new jDoctest.Example( "1;" ) ]);
        <jDoctest (1 example)>
        >>> new jDoctest([
        ...     new jDoctest.Example( "1;" ),
        ...     new jDoctest.Example( "1;" ),
        ...     new jDoctest.Example( "2;", "2" )
        ... ]);
        <jDoctest (3 examples)>
    */
    this.examples = examples;
    this.name = name;
    this.source = source;
    this.fileName = fileName;
    this.lineNo = parseInt( lineNo || 1 );
};
j.prototype = {
    toString: function() {
        var examples, name = "", from = "";
        switch ( this.examples.length ) {
            case 0:
                examples = "no examples";
                break;
            case 1:
                examples = "1 example";
                break;
            default:
                examples = this.examples.length + " examples";
        }
        if ( this.name ) {
            name = " " + this.name;
        }
        if ( this.fileName ) {
            from = " from " + this.fileName;
            if ( this.lineNo ) {
                from += ":" + this.lineNo;
            }
        }
        return "<jDoctest" + name + from + " (" + examples + ")>";
    }
};
// Exports meta data
$.extend( j, meta );

/***********************************************************************
* Exceptions
***********************************************************************/
j.errors = {
    StopRunning: function() {
        this.name = "StopRunning";
        this.message = "The running process has to stop";
    }
};
j.errors.StopRunning.prototype = new Error();

/***********************************************************************
* Front-end
***********************************************************************/
j.testSource = function( fileName, options ) {
    /**:jDoctest.testSource( fileName[, options ] )

    Tests a JavaScript source file::

        jDoctest.testSource( "source-which-contains-some-docstrings.js" );

    The source file should contain some docstrings. A docstring is a
    multiline-comment which starts with ``/**`` or a specified doc-prefix.

    .. seealso::

       - :meth:`jDoctest.testFile`
    */
    var materials = this.getMaterials( options ),
        parser = materials.parser,
        runner = materials.runner;
    $.get( fileName, function( src ) {
        var doctests = parser.getDoctests( src, fileName );
        if ( !options || !options.alreadyLoaded ) {
            window.eval.call( window, src );
        }
        for ( var i = 0; i < doctests.length; i++ ) {
            runner.run( doctests[ i ] );
        }
    }, "text" );
    return runner.result;
};
j.testFile = function( fileName, options ) {
    /**:jDoctest.testFile( fileName[, options ] )

    Tests a file::

        jDoctest.testSource( "a-docstring.txt" );

    The content of the file is a docstring. :class:`jDoctest.Parser` finds
    only examples(not docstrings).

    .. seealso::

       - :meth:`jDoctest.testSource`
    */
    var materials = this.getMaterials( options ),
        parser = materials.parser,
        runner = materials.runner;
    $.get( fileName, function( src ) {
        var doctest = new jDoctest( parser.getExamples( src ), src, fileName );
        runner.run( doctest );
    }, "text" );
    return runner.result;
};
j.getMaterials = function( options ) {
    /**:jDoctest.getMaterials( options )

    Returns a :class:`jDoctest.Parser` and a :class:`jDoctest.Runner` from
    ``options``. ``options`` is :class:`jDoctest.Runner`'s ``options``
    parameter.
    */
    options = $.extend( true, {
        verbose: false,
        symbols: undefined,
        onComplete: undefined
    }, options );
    var result = {},
        symbols = options.symbols,
        Runner;
    delete options[ "symbols" ];
    return {
        parser: new j.Parser( options.symbols ),
        runner: new j.Runner( result, options )
    };
};

/***********************************************************************
* Utilities
***********************************************************************/
var _ = {
    ffff: "\uffff",
    __: "    ",
    repr: function( val ) {
        /**:jDoctest._repr( val )

        Represents a value.

            >>> jDoctest._repr( undefined );
            >>> jDoctest._repr( [] );
            '[]'
            >>> jDoctest._repr( [1, 2, 3] );
            '[1, 2, 3]'
            >>> jDoctest._repr( "Hello, world!" );
            '\'Hello, world!\''
            >>> jDoctest._repr( "It's my world!" );
            '\'It\\\'s my world!\''
            >>> jDoctest._repr( ["It's my world!"] );
            '[\'It\\\'s my world!\']'
            >>> jDoctest._repr( jDoctest.flags.SKIP );
            '<jDoctest.flags.SKIP>'
        */
        if ( val === undefined ) {
            return val;
        } else if ( $.isArray( val ) ) {
            var reprs = [];
            for ( var i = 0; i < val.length; i++ ) {
                reprs.push( _.repr( val[ i ] ) );
            }
            return "[" + reprs.join( ", " ) + "]";
        } else if ( typeof val === "string" ) {
            return "'" + val.replace( /('|\\)/g, "\\$1" ) + "'";
        }
        return String( val );
    },
    indent: function( indent, text ) {
        /**:jDoctest._indent( indent, text )

        Adds an indent to each lines.

            >>> jDoctest._indent( "abc" );
            '    abc'
            >>> jDoctest._indent( " ", "abc" );
            ' abc'
            >>> print( jDoctest._indent( " ", "abc\ndef" ) );
             abc
             def
        */
        if ( text === undefined ) {
            text = indent;
            indent = _.__;
        }
        return text.replace( /^/mg, indent );
    },
    unindent: function( indent, text ) {
        /**:jDoctest._unindent( indent, text )
        
        Removes an indent from each lines.
        */
        indent = new RegExp( "^" + indent, "mg" );
        return text.replace( indent, "" );
    },
    linearize: function( text ) {
        return text.replace( /\n/g, _.ffff );
    },
    unlinearize: function( line ) {
        return line.replace( new RegExp( _.ffff, "g" ), "\n" );
    },
    escapeRegExp: function( text ) {
        /**:jDoctest._escapeRegExp( text )

            >>> print( jDoctest._escapeRegExp( "/.*+?|" ) );
            \/\.\*\+\?\|
        */
        var specials = [
                "/", ".", "*", "+", "?", "|", "$",
                "(", ")", "[", "]", "{", "}", "\\"
            ],
            r = new RegExp( "(\\" + specials.join( "|\\" ) + ")", "g" );
        return text.replace( r, "\\$1" );
    },
    mockConsole: {
        /**:jDoctest._mockConsole

        It has methods named ``log``, ``warn``, ``error``, and ``dir``. All
        methods do not anything. jDoctest uses it instead of ``window.console``
        in IE6 or Firefox without FireBug. Because ``window.console`` object
        is not available in there.

            >>> jDoctest._mockConsole.log === jDoctest._mockConsole.warn;
            true
            >>> jDoctest._mockConsole.log === jDoctest._mockConsole.error;
            true
            >>> jDoctest._mockConsole.log === jDoctest._mockConsole.dir;
            true
            >>> !!/\{\s*\}/.exec( String( jDoctest._mockConsole.log ) );
            true
            >>> jDoctest.Runner.prototype.options.console !== undefined;
            true
        */
        toString: function() {
            return "<jDoctest._mockConsole>";
        }
    }
};

// Use the console locally. If the console is not avaliable, use the mock
// console.
var console, empty = function() {};
_.mockConsole.log = _.mockConsole.warn = empty;
_.mockConsole.error = _.mockConsole.dir = empty;
if ( window.console === undefined ) {
    console = _.mockConsole;
} else {
    console = window.console;
}

// Exports utilities
for ( var meth in _ ) {
    j[ "_" + meth ] = _[ meth ];
}

/***********************************************************************
* Parser
***********************************************************************/
j.Parser = function( symbols ) {
    /**class:jDoctest.Parser( symbols )

    A parser to catch docstrings and interactive examples.

    You could specify doc-prefix or doc-suffix or prompt symbols using
    ``symbols`` argument:

        >>> var myParser = new jDoctest.Parser({
        ...     docPrefix: "/*+",
        ...     docSuffix: "+*" + "/"
        ... });

    ``myParser`` has differant symbols. It executes like:

        >>> var src = "this is not a docstring.\n" +
        ...     "/*+ this is a docstring +*" + "/\n" +
        ...     "/** this is not a docstring *" + "/\n" +
        ...     "/** this is not a docstring also *" + "/";
        >>> var doctests = myParser.getDoctests( src );
        >>> doctests.length;
        1
    */
    this.symbols = $.extend( {}, this.symbols, symbols );

    this.docStringRegex = new RegExp([
        /*
        (?:^|\uffff) # start of a line
        (\s*) # indent
        \/\*\* # docPrefix
        (?:
            ([^*:]*) # directive
            \:\s*
            ([^\uffff]+) # name
            | [^*]
        )
        (.*?)
        \*\/ # docSuffix
        */
        "(?:^|" + _.ffff + ")(\\s*)",
        _.escapeRegExp( this.symbols.docPrefix ),
        "(?:([^*:]*)\\:\\s*([^" + _.ffff + "]+)|[^*])(.*?)",
        _.escapeRegExp( this.symbols.docSuffix )
    ].join( "" ), "gm" );
    this.interactionRegex = new RegExp([
        //^\s*(>>>.+)(?:\n^\s*(\.\.\..+)$)*
        "^\\s*(",
        _.escapeRegExp( this.symbols.prompt ),
        ".+)(?:\\n^\\s*(",
        _.escapeRegExp( this.symbols.continued ),
        ".+)$)*"
    ].join( "" ), "gm" );
};
j.Parser.prototype = {
    symbols: {
        docPrefix: "/**",
        docSuffix: "*/",
        directiveSuffix: ":",
        prompt: ">>>",
        continued: "..."
    },

    getExamples: function( docString, lineNo ) {
        /**:jDoctest.Parser.prototype.getExamples( docString )

        Returns :class:`jDoctest.Example`s from a docstring.

            >>> var src = "asdfasdfsdf\n" +
            ... "sadfasdf\n" +
            ... "\n" +
            ... "  $ asfsdf;\n" +
            ... "  > 12312;\n" +
            ... "  > function() {\n" +
            ... "  >   return '123123';\n" +
            ... "  > }\n" +
            ... "  123123\n" +
            ... "  $ gggggggg;\n" +
            ... "  213123\n";
            >>> var parser = new jDoctest.Parser({
            ...     prompt: "$",
            ...     continued: ">"
            ... });
            >>> var examples = parser.getExamples( src );
            >>> examples.length;
            2
            >>> print( examples[ 0 ].source );
            asfsdf;
            12312;
            function() {
              return '123123';
            }
            >>> examples[ 0 ].want;
            '123123'
            >>> examples[ 1 ].source;
            'gggggggg;'
            >>> examples[ 1 ].want;
            '213123'
        */
        lineNo = parseInt( lineNo || 1 );
        var relLineNo,
            line,
            docLines = docString.split( "\n" ),
            examples = [],
            example = {
                source: [],
                want: []
            },
            indent,
            e = _.escapeRegExp,
            R = RegExp,
            promptRegex = new R( "^(\\s*)" + e( this.symbols.prompt + " " ) ),
            continuedRegex,
            wantRegex,
            blankRegex = /^\s*$/,
            match,
            is = {
                source: false,
                want: false
            };

        function saveExample( relLineNo ) {
            var source, want, exam;
            source = example.source.join( "\n" );
            if ( example.want.length ) {
                want = example.want.join( "\n" );
            } else {
                want = undefined;
            }
            exam = new j.Example( source, want, lineNo + relLineNo );
            examples.push( exam );
            is.source = is.want = false;
            example.source = [];
            example.want = [];
        }

        for ( var i = 0; i < docLines.length; i++ ) {
            line = docLines[ i ];

            if ( match = promptRegex.exec( line ) ) {
                // Handles a line which starts with ``>>> ``
                if ( is.source || is.want ) {
                    saveExample( relLineNo );
                }
                is.source = true;
                relLineNo = i;
                indent = match[ 1 ];
                continuedRegex = new R(
                    "^" + e( indent + this.symbols.continued + " " )
                );
                wantRegex = new R( "^" + e( indent ) + "(.+)$" );
                line = line.replace( promptRegex, "" );

            } else if ( is.source && continuedRegex.exec( line ) ) {
                // Handles a line which starts with ``... ``
                line = line.replace( continuedRegex, "" );
            } else if ( is.source || is.want ) {
                if ( match = wantRegex.exec( line ) ) {
                    // Handles an output
                    is.want = true;
                    is.source = false;
                    line = match[ 1 ];
                } else if ( blankRegex.exec( line ) ) {
                    // Handles a blank line
                    saveExample( relLineNo );
                }
            }

            if ( is.source ) {
                example.source.push( line );
            } else if ( is.want ) {
                example.want.push( line );
            }
        }

        if ( is.source || is.want ) {
            saveExample( relLineNo );
        }

        return examples;
    },

    getDoctests: function( source, fileName ) {
        /**:jDoctest.Parser.prototype.getDoctests( source )

        Parses a JavaScript source and returns docstring list.

            >>> var parser = new jDoctest.Parser({
            ...     docPrefix: "/*+",
            ...     docSuffix: "+*" + "/"
            ... });
            >>> var doctests = parser.getDoctests(
            ...     "/*+ Hello, world! +*" + "/"
            ... );
            >>> doctests.length;
            1
            >>> doctests[ 0 ];
            <jDoctest (no examples)>
        */
        var doctests = [],
            doctest,
            docStrings = [],
            docString,
            docLines,
            examples,
            match,
            indent,
            name,
            l;
        // Find docstrings
        source = _.linearize( source );
        while ( match = this.docStringRegex.exec( source ) ) {
            docString = _.unindent( match[ 1 ], _.unlinearize( match[ 4 ] ) );
            l = source.slice( 0, match.index ).split( _.ffff ).length + 1;
            docStrings[ l ] = [ match[ 3 ], docString ];
        }
        // Make :class:`jDoctest` instances
        for ( l in docStrings ) {
            name = docStrings[ l ][ 0 ];
            docString = docStrings[ l ][ 1 ];
            examples = this.getExamples( docString, l );
            doctest = new jDoctest( examples, name, docString, fileName, l );
            doctests.push( doctest );
        }
        return doctests;
    }
};

/***********************************************************************
* Example
***********************************************************************/
j.Example = function( source, want, lineNo ) {
    /**class:jDoctest.Example( source, want[, lineNo ] )

    A JavaScript example.

        >>> var exam = new jDoctest.Example( "1 + 1;", "2" );
        >>> exam;
        <jDoctest.Example>
        >>> exam.source;
        '1 + 1;'
        >>> exam.want;
        '2'
        >>> exam.flags;
        []
        >>> var src = "throw new Error(); //doctest: +SKIP";
        >>> var flagedExam = new jDoctest.Example( src, undefined );
        >>> flagedExam.flags;
        [<jDoctest.flags.SKIP>]
    */
    this.source = source;
    this.want = want;
    this.flags = this._findFlags( source );
    this.lineNo = lineNo;
};
j.Example.prototype = {

    _OPTION_DIRECTIVE: /\/\/\s*doctest:\s*([^\n\'"]*)$/,

    _findFlags: function( source ) {
        /**:jDoctest.Example.prototype._findFlags( source )
        
        Returns a list of flags from a source code.

            >>> var src = "1; //doctest: +SKIP +ELLIPSIS";
            >>> var flags = jDoctest.Example.prototype._findFlags( src );
            >>> flags.indexOf( jDoctest.flags.SKIP ) >= 0;
            true
            >>> flags.indexOf( jDoctest.flags.ELLIPSIS ) >= 0;
            true
            >>> flags.indexOf( jDoctest.flags.NORMALIZE_WHITESPACE ) < 0;
            true
        */
        var match;
        
        if ( match = this._OPTION_DIRECTIVE.exec( source ) ) {
            var directive = match[ 1 ].split( /\s+/ ),
                flags = [],
                flagName;
            for ( var flagName in j.flags ) {
                if ( directive.indexOf( "+" + flagName ) !== -1 ) {
                    flags.push( j.flags[ flagName ] );
                }
            }
            return flags;
        } else {
            return [];
        }
    },

    toString: function() {
        return "<jDoctest.Example>";
    }
};

/***********************************************************************
* OutputChecker
***********************************************************************/
j.OutputChecker = {
    /**attribute:jDoctest.OutputChecker

    The default output checker. Every output checkers must have ``checkOutput``
    method.
    */
    checkOutput: function( want, got, flags ) {
        /**:jDoctest.OutputChecker.checkOutput( want, got, flags )
        
        Checks if got output matched to wanted output.

            >>> var checker = jDoctest.OutputChecker;
            >>> checker.checkOutput( "1", "1" );
            true
            >>> checker.checkOutput( "2", "1" );
            false

        If some matching flags in ``flags``, that will be called. And if the
        result is a ``true``, it returns ``true`` also. Otherwise it returns
        just ``false``.

            >>> checker.checkOutput( "a...f", "asdf", [
            ...     jDoctest.flags.ELLIPSIS
            ... ]);
            true
        */
        if ( want === got ) {
            return true;
        }

        var flag, flagResult;

        for ( var i = 0; flags && i < flags.length; i++ ) {
            flag = flags[ i ];
            if ( $.isFunction( flag ) ) {
                flagResult = flag( want, got );
                if ( typeof flagResult === "object" ) {
                    want = flagResult.want;
                    got = flagResult.got;
                    flagResult = flagResult.matched;
                }
                if ( flagResult === true ) {
                    return true;
                }
            }
        }

        return false;
    }
};

/***********************************************************************
* Runner
***********************************************************************/
j.Runner = function( result, options ) {
    /**class:jDoctest.Runner( result[, options ] )

    The runner is used to run a doctest.

        >>> var result = {}, done = false;
        >>> var doctest = new jDoctest([
        ...     new jDoctest.Example( "1;", "1" ),
        ...     new jDoctest.Example( "0; //doctest: +SKIP", "1" ),
        ...     new jDoctest.Example( "0;", "1" ),
        ... ]);
        >>> var runner = new jDoctest.Runner( result, {
        ...     onComplete: function() { done = true; },
        ...     console: jDoctest._mockConsole
        ... });

    It will update ``result`` object which is given. ``result`` is extended to
    have arrays named tries, successes, failures, and skips.

        >>> result.tries.length;
        0
        >>> runner.run( doctest );

    When all test done ``result``'s arrays is also updated.

        >>> wait(function() { return done; });
        >>> result.tries.length;
        2
        >>> result.successes.length;
        1
        >>> result.failures.length;
        1
    */
    this.result = $.extend( result || {}, {
        tries: [],
        successes: [],
        failures: [],
        skips: []
    });
    this.options = $.extend( {}, this.options, options );
    this.checker = this.options.checker;
    this.console = this.options.console;
    this._tasks = [];
    this._running = {
        stopped: true,
        timer: null,
        doctest: null
    };
};
j.Runner.prototype = {
    _mergeFlags: $.merge,

    options: {
        onComplete: undefined,
        checker: j.OutputChecker,
        verbose: false,
        flags: [],
        console: console
    },

    // Reporting functions
    reportStart: function( exam ) {
        if ( this.options.verbose ) {
            var msg = [
                "Trying:",
                _.indent( exam.source ),
            ];
            if ( exam.want === undefined ) {
                msg.push( "Expecting nothing" );
            } else {
                msg.push( "Expecting:" );
                msg.push( _.indent( exam.want ) );
            }
            this.console.log( msg.join( "\n" ) );
        }
    },
    reportSuccess: function( exam, got ) {
        if ( this.options.verbose ) {
            this.console.log( "ok" );
        }
    },
    reportFailure: function( exam, got ) {
        var doctest = this.getCurrentDoctest(),
            msg = [
                "File " + doctest.fileName + ", line " + exam.lineNo,
                "Failed example:",
                _.indent( exam.source )
            ];
        if ( exam.want === undefined ) {
            msg.push( "Expected nothing" );
        } else {
            msg.push( "Expected:" );
            msg.push( _.indent( exam.want ) );
        }
        if ( got === undefined ) {
            msg.push( "Got nothing" );
        } else {
            msg.push( "Got:" );
            msg.push( _.indent( got ) );
        }
        msg = msg.join( "\n" );
        this.console.error( msg );
    },
    reportError: function( exam, error ) {},
    reportFinally: function() {
        var msg = "";
        if ( this.options.verbose ) {
            msg += this.result.successes.length + " passed";
        }
        if ( this.result.failures.length ) {
            if ( this.options.verbose ) {
                msg += " and " + this.result.failures.length + " failed.\n";
            }
            msg += "***Test Failed*** " + this.result.failures.length;
            msg += " failures.";
            console.warn( msg );
        } else if ( msg ) {
            msg += ".";
            console.log( msg );
        }
    },

    run: function( doctest ) {
        /**:jDoctest.Runner.prototype.run( [ doctest ] )

        This method registers a doctest to its task list first. And runs
        tasks::

            var runner = new jDoctest.Runner({});
            var doctest = new jDoctest();
            runner.run( doctest );

        Or::

            var runner = new jDoctest.Runner({});
            var doctest = new jDoctest();
            runner.register( doctest );
            runner.run();
        */
        if ( doctest instanceof jDoctest ) {
            this.register( doctest );
        }
        clearTimeout( this._running.timer );
        this._running.timer = setTimeout( $.proxy(function() {
            this._run();
        }, this ), 0 );
    },

    register: function( doctest ) {
        /**:jDoctest.Runner.prototype.register( doctest )

        Register a doctest to the task list.
        */
        this._tasks.push( doctest );
        for ( var i = 0; i < doctest.examples.length; i++ ) {
            this._tasks.push( doctest.examples[ i ] );
        }
    },

    checkExample: function( exam, got ) {
        this.result.tries.push( exam );
        if ( this.checker.checkOutput( exam.want, got, exam.flags ) ) {
            this.result.successes.push( exam );
            return true;
        } else {
            this.result.failures.push( exam );
            return false;
        }
    },

    runDoctest: function( doctest ) {
        // pass...
    },

    runExample: function( exam, doctest ) {
        try {
            var got = this.getOutput( exam.source ),
                succeeded = this.checkExample( exam, got );
            if ( succeeded ) {
                this.reportSuccess( exam );
            } else {
                this.reportFailure( exam, got );
            }
        } catch ( error ) {
            if ( error instanceof j.errors.StopRunning ) {
                this.reportSuccess( exam );
                this.stop();
            } else {
                this.reportError( exam, error );
            }
        }
    },

    runFinally: function() {
        this.reportFinally();
    },

    _run: function() {
        if ( !this._tasks.length ) {
            return;
        }
        var exam = this._tasks.shift(),
            runner = this,
            flag,
            check;
        if ( exam instanceof jDoctest ) {
            this._running.doctest = exam;
            this.runDoctest( exam );
            return this._run();
        }
        this._running.stopped = false;

        for ( var i = 0; i < exam.flags.length; i++ ) {
            flag = exam.flags[ i ];
            if ( flag.prototype instanceof j.Runner ) {
                runner = new flag( this );
            }
        }

        runner.reportStart( exam );

        function test( exam ) {
            this.runExample( exam, this.getCurrentDoctest() );
            return !this._running.stopped;
        }

        if ( test.call( runner, exam ) ) {
            if ( this._tasks.length ) {
                this._run();
            } else {
                if ( $.isFunction( this.options.onComplete ) ) {
                    this.options.onComplete.call( this, this.result );
                }
                this.runFinally();
            }
        }
    },

    stop: function() {
        this._running.stopped = true;
    },

    start: function() {
        this._run();
    },

    getCurrentDoctest: function() {
        return this._running.doctest;
    },

    getOutput: function( source ) {
        var got = _.repr( this.eval( source ) );
        if ( this._output ) {
            if ( got === undefined ) {
                got = this._output;
            } else {
                got = this._output + "\n" + got;
            }
            delete this._output;
        }
        return got;
    },

    eval: function( source ) {
        var origVals = {},
            varName,
            replVal,
            result;
        for ( varName in this.context ) {
            origVals[ varName ] = window[ varName ];
            replVal = this.context[ varName ];
            if ( $.isFunction( replVal ) ) {
                replVal = $.proxy( replVal, this );
            }
            window[ varName ] = replVal;
        }
        try {
            result = window.eval.call( window, source );
        } catch ( error ) {
            if ( error instanceof j.errors.StopRunning ) {
                throw error;
            }
            result = error;
        }
        for ( varName in origVals ) {
            window[ varName ] = origVals[ varName ];
        }
        return result;
    },

    context: {
        /**:jDoctest.Runner.prototype.context

        The object that has special functions. They are helpers for examples.
        Its functions are exist when only examples running.
        */
        wait: function( delay ) {
            /**:jDoctest.Runner.prototype.context.wait( delay )

            ``delay`` is miliseconds or a function. If ``delay`` is
            miliseconds, the running process will wait for the miliseconds.

                >>> var t = new Date();
                >>> wait( 1000 );
                >>> (new Date()).getTime() - t.getTime() >= 5;
                true

            If ``delay`` is a function, the running process will pause while
            the function returns ``false``.

                >>> var v = false;
                >>> setTimeout(function() {
                ...     v = true;
                ... }, 10 ) && undefined;
                >>> v;
                false
                >>> v;
                false
                >>> v;
                false
                >>> wait(function() { return v; });
                >>> v;
                true
            */
            var runner = this;
            if ( typeof delay === "number" ) {
                setTimeout(function() {
                    runner.start();
                }, delay );
            } else if ( $.isFunction( delay ) ) {
                var check = function() {
                    if ( delay() ) {
                        runner.start();
                    } else {
                        setTimeout( check, 10 );
                    }
                };
                check();
            }
            throw new j.errors.StopRunning();
        },

        print: function( output ) {
            /**:jDoctest.Runner.prototype.context.print( output )

            Prints a string. The output does not contain quotaions(``'``) or
            escaped characters(``\n``).

                >>> print( "a\nb\nc" );
                a
                b
                c

            The output is before of the returned value.

                >>> for ( var i = 0; i < 20; i++ ) {
                ...     print( i + "." );
                ... }
                ... "done";
                0.1.2.3.4.5.6.7.8.9.10.11.12.13.14.15.16.17.18.19.
                'done'
            */
            if ( typeof output !== "string" ) {
                throw new TypeError( "output must be a string." );
            }
            this._output = this._output || "";
            this._output += output;
        }
    }
};
j.Runner.extend = function( prototype ) {
    /**:jDoctest.Runner.extend( prototype )

    Makes a new runner class which extends :class:`jDoctest.Runner`. The new
    runner's constructor needs an other :class:`jDoctest.Runner` instance. It
    shares some attributes with the other runner.

        >>> var MyRunner = jDoctest.Runner.extend({
        ...     reportStart: function() {
        ...         this.result.foo = "bar";
        ...         print( "MY RUNNER!" );
        ...     }
        ... });
        >>> var result = {};
        >>> var runner = new jDoctest.Runner( result );
        >>> var myRunner = new MyRunner( runner );
        >>> myRunner instanceof MyRunner;
        true
        >>> myRunner instanceof jDoctest.Runner;
        true
        >>> myRunner.reportStart();
        MY RUNNER!
        >>> myRunner.result.foo;
        'bar'
        >>> runner.result.foo;
        'bar'
    */
    var newRunner = function( runner ) {
        this.result = runner.result;
        this.checker = runner.checker;
        this.verbose = runner.verbose;
        this.flags = runner.flags;
        this.console = runner.console;
        this._running = runner._running;
    };
    newRunner.prototype = new j.Runner();
    $.extend( newRunner.prototype, prototype );
    return newRunner;
};

/***********************************************************************
* Flags
***********************************************************************/
j.flags = {
    SKIP: j.Runner.extend({
        /**class:jDoctest.flags.SKIP( runner )

        If an example has it as flag, the main runner passes the example.

            >>> var result = {};
            >>> var runner = new jDoctest.Runner( result, {
            ...     onComplete: function() { done = true; },
            ...     console: jDoctest._mockConsole
            ... });
            >>> var doctest = new jDoctest([
            ...     new jDoctest.Example( "1 + 1; //doctest: +SKIP" )
            ... ]);
            >>> var done = false;
            >>> runner.run( doctest );
            >>> wait(function() { return done; });
            >>> result.tries.length;
            0
            >>> result.failures.length;
            0
        */
        checkExample: function() {
            // skip...
            return true;
        },
        reportStart: function() {
            // skip...
        }
    }),
    NORMALIZE_WHITESPACE: function( want, got ) {
        /**:jDoctest.flags.NORMALIZE_WHITESPACE( want, got )

            >>> var want = "a  b  \t  c  \n  d";
            >>> var got = "a b\n\n\n\t\t\t\n\nc                  d";
            >>> var flag = jDoctest.flags.NORMALIZE_WHITESPACE;
            >>> var flagResult = flag( want, got );
            >>> flagResult.want;
            'a b c d'
            >>> flagResult.got;
            'a b c d'
            >>> flagResult.matched;
            true
        */
        want = want.split( /\s+/gm ).join( " " );
        got = got.split( /\s+/gm ).join( " " );
        return {
            want: want,
            got: got,
            matched: want === got
        };
    },
    ELLIPSIS: function( want, got ) {
        /**:jDoctest.flags.ELLIPSIS( want, got )

            >>> var want = "j...t";
            >>> jDoctest.flags.ELLIPSIS( want, "jDoctest" );
            true
            >>> jDoctest.flags.ELLIPSIS( want, "Jdoctest" );
            false
        */
        var e = _.escapeRegExp,
            ellipsis = new RegExp( e( e( "..." ) ), "g" );
            pattern = new RegExp( e( want ).replace( ellipsis, ".*?" ) );
        return !!pattern.exec( _.linearize( got ) );
    }
};

// Adds a stringifing method for flags
for ( var flagName in j.flags ) {
    j.flags[ flagName ].flagName = flagName;
    j.flags[ flagName ].toString = function() {
        return "<jDoctest.flags." + this.flagName + ">";
    };
}

// Exports jDoctest
return jDoctest;

})( this, window.jQuery );
