([원문보기][post])

바로 어제까지 야근 및 특근 릴레이를 끝나치고 짬 내어 [doctest.js][at-lab]를 만들었습니다.
doctest.js는 Python의 [doctest][] 모듈을 흉내낸 [jQuery][]용 테스트 라이브러리입니다.

바로가기: [프로젝트 페이지][at-lab], [저장소][at-github]

사용법
---------

우선 js 파일을 작성합니다. 파일명은 [`example.js`][example.js]로 할까요?

    /**
    This is the "example" module.

    The example module supplies one function, factorial().  For example,

    > factorial( 5 );
    120
    */

    function factorial( n ) {
        /**
        > factorial( 1 );
        1
        > factorial( 30 );
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

이 스크립트에는 `/**`로 시작해서 `*/`로 닫히는 주석들이 있습니다. 테스트는 그 안에 작성하면 됩니다.

테스트하기 위해 `doctest`를 실행합니다. `doctest`는 인자로 스크립트의 파일명을 받습니다. jQuery에 의존성이 있으니 미리 불러오는 것을 잊지 마세요!

    <script type="test/javascript" src="jquery-1.4.1.js"></script>
    <script type="test/javascript" src="doctest.js"></script>
    <script type="test/javascript">
    // <![CDATA[
        jQuery.doctest( "example.js" );
    // ]]>
    </script>

doctest.js는 Python의 doctest처럼 REPL로 보이는 부분을 테스트코드로 취해 실행해봅니다. 이 경우 `factorial( 5 );`의 결과가 `5`인지, `factorial( 1 );`의 결과가 `1`인지, `factorial( 30 );`의 결과가 `2.6525285981219103e+32`인지 테스트합니다.

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

모든 테스트를 통과했군요. 테스트에 실패할 경우 다음과 같이 나타납니다.

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
    Test passed.

현재 버전에서 결과 메시지는 `console`로 출력시킵니다. 따라서 `console`을 지원하지 않는 브라우저에서는 결과를 확인할 수 없습니다.

[저장소][at-github]는 GitHub에 만들어두었습니다. 다음 명령어로 소스를 내려받을 수 있습니다.

    $ git clone git://github.com/lunant/doctest.js.git doctest.js

라이센스는 [jQuery][]와 동일한 [MIT][]+[GPL2][]입니다. 라이센스를 위반하지 않는 한 자유롭게 사용하실 수 있습니다.

 [at-lab]: http://lab.heungsub.net/doctest.js/
 [at-github]: http://github.com/lunant/doctest.js
 [jquery]: http://jquery.com/
 [doctest]: http://docs.python.org/library/doctest.html
 [example.js]: http://github.com/heungsub/doctest.js/blob/master/tests/example.js
 [mit]: http://ko.wikipedia.org/wiki/MIT_%ED%97%88%EA%B0%80%EC%84%9C
 [gpl2]:http://ko.wikipedia.org/wiki/GNU_%EC%9D%BC%EB%B0%98_%EA%B3%B5%EC%A4%91_%EC%82%AC%EC%9A%A9_%ED%97%88%EA%B0%80%EC%84%9C#GPLv2

 [post]: http://the.heungsub.net/post/585748976
