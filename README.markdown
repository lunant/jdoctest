jquery.doctest.js is a test library for jQuery projects, using conventions from Python's [doctest][] module.

Links: [Project Page][at-lab], [Repository][at-github]

What's doctest?
--------------

> The doctest module searches for pieces of text that look like interactive Python sessions, and then executes those sessions to verify that they work exactly as shown. There are several common ways to use doctest:

> - To check that a module’s docstrings are up-to-date by verifying that all interactive examples still work as documented.
> - To perform regression testing by verifying that interactive examples from a test file or a test object work as expected.
> - To write tutorial documentation for a package, liberally illustrated with input-output examples. Depending on whether the examples or the expository text are emphasized, this has the flavor of “literate testing” or “executable documentation”.


Tutorial
---------

First, let's create a javascript file called [`example.js`][example.js].


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

This script has a comment section that starts with `/**` and ends with `*/`. Write your tests within this section.

In order to test this file, run `jQuery.doctest` with the filename of the script as the argument. Since jquery.doctest.js depends on jQuery, don't forget to import jQuery first!

    <script type="test/javascript" src="jquery-1.4.1.js"></script>
    <script type="test/javascript" src="jquery.doctest.js"></script>
    <script type="test/javascript">
    // <![CDATA[
        jQuery.doctest( "example.js" );
    // ]]>
    </script>

Just like Python's doctest, jquery.doctest.js takes comment that look like REPL and executes it. For the example above, it tests if the result from evaluating `factorial( 5 );` is `5`,`factorial( 1 );` is  `1`, and `factorial( 30 );` is `2.6525285981219103e+32`.

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

Congratulations, our first example passed every test! Now here is an example of a failing test.

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

Currently, the test results are printed out to `console`; if your browser does not support `console`, you cannot check the results.

[Repository][at-github] for jquery.doctest.js is hosted at [Lunant][]'s GitHub account. You can download the source code with the following command.

    $ git clone git://github.com/lunant/jquery.doctest.js.git jquery.doctest.js

Just like [jQuery][], jquery.doctest.js is licensed with [MIT][]+[GPL2][], so feel free to use and manipulate as long as you respect these licenses.

 [at-lab]: http://lab.heungsub.net/jquery.doctest.js/
 [at-github]: http://github.com/lunant/jquery.doctest.js
 [jquery]: http://jquery.com/
 [doctest]: http://docs.python.org/library/doctest.html
 [example.js]: http://github.com/lunant/jquery.doctest.js/blob/master/tests/example.js
 [Lunant]: http://lunant.net
 [mit]: http://ko.wikipedia.org/wiki/MIT_%ED%97%88%EA%B0%80%EC%84%9C
 [gpl2]:http://ko.wikipedia.org/wiki/GNU_%EC%9D%BC%EB%B0%98_%EA%B3%B5%EC%A4%91_%EC%82%AC%EC%9A%A9_%ED%97%88%EA%B0%80%EC%84%9C#GPLv2
