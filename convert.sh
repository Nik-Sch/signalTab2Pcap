#!/bin/bash
FILE=/home/niklas/dev/hhi/HWAccFW/_syn/Quartus/Nallatech_385A/flow/network.csv
while :
do
  date
  cp $FILE ./stuff.csv
  npm run run
  inotifywait -e modify $FILE
  sleep 1
done
