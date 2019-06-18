#!/usr/bin/env node
const jsonic = require('jsonic')
const streamString = require('stream-string')
const readFile = require('fs-readfile-promise')
const yargs = require('yargs')
const fs = require('fs')
const { Mapper } = require('flextag-mapper')

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

  try {
    obj = await jsonic(str)
  } catch (e) {
    console.error('jsonic error: ', e)
    return
  }

  if (Array.isArray(obj)) {
    for (const row of obj) print(row)
  } else {
    print(obj)
  }

  function print(b) {
    let out = mapper.unparse(b)
    if (!out) {
      out = 'A JSON object with no matching flextag: '+JSON.stringify(JSON.stringify(b))
    }
    process.stdout.write(out)
    process.stdout.write('\n')
  }
}

async function loadMapper () {
  const filename = argv.mapspec
  // alas fs.promises gives a warning still after all these years
  const bytes = await readFile(filename, 'utf8')
  const mapper = new Mapper(bytes)
  return mapper
}

main()
