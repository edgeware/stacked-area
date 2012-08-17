.PHONY: build readme

all: example docs

build:
	rm -rf build
	mkdir build
	porter StackedGraph.js --prefix __ -o build/StackedGraph.combined.js
example:
	porter main.js -o out.js
readme:
	scripts/generate-readme
docs: readme
