# flextag-mapper-cli
[![NPM version][npm-image]][npm-url]

A command line interface for the
[flextag-mapper](https://npmjs.org/package/flextag-mapper) tool.

----

## Example
```terminal
$ cd example/hello
$ cat data.flextag
Hello World! 
Good evening Human.
$ cat default.mapspec
Good (morning|evening) ?name

Hello ?location!
$ flextag-parse data.flextag
[ { location: 'World' }, { name: 'Human' } ]
$ flextag-parse data.flextag | flextag-unparse 
Hello World! 
Good morning Human
```


[npm-image]: https://img.shields.io/npm/v/flextag-mapper-cli.svg?style=flat-square
[npm-url]: https://npmjs.org/package/flextag-mapper-cli
