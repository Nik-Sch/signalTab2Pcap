import { argv } from 'process';
import { readFileSync } from 'fs';

const sourceFile = argv[2];
const targetFile = sourceFile.replace(/\.[^.]*$/, '');
const file = readFileSync(sourceFile, {encoding: 'utf8'});
let lines = file.split('\n');

lines = lines.slice(lines.findIndex(line => {
  return line.match(/time unit:/gi) !== null;
}));

let firstRow = lines[0].split(/\s*,\s*/);
const avalons = new Set(firstRow.map((name) => {
  const match = name.match(/\|([^|.]+avalon[^|.]+)\./i);
  if (match !== null) {
    return match[1];
  }
  return '';
}));

console.log(avalons);
