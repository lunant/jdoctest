/**
This is the "example" module.

The example module supplies one function, factorial().  For example,

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

