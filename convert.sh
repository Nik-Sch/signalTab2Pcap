#!/bin/bash
FILE=/home/niklas/dev/hhi/RoCEStackExamples/TestApplication/_syn/output_files/stp.csv
while :
do
  date
  cp $FILE ./stuff.csv
  npm run run
  inotifywait -e modify $FILE
  sleep 1
done
