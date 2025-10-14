#!/bin/sh

# by: Szwagier
# można używać, rozpowszechniać itd., tylko proszę, nie commitujcie do AInterior, bo to będzie wiadomo, że to nie wy napisaliście...

PUBLIC_IPADDR=$1
VAST_TCP_PORT_80=$2
VAST_TCP_PORT_443=$3
VAST_TCP_PORT_22=$4
VAST_TCP_PORT_5555=$5
VAST_TCP_PORT_5173=$6
VAST_TCP_PORT_8188=$7

(cat > /etc/iptables/rules.v4 && netfilter-persistent reload) <<EOF
*nat
:PREROUTING ACCEPT [0:0]
:INPUT ACCEPT [0:0]
:OUTPUT ACCEPT [0:0]
:POSTROUTING ACCEPT [0:0]
-A PREROUTING -d 188.68.242.171/32 -p tcp -m tcp --dport 80 -j DNAT --to-destination $PUBLIC_IPADDR:$VAST_TCP_PORT_80
-A PREROUTING -d 188.68.242.171/32 -p tcp -m tcp --dport 443 -j DNAT --to-destination $PUBLIC_IPADDR:$VAST_TCP_PORT_443
-A PREROUTING -d 188.68.242.171/32 -p tcp -m tcp --dport 10022 -j DNAT --to-destination $PUBLIC_IPADDR:$VAST_TCP_PORT_22
-A PREROUTING -d 188.68.242.171/32 -p tcp -m tcp --dport 5555 -j DNAT --to-destination $PUBLIC_IPADDR:$VAST_TCP_PORT_5555
-A PREROUTING -d 188.68.242.171/32 -p tcp -m tcp --dport 5173 -j DNAT --to-destination $PUBLIC_IPADDR:$VAST_TCP_PORT_5173
-A PREROUTING -d 188.68.242.171/32 -p tcp -m tcp --dport 8188 -j DNAT --to-destination $PUBLIC_IPADDR:$VAST_TCP_PORT_8188
-A POSTROUTING ! -s 188.68.242.171/24 -d $PUBLIC_IPADDR/24 -j SNAT --to-source 188.68.242.171
COMMIT
EOF