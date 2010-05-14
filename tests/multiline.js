/**
>>> Math.round(
...   1.111
... );
1

This is an example of jquery.doctest.js

>>> 1 +
... 1;
2

>>> "aa\n bb";
aa
 bb
*/

/**
    >>> "123";
    123
*/

        /**
    >>> "123";
    123

        >>> "123";
        123
                >>> "123";
                123
        */

/**
    >>> "ab\n\ncd";
    ab
    <BLANKLINE>
    cd

    >>> "a       b       c      d"; //doctest: +NORMALIZE_WHITESPACE
    a b
    c
      d

    >>> "Note that a similar effect can be obtained using ELLIPSIS, and IGNORE_EXCEPTION_DETAIL may go away when Python releases prior to 2.4 become uninteresting. Until then, IGNORE_EXCEPTION_DETAIL is the only clear way to write a doctest that doesn’t care about the exception detail yet continues to pass under Python releases prior to 2.4 (doctest directives appear to be comments to them). For example,"; //doctest: ELLIPSIS
    Note ... similar ... example,

*/
