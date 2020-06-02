#!/bin/bash
FILE=/home/niklas/dev/hhi/RoCEv2/examples/CCITest/_syn/output_files/packetSniffer.csv
while :
do
  date
  cp $FILE ./RoCETap.csv
  npm run run
  inotifywait -e modify $FILE
  sleep 1
done
