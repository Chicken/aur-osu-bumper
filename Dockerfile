FROM archlinux:base-devel

RUN pacman -Syu --noconfirm \
    && pacman -S --noconfirm \
        cronie \
        git \
        openssh \
        jq \
        pacman-contrib \
    && pacman -Scc --noconfirm \
    && rm -rf /var/cache/pacman/pkg/* \
    && rm -rf /var/lib/pacman/sync/* \
    && useradd -u 1000 -m osu \
    && mkdir /osu \
    && chown -R osu:osu /osu

WORKDIR /osu

COPY init.sh cron.sh /

ENTRYPOINT [ "/init.sh" ]
