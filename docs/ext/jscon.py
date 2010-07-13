from pygments.lexers import JavascriptLexer, LEXERS
from pygments.token import *


__all__ = ["JavascriptConsoleLexer", "setup"]


class JavascriptConsoleLexer(JavascriptLexer):
    """For Javascript console output or doctests, such as:

    .. sourcecode:: jscon

        >>> var a = "foo";
        >>> a;
        foo
        >>> 1 / 0;
        Infinity
    """

    name = "Javascript console session"
    CONSOLE_RULES = [(r"(>>>|\.\.\.) ", Generic.Prompt),
                     (r"\[object Object\]", Generic.Output),
                     (r"\$|jQuery", Name.Class), # for jQuery
                     ]
    tokens = JavascriptLexer.tokens.copy()
    tokens["root"] = CONSOLE_RULES + tokens["root"][:]
    aliases = ["jscon"]
    mimetypes = ["text/x-javascript-doctest"]
    filenames = []
    alias_filenames = []


def setup(app):
    jscon = JavascriptConsoleLexer()
    app.add_lexer("jscon", jscon)

