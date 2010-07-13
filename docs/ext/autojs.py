import os
from docutils import nodes
from docutils.statemachine import ViewList
from sphinx.util.compat import Directive
from sphinx.util.nodes import nested_parse_with_titles


class Paragraph(object):

    def __init__(self, body=""):
        self.body = [body]

    def __iadd__(self, more_body):
        self.body.append(more_body)
        return self

    def __iter__(self):
        return iter(self.body)

    def __repr__(self):
        return "\n".join(self.body)


class Example(Paragraph): pass
class Comment(Paragraph): pass


class AutoJavaScript(Directive):

    START = "/**"
    END = "*/"
    PROMPT = ">>> "
    CONTINUED = "... "

    required_arguments = 1

    def read(self, path):
        for line in open(os.path.join(os.curdir, path)):
            yield line

    def divide(self, lines):
        is_item = False
        para = None
        for line in lines:
            docline = nude = line.strip()
            if nude.startswith(self.START):
                is_item = True
                docline = docline.replace(self.START, "").lstrip()
            if is_item:
                docline = docline.replace(self.END, "").rstrip()
                if docline.startswith(self.PROMPT) or \
                   docline.startswith(self.CONTINUED):
                    if isinstance(para, Example):
                        para += docline
                    else:
                        if isinstance(para, Comment):
                            yield para
                        para = Example(docline)
                elif isinstance(para, Example):
                    para += docline
                    yield para
                    para = None
                else:
                    if isinstance(para, Comment):
                        para += docline
                    else:
                        para = Comment(docline)
            if nude.endswith(self.END):
                is_item = False
                if isinstance(para, Paragraph):
                    yield para
                    para = None

    def _run(self):
        for para in self.divide(self.read(self.arguments[0])):
            if isinstance(para, Example):
                para = str(para)
                node = nodes.literal_block(para, para)
                node.line = 1
                node["language"] = "jscon"
                yield node
            elif isinstance(para, Comment):
                node = nodes.paragraph()
                nested_parse_with_titles(self.state, ViewList(list(para)), node)
                yield node

    def run(self):
        return list(self._run())


def setup(app):
    app.add_directive('autojs', AutoJavaScript)
