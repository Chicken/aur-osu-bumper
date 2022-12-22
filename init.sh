#!/usr/bin/sh

sudo -u osu git config --global user.name "$GIT_USER"
sudo -u osu git config --global user.email "$GIT_EMAIL"
sudo -u osu git config --global core.sshCommand "ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -i $GIT_SSH_KEY"
sudo -u osu git clone aur@aur.archlinux.org:osu-lazer-bin.git aur

echo $DISCORD_WEBHOOK > /discord_webhook

echo "$CRON_SCHEDULE /cron.sh" | tee /var/spool/cron/osu

crond -f -P -s
