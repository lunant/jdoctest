doctest.js
==========

doctest.js is a test library for `jQuery <http://jquery.com>`_ projects, using
conventions from `Python <http://python.org>`_'s `doctest
<http://docs.python.org/library/doctest.html>`_ module.

.. autojs:: ../doctest/doctest.js

What's doctest?
---------------

    The doctest module searches for pieces of text that look like interactive
    Python sessions, and then executes those sessions to verify that they work
    exactly as shown. There are several common ways to use doctest:

    * To check that a module’s docstrings are up-to-date by verifying that all
      interactive examples still work as documented.
    * To perform regression testing by verifying that interactive examples from
      a test file or a test object work as expected.
    * To write tutorial documentation for a package, liberally illustrated with
      input-output examples. Depending on whether the examples or the
      expository text are emphasized, this has the flavor of *literate testing*
      or *executable documentation*.

Tutorial
--------

First, let's create a javascript file called ``example.js``.

.. sourcecode:: javascript

    /**
    This is the "example" module.

    The example module supplies one function, factorial(). Use it like this.

        >>> factorial( 5 );
        120
    */

    function factorial( n ) {
        /**
            >>> factorial( 1 );
            1
            >>> factorial( 30 );
            2.6525285981219103e+32
        */

        if ( n < 0 ) {
            throw new Error( "n must be >= 0" );
        } else if ( Math.floor( n ) !== n ) {
            throw new Error( "n must be exact integer" );
        } else if ( n + 1 === n ) {
            throw new Error( "n too large" );
        }

        var result = 1, factor = 2;

        while ( factor <= n ) {
            result *= factor;
            factor += 1;
        }

        return result;
    }

This script has a comment section that starts with ``/**`` and ends with
``*/``. Write your tests within this section.

In order to test this file, run ``$.doctest`` with the filename of the script
as the argument. Since doctest.js depends on jQuery, don't forget to import
jQuery first!

.. sourcecode:: html

    <script src="jquery-1.4.1.js"></script>
    <script src="doctest.js"></script>
    <script>
    // <![CDATA[
        $.doctest( "example.js" );
    // ]]>
    </script>

Just like Python's doctest, doctest.js takes comment that look like REPL and
executes it. For the example above, it tests if the result from evaluating
``factorial( 5 );`` is ``5``, ``factorial( 1 );`` is ``1``, and
``factorial( 30 );`` is ``2.6525285981219103e+32``. ::

    XHR finished loading: "example.js".
    ----
    Trying:
        factorial( 5 );
    Expecting:
        120
    ok
    ----
    Trying:
        factorial( 1 );
    Expecting:
        1
    ok
    ----
    Trying:
        factorial( 30 );
    Expecting:
        2.6525285981219103e+32
    ok
    ----
    563 tests.
    3 passed and 0 failed.
    Test passed.

Congratulations, our first example passed every test! Now here is an example
of a failing test. ::

    XHR finished loading: "failed.js".
    ----
    Line 2
    Failed example:
        1 + 1 + 1 * 3;
    Expected:
        1
    Got:
        5
    ----
    Line 4
    Failed example:
        "Hello, " + " world";
    Expected:
        Hello, world
    Got:
        Hello,  world
    ----
    2 tests.
    0 passed and 2 failed.
    Test failed.

Currently, the test results are printed out to ``console``; if your browser
does not support ``console``, you cannot check the results.

`Repository <http://github.com/lunant/doctest.js>`_ for doctest.js is hosted at
`Lunant <http://lunant.net>`_'s GitHub account. You can download the source
code with the following command.

.. sourcecode:: bash

    $ git clone git://github.com/lunant/doctest.js.git doctest.js

Just like jQuery, doctest.js is licensed with
`MIT <http://en.wikipedia.org/wiki/MIT_License>`_ +
`GPL2 <http://en.wikipedia.org/wiki/GNU_General_Public_License#Version_2>`_
, so feel free to use and manipulate as long as you respect these licenses.

.. sourcecode:: jscon

    >>> $.doctest( "doctest.js" );
    [object Object]
    >>> for ( var i in [ 1, 2, 3 ] ) {
    ...     i;
    ... }
    2

    >>> var a = "foo";
    >>> a;
    foo
    >>> 1 / 0;
    Infinity

    >>> var name = document.getElementById( "name" );
    >>> name.id;
    name

    >>> name = $( "#name" );
    [object Object]
    >>> name instanceof $;
    true
    >>> name instanceof jQuery; // >>>
    true
    >>> /* >>> */ 1* 1;
    1

    >>> alert( "Hello, world!" ); //doctest: +SKIP

.. sourcecode:: python

    >>> jquery.doctest("doctest.js")
    <jquery.doctest>
    >>> for i in [1, 2, 3]:
    ...     print i
    1
    2
    3


