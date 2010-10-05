.. default-domain:: js

.. include:: ../README

.. figure:: _static/overview.png
   :alt: The overview illustration

Browser Support
===============

jDoctest supports these common browsers.

- Google Chrome
- Safari
- Firefox
- Opera

jDoctest doesn't support Internet Explorer yet, because IE's implementation of
the ``eval`` function is different from other supported browsers.

Getting jDoctest
================

The `repository`_ for jDoctest is hosted at GitHub. You can checkout the source
code with the following command.

.. sourcecode:: console

    $ git clone git://github.com/lunant/jdoctest.git jdoctest

Or download the `compressed file`_.

.. _repository: http://github.com/lunant/jdoctest
.. _compressed file:
    http://github.com/lunant/jdoctest/zipball/master#egg=jdoctest-dev

How To Use
==========

Simple Tutorial
---------------

Here is a small sample code:

.. sourcecode:: js

    var ImageFile = function( url ) {
        /**class:ImageFile( url )

        A container for an image file.

            >>> var img = new ImageFile( "_static/jdoctest.png" );
            >>> img.url;
            '_static/jdoctest.png'
        */
        this.url = String( url );
    };
    ImageFile.prototype = {
        fetchData: function() {
            /**:ImageFile.prototype.fetchData()

            Requests the server for the image file. When the request is
            complete, it also sets the ``size`` and ``modified`` attributes
            of the object.

                >>> img.fetchData();
                >>> wait(function() { return img.data; });
                >>> img.size;
                30295
                >>> img.modified; //doctest: +SKIP
                Sat Sep 25 2010 19:57:47 GMT+0900 (KST)
            */
            $.get( this.url, function( data ) {
                this.data = data;
                this.size = data.length;
                this.modified = new Date(); // Not Implemented Yet
            });
        }
    };

.. **

Now you'll notice that the sample code we've just written contains example
codes that describe the behaviours of ``ImageFile``. We should run the examples
to make sure that our implementation of ``ImageFile`` behaves as expected.

Before testing, we should save this code to a file named ``imagefile.js``. To
run the test, all we need to do is:

.. sourcecode:: html

    <script src="jquery.js"></script>
    <script src="jdoctest.js"></script>
    <script>
      jDoctest.testSource( "imagefile.js" );
    </script>

By default, jDoctest reports using ``console.log``, ``console.warn``, and
``console.error``. Watch the console output of the your browser! Is there no
output? Don't worry. It means the test ran successfully. jDoctest reports only
failures by default. We can also see the progress of the test with the
``verbose`` option:

.. sourcecode:: js

    jDoctest.testSource( "imagefile.js", {
        verbose: true
    });

jDoctest should report back:

.. sourcecode:: text

    Trying:
        var img = new ImageFile( "_static/jdoctest.png" );
    Expecting nothing
    ---------------------------------------------
    ok
    ---------------------------------------------
    Trying:
        img.url;
    Expecting:
        '_static/jdoctest.png'
    ---------------------------------------------
    ok
    ---------------------------------------------
    Trying:
        img.fetchData();
    Expecting nothing
    ---------------------------------------------
    ok
    ---------------------------------------------
    Trying:
        wait(function() { return img.data; });
    Expecting nothing
    ---------------------------------------------
    ok
    ---------------------------------------------
    Trying:
        img.size;
    Expecting:
        30295
    ---------------------------------------------
    ok
    ---------------------------------------------
    4 passed.

Let's make an example that fails. Our previous code already had a failing
example but right now it is being ignored:

.. sourcecode:: jscon

    >>> img.modified; //doctest: +SKIP

We've used :meth:`jDoctest.flags.SKIP` flag(``//doctest: +SKIP``) to ignore
this example. We'll talk more about the flags later on, but for now, we can
remove this flag to get a failing example:

.. sourcecode:: text

    ...
    ---------------------------------------------
    Trying:
        img.modified;
    Expecting:
        Sat Sep 25 2010 19:57:47 GMT+0900 (KST)
    ---------------------------------------------
    File imagefile.js, line 23
    Failed example:
        img.modified;
    Expected:
        Sat Sep 25 2010 19:57:47 GMT+0900 (KST)
    Got:
        Mon Sep 27 2010 00:40:19 GMT+0900 (KST)
    ---------------------------------------------
    4 passed and 1 failed.
    ***Test Failed*** 1 failures.

jDoctest returns the file name and the line number for each failed example. We
could use this information to debug more efficiently.

With QUnit
----------

`QUnit`_ is a powerful test suite used by jQuery's official projects.

jDoctest provides an extension for testing with QUnit. To use this extension,
load ``jdoctest-qunit.js``, setup QUnit template, and run
:meth:`jDoctest.testWithQUnit`:

.. sourcecode:: html

    <html>
    <head>
      <title>jDoctest with QUnit Test Suite</title>
      <link rel="stylesheet" type="text/css" href="qunit.css" />
      <script src="qunit.js"></script>
      <script src="jquery.js"></script>
      <script src="jdoctest.js"></script>
      <script src="jdoctest-qunit.js"></script>
    </head>
    <body>
      <h1 id="qunit-header">jDoctest with QUnit Test Suite</h1>
      <h2 id="qunit-banner"></h2>
      <div id="qunit-testrunner-toolbar"></div>
      <h2 id="qunit-userAgent"></h2>
      <ol id="qunit-tests"></ol>
      <script>
        jDoctest.testWithQUnit( "imagefile.js" );
      </script>
    </body>
    </html>

The result will look like:

.. figure:: _static/qunit-example.png
   :alt: The screenshot of jDoctest with QUnit test suite

Isn't it much more beautiful and readable than default ``console`` outputs? We
can now test using jDoctest-QUnit instead of vanilla jDoctest.

.. _QUnit: http://docs.jquery.com/qunit

How It Works
============

jDoctest examines docstrings in your source code to find testable examples.
You'll need to write your tests within the source code.

What's a Docstring?
-------------------

A docstring is a multiline comment that starts with ``/**``. The JavaScript
comment below is a docstring. You can write the description or the
detailed documentation of some function or class or anything in the docstring:

.. sourcecode:: js

    /**
    It is a docstring.
    */

.. **

Optionally, a docstring could have a subject that is started with ``:`` and
positioned behind ``/**``. A subject could accept any string, but you should
really use the function or the class' signature:

.. sourcecode:: js

    /**:Number.prototype.limit( [ min, ] max )

    If the number supplied is outside the range of ``min`` and ``max``, returns
    ``min`` or ``max``. Otherwise it returns the number.
    */

.. /**

What's a Testable Example?
--------------------------

A testable example looks like an interactive JavaScript session:

.. sourcecode:: jscon

    >>> String( 12345 );
    '12345'
    >>> for ( var i = 5; i >= 1; i-- ) {
    ...     print( i );
    ... }
    54321

It should be written in a docstring:

.. sourcecode:: js

    /**:The subject of the docstring

    Hello, You. I am a docstring. Here are some testable examples:

        >>> String( 12345 );
        '12345'
        >>> for ( var i = 5; i >= 1; i-- ) {
        ...     print( i );
        ... }
        54321
    */

.. /**

A testable example has an executable code and an expected output. An output is
a result of :func:`jDoctest.repr`. If the expected value is ``undefined``, the
output section is not needed. jDoctest will check if the expected output equals
the actual output and report the result.

Using ``<BLANKLINE>`` Token
---------------------------

A testable example doesn't contain a blank line, but what if your expected
output contains one? If you want to include a blank line in the expected
output, use ``<BLANKLINE>`` instead:

.. sourcecode:: jscon

    >>> print( "Hello,\n\nWorld!" );
    Hello,
    <BLANKLINE>
    world!

Testing with Option Flags
-------------------------

Sometimes you want to alter the default behaviour of your tests. The testing
option flags are suitable for this situation.

A single line comment that starts with ``//doctest:`` is a doctest directive.
To add an option flag, add a doctest directive and list the flags you wish to
use on the example code:

.. sourcecode:: jscon

    >>> 1 + 1; //doctest: +SKIP
    ... // This example will be skipped because of the ``SKIP`` flag.
    >>> undefined.property; //doctest: +IGNORE_ERROR_MESSAGE
    TypeError: Cannot read property 'property' of undefined

.. autojs:: ../jdoctest.js
   :exclude-desc:
   :members: jDoctest.flags

.. autojsmember:: ../jdoctest.js:jDoctest.flags
   :exclude-sig:
   :members:

Helper Functions
----------------

You might want to try using ``wait`` and ``print``. These global functions can
help you to write more powerful examples.

.. autojs:: ../jdoctest.js
   :exclude-desc:
   :members: jDoctest.Runner.prototype.context.print,
             jDoctest.Runner.prototype.context.wait

Customization
-------------

jDoctest allows customization of the every symbols such as the
docstring-prefix(``/**``), the docstring-suffix(``*/``), and the
prompt-markers(``>>>``, ``...``).

Let's assume what you want to use different symbols that ``/*DOCSTRING*`` as
the docstring-prefix, ``*DOCSTRING*/`` as the docstring-suffix, ``$`` and ``>``
as the prompt-markers. Then follow this example:

.. sourcecode:: js

    jDoctest.testSource( "source-which-contains-some-docstrings.js", {
        symbols: {
            docPrefix: "/*DOCSTRING*",
            docSuffix: "*DOCSTRING*/",
            prompt: "$",
            continued: ">"
        }
    });

If you want to customize more freely or make an extension for jDoctest, see the
API chapter that is next.

API
===

.. autojs:: ../jdoctest.js
   :exclude-desc:
   :members:
   :exclude-members: jDoctest.Runner.prototype.context, jDoctest.flags
   :member-order: groupwise

License
=======

jDoctest is licensed with `MIT`_ + `GPL2`_, so feel free to use and manipulate
as long as you respect these licenses. To get the details, see
:file:`MIT-LICENSE.txt` and :file:`GPL-LICENSE.txt`.

.. _MIT: http://en.wikipedia.org/wiki/MIT_License
.. _GPL2: http://en.wikipedia.org/wiki/GNU_General_Public_License#Version_2

Authors
-------

.. include:: ../AUTHORS

More Informations
=================

You can propose an issue to the `issues`_ page and ask some question to the
mailing list. To subscribe the mailing list, send a mail to
`jdoctest@librelist.com`_.

And there is `doctest.js`_ which is good alternative JavaScript implementation
of doctest from a different angle.

.. _issues: http://github.com/lunant/jdoctest/issues
.. _jdoctest@librelist.com: mailto:jdoctest@librelist.com
.. _doctest.js: http://ianb.github.com/doctestjs

