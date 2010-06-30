(function( $, undefined ) {

var runnerId = 0,
    DoctestRunner = function( scripts, options ) {
        /** The class for a jquery.doctest.js runner instance.

        You can get runner instance using $.doctest.runner.

            >>> var runner = $.doctest.runner();
            >>> var another_runner = $.doctest.runner();

        Each runner instance has own id.

            >>> runner.id; //doctest: +ELLIPSIS
            doctest-...
            >>> runner.id === another_runner.id;
            false

            >>> runner.length;
            0
        */
        var doctestOptions = {
            test: false,
            described: $.proxy( this.events.described, this ),
            pass: $.proxy( this.events.pass, this ),
            fail: $.proxy( this.events.fail, this )
        };

        this.id = this.getRunnerId( this );

        this.scripts = scripts || [];
        this.doctests = [];
        this.options = options || {};

        if ( this.options.dependencies ) {
            for ( var i in options.dependencies ) {
                var script = $( "<script></script>" );
                script.attr( "src", options.dependencies[ i ] );
                script.appendTo( document.body );
            }
        }

        if ( this.options.domRoot ) {
            var context = $.extend( {}, window, {
                document: $.extend( {}, window.document, {
                    body: this.options.domRoot
                })
            });
            doctestOptions.context = context;
        }

        for ( var i in this.scripts ) {
            this.doctests.push( $.doctest( scripts[ i ], doctestOptions ) );
        }

        this.length = this.doctests.length;

        this.stats = {
            described: 0,
            tests: 0,
            done: 0,
            passages: 0,
            failures: 0
        };

        var cls = "jquery-doctest-runner",
            loading = '<p class="loading">Loading…</p>';

        this.elem = $( '<div id="' + this.id + '" class="' + cls + '"></div>' );
        this.elem.data( "runner", this ).html( loading );
    },
    self = DoctestRunner;

$.extend( DoctestRunner.prototype, {
    events: {
        described: function( doctest ) {
            this.stats.described++;

            if ( this.length == this.stats.described ) {
                this.prepare();
            }
        },
        pass: function( test, item ) {
            var id = this.getTestId( test, item, item.doctest );
            $( "#" + id ).addClass( "pass" );
            $( "#nav-" + this.getDoctestId( item.doctest ) ).addClass( "pass" );

            var stat = $( ".stats .pass", this.elem );
            stat.text( parseInt( stat.text() ) + 1 );

            var percent = (
                parseInt( $( ".stats .fail", this.elem ).text() ) +
                parseInt( stat.text() )
            ) / parseInt( $( ".stats .tests", this.elem ).text() ) * 100;
            $( ".stats .done", this.elem ).text( Math.round( percent ) );
        },
        fail: function( error, item ) {
            var id = this.getTestId( error.test, item, item.doctest ),
                got = String( error.got );
            $( "#" + id ).addClass( "fail" ).find( "dd.got pre" ).html( got );

            var nav = $( "#nav-" + this.getDoctestId( item.doctest ) );
            nav.addClass( "fail" ).find( "a" ).attr( "href", "#" + id );

            var stat = $( ".stats .fail", this.elem );
            stat.text( parseInt( stat.text() ) + 1 );

            var percent = (
                parseInt( $( ".stats .pass", this.elem ).text() ) +
                parseInt( stat.text() )
            ) / parseInt( $( ".stats .tests", this.elem ).text() ) * 100;
            $( ".stats .done", this.elem ).text( Math.round( percent ) );
        }
    },

    prepare: function() {
        var doctests = [],
            countOfTests = 0,
            struct = function( id, ref, children ) {
                var st = {
                    id: id,
                    ref: ref
                }
                if ( children !== undefined ) {
                    st.children = children;
                }
                return st;
            },
            isInt = function( val ) {
                return String( parseInt( val ) ) !== "NaN";
            };

        for ( var i in this.doctests ) {
            var doctest = this.doctests[ i ],
                doctestId = this.getDoctestId( doctest ),
                description = doctest.description,
                items = [];

            doctests.push( struct( doctestId, doctest, items ) );

            // each items 
            for ( var j in description ) {
                if ( !isInt( j ) ) {
                    continue;
                }
                var item = description[ j ],
                    itemId = this.getItemId( item, doctest ),
                    tests = [];

                items.push( struct( itemId, item, tests ) );

                // each tests
                for ( var k in item ) {
                    if ( !isInt( k ) ) {
                        continue;
                    }
                    if ( typeof item[ k ] === "string" ) {
                        tests.push( item[ k ] );
                    } else {
                        var test = item[ k ],
                            testId = this.getTestId( test, item, doctest );

                        tests.push( struct( testId, test ) );
                        countOfTests++;
                    }
                }
            }
        }

        var context = {
            h: self.htmlEscape,
            doctests: doctests,
            tests: countOfTests
        };

        this.elem.html( $( ".template" ).jqote( context ) );
        self.domReady( this.elem, this );
    },

    testAll: function() {
        return this.test( this.doctests );
    },

    test: function( doctests ) {
        this.step( 0, doctests || this.doctests, new Date() );
    },

    step: function( i, doctests, started ) {
        doctests[ i++ ].test();

        if ( i < doctests.length ) {
            setTimeout( $.proxy(function() {
                this.step( i, doctests, started );
            }, this ), 1 );
        } else {
            var ended = new Date(),
                time = ended.getTime() - started.getTime();
            $( ".stats .time", this.elem ).text( Math.round( time ) );
            self.done( this.elem, this );
        }
    },

    // identify methods
    getId: function( text, prefix ) {
        var escapees = /(\/|\.|#)+/g;
        text = String( text );
        prefix = prefix ? prefix + "-" : "";
        return prefix + text.replace( escapees, "" );
    },

    getRunnerId: function( runner ) {
        if ( runner.id !== undefined ) {
            return runner.id;
        } else {
            return this.getId( runnerId++, "jquery-doctest-runner" );
        }
    },

    getDoctestId: function( doctest ) {
        return this.getId( doctest.name, this.id );
    },

    getItemId: function( item, doctest ) {
        return this.getId( "item", this.getDoctestId( doctest ) );
    },

    getTestId: function( test, item, doctest ) {
        return this.getId( test.line, this.getItemId( item, doctest ) );
    },

    // element methods
    appendTo: function( elem ) {
        return this.elem.appendTo( elem );
    }
});

$.extend( DoctestRunner, {
    syntax: function( elem ) {
      $( elem ).jush( "js" );
    },
    prompt: function( elem ) {
      elem = $( elem );
      if ( elem.parent().hasClass( "code" ) ) {
        var html = elem.html();
        html = html.replace( /^/, '<i class="prompt"></i>' );
        html = html.replace( /\n/g, '\n<i class="continued"></i>' );
        elem.html( html );
      }
    },
    htmlEscape: function( str ) {
        var translate = {
            '&': "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;"
        };
        for ( var escapee in translate ) {
            var r = new RegExp( escapee, "g" );
            str = str.replace( r, translate[ escapee ] );
        }
        return str;
    },
    domReady: function( wrapElem, runner ) {
        // apply jush
        $( "pre", wrapElem ).each(function() {
            if ( runner.options.jush ) {
                self.syntax( this );
            }
            self.prompt( this );
        });
        // add events
        $( ".run-tests", wrapElem ).click(function() {
            runner.testAll();
            $( this ).addClass( "testing" );
            $( this ).html( "<span>Testing…</span>" ).unbind( "click" );
        });
    },
    done: function( wrapElem, runner ) {
        var button = $( ".run-tests", wrapElem );
        button.removeClass( "testing" ).addClass( "done" );
        button.html( "<span>Done</span>" );
    }
});

$.doctest.extend({
    runner: function( scripts, options ) {
        return new DoctestRunner( scripts, options );
    }
});

})( jQuery );
