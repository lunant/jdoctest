(function( $, undefined ) {

var doctest_visualization = function( scripts ) {
        this.doctests = [];
        this.described = 0;
        this.tests = 0;
        this.done = 0;
        this.passes = 0;
        this.failures = 0;

        for ( var i in scripts ) {
            this.doctests.push( $.doctest( scripts[ i ], {
                test: false,
                described: $.proxy( this.collect, this ),
                pass: $.proxy( this.pass, this ),
                fail: $.proxy( this.fail, this )
            }) );
        }
    },

    getDoctestId = function( doctest ) {
        var escapees = /\/|\.|#/g;
        return doctest.title.replace( escapees, "-" );
    },

    getTestId = function( test, description ) {
        return getDoctestId( description.doctest ) + "-" + test.line;
    },

    markups = {
        layout: multiline(function() {/*
          <header>
            <h><a href=""><span>jquery.doctest.js</span> Runner</a></h>
            <ul>
              <li class="secs"><span>0</span> secs</li>
              <li class="done"><span>0</span>% done</li>
              <li class="passes"><span>0</span> passes</li>
              <li class="failures"><span>0</span> failures</li>
              <li class="tests"><span>0</span> tests</li>
          </header>
          <aside>
            <form onsubmit="return false;">
              <button type="submit" disabled="disabled">Run Tests</button>
              <ul></ul>
            </form>
          </aside>
          <section class="body">
          </section>
          <footer>
            <p>Powered by
              <a href="http://j.mp/jq-doctest">jquery.doctest.js</a>
            </p>
          </footer>
        */}),

        doctest: multiline(function() {/*
          <section class="doctest">
            <h id=""></h>
            <dl class="description">
            </dl>
          </section>
        */}),

        test: multiline(function() {/*
          <dl class="test yet">
            <dt class="code">code</dt>
            <dd class="code"><code></code></dd>
            <dt class="expected">expected</dt>
            <dd class="expected"><code></code></dd>
            <dt class="got">got</dt>
            <dd class="got"><code></code></dd>
          </dl>
        */}),

        selector: multiline(function() {/*
          <li><label>
            <input type="checkbox" name="doctests" value="" checked="checked" />
            <a href=""></a>
          </label></li>
        */})
    };

$.extend( doctest_visualization.prototype, {
    collect: function( doctest ) {
        this.described++;

        if ( this.doctests.length == this.described ) {
            this.visualize();
        }
    },

    visualize: function() {
        var doctestElem, testElem, selectorElem,
            doctest, test, title, href, code,
            doctestId, testId;

        $( document.body ).html( markups.layout );

        for ( var i in this.doctests ) {
            doctest = this.doctests[ i ];
            doctestId = getDoctestId( doctest );
            title = doctest.title;
            href = "#" + doctestId;

            doctestElem = $( markups.doctest );
            doctestElem.find( "h" ).text( title ).attr( "id", doctestId );

            selectorElem = $( markups.selector );
            selectorElem.find( "input" ).attr( "value", title );
            selectorElem.find( "a" ).attr( "href", href ).text( title );

            for ( var j in doctest.description ) {
                if ( String( parseInt( j ) ) === "NaN" ) {
                    continue;
                }
                for ( var k in doctest.description[ j ] ) {
                    test = doctest.description[ j ][ k ];
                    testId = getTestId( test, doctest.description );

                    code = test.code.split( "\n" );
                    for ( var l in code ) {
                        code[ l ] = '<span class="prompt">'
                                  + (l > 0 ? "... " : ">>> ")
                                  + '</span>' + code[ l ];
                    }
                    code = code.join( "\n" );

                    testElem = $( markups.test );
                    testElem.attr( "id", testId );
                    testElem.find( "dd.code code" ).html( code );
                    testElem.find( "dd.expected code" ).text( test.expected );

                    testElem.appendTo( doctestElem );

                    this.tests++;
                }
            }

            doctestElem.appendTo( ".body" );
            selectorElem.appendTo( "aside form ul" );
        }

        $( "aside form button" ).attr( "disabled", false );
        $( "header .tests span" ).text( this.tests );

        var self = this;

        $( "aside form" ).submit( function() {
            var checked = $( this ).find( ":checked" ).serializeArray(),
                doctests = [];

            for ( var i in checked ) {
                for ( var j in self.doctests ) {
                    if ( self.doctests[ j ].title === checked[ i ].value ) {
                        doctests.push( self.doctests[ j ] );
                        break;
                    }
                }
            }

            self.test( doctests );

            return false;
        } );
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
                secs = ended.getTime() - started.getTime();
            $( "header .secs span" ).text( Math.round( secs / 100 ) / 100 );
        }
    },

    got: function( got, test, description ) {
        var percent,
            testElem = $( "#" + getTestId( test, description ) );

        testElem.removeClass( "yet" ).find( ".got code" ).text( got );

        percent = Math.round( ++this.done / this.tests * 10000 ) / 100;
        $( "header .done span" ).text( percent );

        return testElem;
    },

    pass: function( test, description ) {
        var elem = this.got( test.expected, test, description ),
            selector = $( "[value=" + description.doctest.title + "]" );
        elem.addClass( "pass" );
        selector.parents( "li" ).addClass( "pass" );
        $( "header .passes span" ).text( ++this.passes );
    },

    fail: function( error, description ) {
        var elem = this.got( error.got, error.test, description ),
            selector = $( "[value=" + description.doctest.title + "]" );
        elem.addClass( "fail" );
        selector.parents( "li" ).addClass( "fail" );
        $( "header .failures span" ).text( ++this.failures );
    }
});

$.doctest.extend({
    visualize: function( script1, script2/*, ..., scriptn */ ) {
        return new doctest_visualization( arguments );
    }
});

})( jQuery );
