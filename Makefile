SRC_DIR = doctest

PREFIX = .
DIST_DIR = ${PREFIX}/dist

BASE_FILES = ${SRC_DIR}/doctest.js \
	${SRC_DIR}/errors.js \
	${SRC_DIR}/item.js \
	${SRC_DIR}/runner.js \
	${SRC_DIR}/paragraph.js \
	${SRC_DIR}/example.js \
	${SRC_DIR}/comment.js \
	${SRC_DIR}/flags.js

MODULES = ${SRC_DIR}/intro.js \
	${BASE_FILES} \
	${SRC_DIR}/outro.js

DOCTEST = ${DIST_DIR}/doctest.js
DOCTEST_VER = `cat version.txt`
VER = sed s/@VERSION/${DOCTEST_VER}/
DATE = `git log -1 | grep Date: | sed 's/[^:]*: *//'`

all: build
	@@echo "doctest.js build complete."

${DIST_DIR}:
	@@mkdir -p ${DIST_DIR}

build: ${DIST_DIR} clear ${DOCTEST}

clear:
	rm -f ${DOCTEST}

${DOCTEST}:
	@@echo "Building" ${DOCTEST}
	@@echo "at" ${DATE}
	@@cat ${MODULES} | \
		sed s/Date:.*/"Date: ${DATE}"/ | \
		${VER} > ${DOCTEST};

