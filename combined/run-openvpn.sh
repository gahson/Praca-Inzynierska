#!/bin/sh

mkdir -p /dev/net
[ ! -e /dev/net/tun ] && mknod /dev/net/tun c 10 200
exec openvpn --config /etc/openvpn/client/docker-client.conf
