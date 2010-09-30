jDoctest
~~~~~~~~

.. default-domain:: js

jDoctest is an useful test library that inspired from `Python`_'s `doctest`_
module for JavaScript. No more you need separated testing or documentation
files. You need *only one file* which contains an executable source code,
documentations for reference, and testing examples.

.. _Python: http://python.org/
.. _doctest: http://docs.python.org/library/doctest.html
.. _jQuery: http://jquery.com/
.. _doctest.js: http://ianb.github.com/doctestjs

Simple Tutorial
^^^^^^^^^^^^^^^

jDoctest examines testing examples from docstrings in your source code. A
docstring is a multiline comment but it starts with ``/**``. A testing example
looks like an interactive JavaScript session:

.. sourcecode:: jscon

    >>> parseInt( "12345" );
    12345
    >>> String( 12345 );
    '12345'
    >>> for ( var i = 5; i >= 1; i-- ) {
    ...     print( i );
    ... }
    54321

Here is a small sample code. jDoctest suggests to you're JavaScript source code
to follow this structure:

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

            Request to the server to get data of this image file. When the
            request done we can get ``size`` or ``modified`` attribute.

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

Now we can execute this source, or test examples of this source. We'll skip the
excution because it is very common. Then how we can test this source? Before
test, we should save this source to a file named ``imagefile.js``. And test it:

.. sourcecode:: html

    <script src="jquery.js"></script>
    <script src="jdoctest.js"></script>
    <script>
      jDoctest.testSource( "imagefile.js" );
    </script>

By default, jDoctest reports using ``console.log``, ``console.warn``, and
``console.error``. Watch the console output of your browser! Is there no any
outputs? Don't worry. It means the test is succeeded. jDoctest reports only
failures by default. We can get all reporting using ``verbose`` option:

.. sourcecode:: js

    jDoctest.testSource( "imagefile.js", {
        verbose: true
    });

Then jDoctest reports:

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
        21618
    ---------------------------------------------
    ok
    ---------------------------------------------
    4 passed.

Let's make a failed example. Already our tests have a failed example but it is
just skipped:

.. sourcecode:: jscon

    >>> img.modified; //doctest: +SKIP

This example has the :meth:`jDoctest.flags.SKIP` flag(``//doctest: +SKIP``) to
the example be skipped. If the flag is removed, we can get a failure:

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

The failure has the file name and the line number. We could debug with this
informations.

With QUnit
^^^^^^^^^^

`QUnit`_ is a powerful test suite that used by jQuery's official projects.
jDoctest provides an extension for testing with QUnit. 

The extension is very easy to use. Just load ``jdoctest-qunit.js`` and run
:meth:`jDoctest.testWithQUnit` on the QUnit template:

.. sourcecode:: html

    <html>
    <head>
      <title>jDoctest testing with QUnit</title>
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

This page works like:

.. figure:: _static/qunit-example.png
   :alt: The screenshot of jDoctest with QUnit test suite

The result is so beatiful and readable than default ``console`` outputs. We can
test using jDoctest-QUnit instead of vanilla jDoctest.

.. _QUnit: http://docs.jquery.com/qunit

Functions that help an Example
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

You might see ``wait`` and ``print`` function. When each examples are running
these functions are global functions. The functions help you to write more
powerful examples.

.. autojs:: ../jdoctest.js
   :exclude-desc:
   :members: jDoctest.Runner.prototype.context

Flags
^^^^^

There are some useful flags such as ``SKIP``.

.. autojs:: ../jdoctest.js
   :exclude-desc:
   :members: jDoctest.flags

API
^^^

.. autojs:: ../jdoctest.js
   :exclude-desc:
   :members:
   :exclude-members: jDoctest.Runner.prototype.context, jDoctest.flags
   :member-order: groupwise

