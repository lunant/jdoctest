(function( $, window, undefined ) {

var Visualization = function( scripts, options ) {
        return new Visualization.fn.init( scripts, options );
    },
    self = Visualization;

Visualization.fn = Visualization.prototype = {
    init: function( scripts, options ) {
        self.instances.push( this );

        var doctestOptions = {
                test: false,
                events: {
                    described: $.proxy( this.events.described, this ),
                    success: $.proxy( this.events.success, this ),
                    failure: $.proxy( this.events.failure, this ),
                    complete: $.proxy( this.events.complete, this )
                },
                log: {
                    info: $.noop,
                    error: $.noop,
                    warn: $.noop
                }
            };

        scripts = scripts || {};

        this.id = self.id( this );
        this.options = $.extend( true, {}, this.options, options );
        this.length = 0;
        this.doctests = doctests = [];
        this.status = {
            success: [],
            failure: [],
            examples: [],
            described: 0
        };

        if ( this.options.dependencies ) {
            $.each( options.dependencies, function() {
                var script = $( "<script></script>" );
                script.attr( "src", this ).appendTo( document.body );
            });
        }

        var cls = "jquery-doctest-visualize",
            loading = '<p class="loading">Loading…</p>';

        this.elem = $( '<div id="' + this.id + '" class="' + cls + '"></div>' );
        this.elem.data( "jquery.doctest.visualization", this ).html( loading );

        $.each( scripts, $.proxy(function( script, options ) {
            options = $.extend( true, {}, doctestOptions, options );
            doctests.push( $.doctest( script, options ) );
            this.length++;
        }, this ) );
    },

    prepare: function() {
        var doctests = [],
            struct = function( ref, children ) {
                var st = {
                    id: self.id( ref ),
                    ref: ref
                }
                if ( children !== undefined ) {
                    st.children = children;
                }
                return st;
            };

        $.each( this.doctests, function() {
            var sections = [], structure = struct( this, sections );
            structure.basename = this.name.split( "/" ).reverse()[ 0 ];
            doctests.push( structure );

            $.each( this.sections, function() {
                var parags = [];
                sections.push( struct( this, parags ) );

                $.each( this.description, function() {
                    parags.push( struct( this ) );
                });
            });
        });

        var context = {
            h: self.htmlEscape,
            doctests: doctests,
            length: this.status.examples.length,
            agent: navigator.userAgent
        };

        this.elem.html( $( ".template" ).jqote( context ) );
        self.domReady( this.elem, this );
    },

    testAll: function() {
        var s = new Date();
        $.each( this.doctests, function() {
            this.testAll();
        });
        var e = new Date();
        $( ".status .time", this.elem ).text( e.getTime() - s.getTime() );
    },

    events: {
        described: function( doctest ) {
            this.status.described++;
            var oldExamples = this.status.examples,
                newExamples = doctest.status.examples;
            this.status.examples = $.merge( oldExamples, newExamples );

            if ( this.length == this.status.described ) {
                this.prepare();
            }
        },
        test: function( example ) {
        },
        success: function( example ) {
            this.events.test( example );

            var elem = $( document.getElementById( self.id( example ) ) );
            if ( $.inArray( $.doctest.flags.SKIP, example.flags ) < 0 ) {
                elem.addClass( "success" );
            }
            this.status.success.push( example );

            this.events.got( example );
        },
        failure: function( example, error ) {
            this.events.test( example );

            $.doctest.lastError = error;

            var elem = $( document.getElementById( self.id( example ) ) );
            elem.addClass( "failure" );
            this.status.failure.push( example );

            this.events.got( example );
        },
        got: function( example ) {
            var elem = $( document.getElementById( self.id( example ) ) );
            elem.find( "dd.got pre" ).text( String( example.got ) );
        },
        complete: function( doctest ) {
            this.done = this.done || 0;
            this.done++;

            var status = doctest.status,
                id = "nav-" + self.id( doctest ),
                nav = $( document.getElementById( id ) );

            if ( !status.failure.length ) {
                nav.addClass( "success" );
            } else {
                nav.addClass( "failure" );
            }

            if ( this.done === this.length ) {
                this.events.final.call( this );
            }
        },
        final: function() {
            var but = $( ".test-all", this.elem ),
                statusElem = $( ".status", this.elem ),
                status = this.status;
            but.removeClass( "testing" ).addClass( "done" );
            but.find( "span" ).text( "Done" );
            $.each([ "success", "failure" ], function() {
                statusElem.find( "." + this ).text( status[ this ].length );
            });
        }
    },

    appendTo: function( parent ) {
        return this.elem.appendTo( parent );
    }
};

Visualization.fn.init.prototype = Visualization.fn;
Visualization.extend = Visualization.fn.extend = $.extend;

Visualization.extend({
    instances: [],

    domReady: function( wrapElem, v11n ) {
        // apply jush
        $( "pre", wrapElem ).each(function() {
            if ( v11n.options.jush ) {
                self.syntax( this );
            }
            self.prompt( this );
        });
        // add events
        $( ".test-all", wrapElem ).click(function() {
            var elem = $( this );
            elem.addClass( "testing" ).unbind( "click" );
            elem.find( "span" ).text( "Testing..." );
            v11n.testAll();
        });
    },

    prompt: function( elem ) {
      elem = $( elem );
      if ( elem.parent().hasClass( "source" ) ) {
        var html = elem.html();
        html = html.replace( /^/, '<i class="prompt"></i>' );
        html = html.replace( /\n/g, '\n<i class="continued"></i>' );
        elem.html( html );
      }
    },

    id: function( obj ) {
        if ( obj.id !== undefined ) {
            return obj.id;
        } else if ( obj instanceof Visualization ) {
            return "jquery-doctest-visualize-" + this.instances.length;
        } else if ( obj instanceof $.doctest ) {
            return obj.name;
        } else if ( obj instanceof $.doctest.Paragraph ) {
            return this.id( obj.doctest ) + ":" + obj.lineNo;
        }
    },

    htmlEscape: function( str ) {
        var translate = {
            '&': "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;"
        };
        str  = String( str || "" );
        for ( var escapee in translate ) {
            var r = new RegExp( escapee, "g" );
            str = str.replace( r, translate[ escapee ] );
        }
        return str;
    }
});

$.doctest.extend({
    visualize: Visualization
});

})( jQuery, this );
