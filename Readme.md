# Signaltab 2 Pcap
converts avalon streams in exported signaltab csv files to pcap files to be viewed by wireshark.
- `npm ci`
- for each avalon stream add:
  - dval
  - sop
  - eop
  - validBytes
  - data
- storage qualifier: `OR` of dval
- trigger condition: `OR` of sop
- `File -> Export... -> *.csv`
- specify location in first line of `convert.sh`
- ./convert.sh