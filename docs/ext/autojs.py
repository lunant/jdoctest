import os
import os.path
import re
from docutils import nodes
from docutils.statemachine import ViewList
from sphinx.util.compat import Directive
from sphinx.util.nodes import nested_parse_with_titles


class Paragraph(object):

    def __init__(self, body="", indent=""):
        self.body, self.indent = [body], indent

    def __iadd__(self, more_body):
        self.body.append(more_body)
        return self

    def __iter__(self):
        return (self.indent + line for line in self.body)

    def shift(self, indent=""):
        for line in self:
            yield indent + line

    def __repr__(self):
        return "\n".join(self.body)

    def to_rst(self):
        return list(self)


class Examples(Paragraph):

    LEXER_ALIAS = "jscon"

    def to_rst(self):
        BLANK, INDENT = "", "   "
        lines = [BLANK, "{0}.. sourcecode:: {1}".format(self.indent,
                                                        self.LEXER_ALIAS),
                 BLANK]
        for line in self.shift(INDENT):
            lines.append(line)
        lines.append(BLANK)
        return lines

class Comment(Paragraph):

    def to_rst(self):
        return [""] + list(self)


class JavaScript(object):

    START = "/**"
    END = "*/"
    PROMPT = ">>> "
    CONTINUED = "... "
    INDENT = re.compile(r"^\s*")

    def __init__(self, path):
        self.path = path
        self.file = open(path)

    def describe(self):
        is_item = False
        is_title = False
        was_want = False
        para = None
        indent = None
        for line in self.file:
            nude = line.strip()
            docline = line.strip()
            if nude.startswith(self.START):
                is_item = True
                is_title = True
                indent = self.INDENT.match(line).group(0)
                indent_pattern = re.compile("^" + indent)
                docline = docline.replace(self.START, "").lstrip()
                indent_addition = "   " if docline.strip() else ""
            if is_item:
                shift = indent_addition if not is_title else ""
                docline = docline.replace(self.END, "").rstrip()
                docline = indent_pattern.sub(shift, docline)
                if nude.startswith(self.PROMPT) or \
                   nude.startswith(self.CONTINUED):
                    if isinstance(para, Examples):
                        para += docline
                    else:
                        if isinstance(para, Comment):
                            yield para
                        para = Examples(docline, shift)
                elif isinstance(para, Examples):
                    if not nude:
                        yield para
                        para = None
                    else:
                        para += docline
                elif not nude and isinstance(para, Paragraph):
                    yield para
                    para = None
                else:
                    if isinstance(para, Comment):
                        para += docline
                    else:
                        para = Comment(docline, shift)#, indent)
                is_title = False
            if nude.endswith(self.END):
                is_item = False
                if isinstance(para, Paragraph):
                    yield para
                    para = None

    def to_rst(self):
        lines = []
        for para in self.describe():
            for line in para.to_rst():
                lines.append(line)
        return lines


class AutoJavaScript(Directive):

    START = "/**"
    END = "*/"
    PROMPT = ">>> "
    CONTINUED = "... "
    INDENT = re.compile(r"^\s*")

    required_arguments = 1

    def add_line(self, line):
        self.result.append(line, "<autojs>")

    def add_lines(self, lines):
        if isinstance(lines, basestring):
            lines = lines.split("\n")
        for line in lines:
            self.add_line(line)

    def run(self):
        self.result = ViewList()
        path = self.arguments[0]
        filename = os.path.basename(path)
        node = nodes.section()
        node.document = self.state.document
        self.add_lines(JavaScript(path).to_rst())
        nested_parse_with_titles(self.state, self.result, node)
        return node.children

def setup(app):
    app.add_directive('autojs', AutoJavaScript)

if __name__ == "__main__":
    for line in JavaScript("../doctest/doctest.js").to_rst():
        print line
