#!/bin/bash
while :
do
  date
  cp /home/schelten/projects/FPGA/RoCE/examples/CCITest/_syn/output_files/RoCETap.csv .
  npm run run
  inotifywait -e modify /home/schelten/projects/FPGA/RoCE/examples/CCITest/_syn/output_files/RoCETap.csv
  sleep 1
done
