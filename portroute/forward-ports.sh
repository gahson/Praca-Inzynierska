#!/bin/sh

# by: Szwagier
# można używać, rozpowszechniać itd., tylko proszę, nie commitujcie do AInterior, bo to będzie wiadomo, że to nie wy napisaliście...

mkdir -p ~/.ssh
chmod 700 ~/.ssh

printf %s "$SSH_KEY" | tr _ '\n' | tr : ' ' > ~/.ssh/id_ed25519
chmod 600 ~/.ssh/id_ed25519

printf 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICCgHy4sJvJAkjLtr4eBW8WWVH3OMeDt91NTSQXcmaWj michal@DESKTOP-5C6GP1S' > ~/.ssh/id_ed25519.pub

printf '|1|ToRjNjAmxzhMSfIZ12o0VBRYi5I=|5B69b/+TB0AlbmMAo/wJ04euRio= ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCwH6f4mXc1hVv6VtA0eKKnOfiSgVjMle7qC1471Ipff++K9E6KF2oSNyN0CMg+IBe9RpRlBDeo4vun1qHpNRt9EVqVFfK1k+qdS+N/WpVEYPr6itqeQWVMuH7FKkV/sSBDE2TgjdixbkJJ+bqPaTEZuDUHmSL1OMEj9LT/ZphjemDg9KJ9dFfiUmJXCWQfLX3DkxM/himfu4yJvobiCY9q5ptorx4+iAihzMSsFt7aEIy6Lzb7LUr+IS5UD7ebVSc09ZHlVnzoQpqBp0H0912eGUCszaAVAW6q7IvZ03KPo0sUqJgnw25VJ4g7/NNvgLeH9bsY9Pnni+3leMz5R9n9' > ~/.ssh/known_hosts

chmod 600 ~/.ssh/known_hosts

ssh root@188.68.242.171 "/usr/local/bin/forward_ports_vps.sh $PUBLIC_IPADDR $VAST_TCP_PORT_80 $VAST_TCP_PORT_443 $VAST_TCP_PORT_22 $VAST_TCP_PORT_5555 $VAST_TCP_PORT_5173 $VAST_TCP_PORT_8188"

cat >/dev/null <<EOF
PUBLIC_IPADDR=217.63.96.43
VAST_TCP_PORT_22=30817
VAST_TCP_PORT_443=30969
VAST_TCP_PORT_5173=31733
VAST_TCP_PORT_5555=31575
VAST_TCP_PORT_80=31243
EOF

sleep $((3600 * 24))
