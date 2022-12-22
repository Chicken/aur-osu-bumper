#!/usr/bin/sh

cd /osu/aur

git pull

CURRENT_VERSION=$(curl "https://api.github.com/repos/ppy/osu/releases" -so- | jq -r .[0].name)

OLD_VERSION=$(cat PKGBUILD  | grep pkgver= | awk -F "=" '{ printf $2 }')

if [ "$CURRENT_VERSION" != "$OLD_VERSION" ]; then
    sed -i -e "s/pkgver=.*/pkgver=$CURRENT_VERSION/" -e "s/pkgrel=.*/pkgrel=1/" PKGBUILD

    updpkgsums

    makepkg --printsrcinfo > .SRCINFO

    git add PKGBUILD .SRCINFO

    git commit -m "Bump version to $CURRENT_VERSION"

    curl "$(cat /discord_webhook)" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "{\"content\": \"Bumped version to \`$CURRENT_VERSION\` from \`$OLD_VERSION\`\"}"
    
    git push -u origin master
fi
