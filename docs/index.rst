.. default-domain:: js

.. include:: ../README

Browser Supporting
==================

These common browsers are been supporting.

- Google Chrome
- Safari
- Firefox
- Opera

Sorry, Internet Explorer is not supported yet. Because it implements the
``eval`` function differently to the supported browsers.

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

How To Use?
===========

Simple Tutorial
---------------

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
``console.error``. Watch the console output of the your browser! Is there no
any outputs? Don't worry. It means the test is succeeded. jDoctest reports only
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
        30295
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
----------

`QUnit`_ is a powerful test suite that used by jQuery's official projects.

jDoctest provides an extension for testing with QUnit. The extension is very
easy to use. Just load ``jdoctest-qunit.js`` and run
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

How it works?
=============

jDoctest examines testing examples from docstrings in your source code. To
test the source code, you need to write them into the source code.

What's Docstring?
-----------------

A docstring is a multiline comment but it starts with ``/**``. The below
JavaScript comment is a docstring. You can write the description or the
detailed documentation of some function or class or anything in the docstring:

.. sourcecode:: js

    /**
    It is a docstring.
    */

.. **

Optionally, a docstring could have a subject that is started with ``:`` and
positioned behind ``/**``. A subject could accept any string. But the function
or class' signature is better to the subject:

.. sourcecode:: js

    /**:Number.prototype.limit( [ min, ] max )

    If the number is out of ``min`` and ``max``, returns ``min`` or ``max``.
    Otherwise it returns the number.
    */

.. /**

What's Testing Example?
-----------------------

A testing example looks like an interactive JavaScript session:

.. sourcecode:: jscon

    >>> String( 12345 );
    '12345'
    >>> for ( var i = 5; i >= 1; i-- ) {
    ...     print( i );
    ... }
    54321

These should be wrote in some docstring:

.. sourcecode:: js

    /**:The subject of the docstring

    It is a docstring. Here are testing examples:

        >>> String( 12345 );
        '12345'
        >>> for ( var i = 5; i >= 1; i-- ) {
        ...     print( i );
        ... }
        54321
    */

.. /**

A testing example has a source code and an expected output. An output is a
result of :func:`jDoctest.repr`. If the expected value is ``undefined``, the
output section is not needed. jDoctest will check if the expected output equals
to the actual output and reports the result.

Testing of a Blank Line
-----------------------

A testing example could not contain a blank line. It could be a problem when
you expect that the output contains a blank line. But there is not a problem.
jDoctest understands ``<BLANKLINE>`` as a blank line. If you want to include
a blank line in the expected output, use ``<BLANKLINE>`` instead of:

.. sourcecode:: jscon

    >>> print( "Hello,\n\nWorld!" );
    Hello,
    <BLANKLINE>
    world!

Testing Option Flags
--------------------

Sometimes you would not want to check exactly. The testing option flags are
suitable for this situation.

Some single line comment is a doctest directive that starts with
``//doctest:``. When jDoctest processes an example, it finds option flags from
the doctest directive. To add an option flag, add a doctest directive which
contains the flag modulations to the example code:

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

Functions that Help an Example
------------------------------

You might see ``wait`` and ``print`` function. When each examples are running
these functions are global functions. The functions help you to write more
powerful examples.

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

More Informations
=================

You can propose an issue to the `issues`_ page and ask some question to the
mailing list. To subscribe the mailing list, send a mail to
`jdoctest@librelist.com`_.

.. _issues: http://github.com/lunant/jdoctest/issues
.. _jdoctest@librelist.com: mailto:jdoctest@librelist.com

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

