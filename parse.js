#!/usr/bin/env node
const jsonic = require('jsonic')
const streamString = require('stream-string')
const readFile = require('fs-readfile-promise')
const yargs = require('yargs')
const fs = require('fs')
const { Mapper } = require('flextag-mapper')
const tty = require('tty')

yargs
  .help()
  .usage('$0 [options] input-data')
  .option('mapspec', {
    alias: 'm',
    describe: 'file to read for the mapper spec templates'
  })
  .default('mapspec', 'default.mapspec')
  .option('json', {
    alias: 'j',
    describe: 'output indented JSON'
  })
  .option('trace', {
    alias: 't',
    describe: 'output at parse time'
  })
  .option('console', {
    alias: 'l',
    describe: 'output like console.log'
  })
  .option('compact', {
    alias: 'c',
    describe: 'output compact one-line JSON'
  })
  .option('jsonic', {
    alias: 's',
    describe: 'use jsonic.stringify for output'
  })
  .argv
const argv = yargs.argv

async function main() {
  const mapper = await loadMapper()
  let str,obj
  let source = process.stdin
  let filename = argv._.shift()
  if (filename) {
    source = fs.createReadStream(filename)
  }

  if (source.isTTY) {
    console.log('(waiting for user input)')
  }

  try {
    str = await streamString(source)
  } catch (e) {
    console.error('Error reading input:', e)
    return
  }

  /*
  try {
    obj = await jsonic(str)
  } catch (e) {
    console.error('jsonic error: ', e)
    return
  }
  */
  obj = []
  if (argv.trace) {
    mapper.parse(str, b => {
      console.log(b)
    })
  } else {
    mapper.parse(str, b => obj.push(b))
  }
  
  let out
  if (argv.jsonic) {
    out = jsonic.stringify(obj)
  } else if (argv.compact || argv.json) {
    out = JSON.stringify(obj, null, argv.compact ? 0 : 2)
  }
  if (out) {
    process.stdout.write(out)
    process.stdout.write('\n')
  } else {
    console.log('%O', obj)
  }
}

async function loadMapper () {
  const filename = argv.mapspec
  // alas fs.promises gives a warning still after all these years
  try {
    const bytes = await readFile(filename, 'utf8') 
    const mapper = new Mapper(bytes)
    return mapper
 } catch (e) {
    console.error(e.message)
    process.exit(1)
  }
}

main()
