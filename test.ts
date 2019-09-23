import { readFileSync, openSync, writeSync, closeSync } from 'fs';
import { toBigIntBE } from 'bigint-buffer'; // it's there for a reason
import { argv } from 'process';


const sourceFile = argv[2];
const targetFile = sourceFile.replace(/\.[^.]*$/, '.pcap');
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
}).filter(val => val !== ''));

const avalonObjs = [... avalons].map(name => {
  return {
    name,
    data: firstRow.findIndex(val => val.match(new RegExp(name + '\\.data', 'i')) !== null),
    sop: firstRow.findIndex(val => val.match(new RegExp(name + '\\.sop', 'i')) !== null),
    eop: firstRow.findIndex(val => val.match(new RegExp(name + '\\.eop', 'i')) !== null),
    dval: firstRow.findIndex(val => val.match(new RegExp(name + '\\.dval', 'i')) !== null),
    validBytes: firstRow.findIndex(val => val.match(new RegExp(name + '\\.validBytes', 'i')) !== null)
  };
});
// console.log(avalonObjs);

const splittedLines = lines.slice(1).map(line => line.split(/\s*,\s*/));
const avalonStreams = avalonObjs.map(avalon => splittedLines.filter(val => val[avalon.dval] === '1').map(line => {
  return {
    data: line[avalon.data],
    sop: line[avalon.sop] === '1',
    eop: line[avalon.eop] === '1',
    validBytes: parseInt(line[avalon.validBytes], 16),
    name: avalon.name,
    timestamp: parseInt(line[0])
  }
})).map((avalon, index) => {
  let data = '';
  let packets : {data: Buffer, timestamp: number, avalonIndex: number}[] = [];
  for (const cycle of avalon) {
    if (cycle.sop) {
      data = '';
    }
    if (cycle.eop) {
      data += cycle.data.substr(0, cycle.validBytes * 2);
      packets.push({
        data: Buffer.from(data, 'hex'),
        timestamp: cycle.timestamp,
        avalonIndex: index
      });
    } else {
      data += cycle.data;
    }
  }
  return packets;
});


const packets = avalonStreams.reduce((acum, cur) => acum.concat(cur), []).sort((a, b) => a.timestamp - b.timestamp);
console.log(packets);

const f = openSync(targetFile, 'w');
// $fwrite(pcapFile, "%u", {<<8{'ha1b2c3d4}}); //MAGIC NUMBER
// $fwrite(pcapFile, "%c%c", 0, 2); //VERSION MAJOR
// $fwrite(pcapFile, "%c%c", 0, 4); //VERSION MINOR
// $fwrite(pcapFile, "%u", {<<8{32'h0}}); //TIMEZONE
// $fwrite(pcapFile, "%u", {<<8{32'h0}}); //IRGENDWAS
// $fwrite(pcapFile, "%u", {<<8{32'h10000}}); //snaplen
// $fwrite(pcapFile, "%u", {<<8{32'h1}}); //snaplen
writeSync(f, Buffer.from('a1b2c3d4' + '00020004' + '0000000000000000' + '00010000' + '00000001', 'hex'));
// $fwrite(pcapFile, "%u", {<<8{timeoffset}}); // timestamp seconds
// $fwrite(pcapFile, "%u", {<<8{0}}); // timestamp microseconds
// $fwrite(pcapFile, "%u", {<<8{0}}); // number of octets of packet saved in file
// $fwrite(pcapFile, "%u", {<<8{0}}); // actual length of packet
const timestamp = 1557911730;
writeSync(f, Buffer.from(timestamp.toString(16).padStart(8, '0') + '00000000' + '00000000' + '00000000', 'hex'));

// $fwrite(pcapFile, "%u", {<<8{timeoffset + (gen_x + 1) * 100 + timestamp / 1000000}}); // timestamp seconds
// $fwrite(pcapFile, "%u", {<<8{timestamp % 1000000}}); // timestamp microseconds
// $fwrite(pcapFile, "%u", {<<8{packageLength}}); // number of octets of packet saved in file
// $fwrite(pcapFile, "%u", {<<8{packageLength}}); // actual length of packet
for (const packet of packets) {
  writeSync(f, Buffer.from((timestamp + packet.timestamp + packet.avalonIndex * 1000).toString(16).padStart(8, '0'), 'hex'));
  writeSync(f, Buffer.from('00000000', 'hex'));
  writeSync(f, Buffer.from((packet.data.length).toString(16).padStart(8, '0'), 'hex'));
  writeSync(f, Buffer.from((packet.data.length).toString(16).padStart(8, '0'), 'hex'));
  writeSync(f, packet.data);
}

closeSync(f);
