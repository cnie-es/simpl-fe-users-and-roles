FROM nginxinc/nginx-unprivileged:alpine3.22-perl@sha256:f1444b4f78f91b0c42dedc01b55972f4d759e7fcbabdf5d5a5e2f0690234eef4

ARG IMAGE_REVISION="0000000000000000000000000000000000000000"
ARG IMAGE_CREATED="1970-01-01T00:00:00Z"

# EUPL-1.2 (Art. 5): this image ships a modified version of SIMPL fe-users-and-roles. The licence
# and the modification notice travel with the image, and the labels below point to the repository
# where the complete corresponding source code is available.
#
# The base image (nginx-unprivileged) declares its own maintainer/url/revision/created labels;
# every key below is re-declared explicitly so none of that third-party metadata survives here.
LABEL org.opencontainers.image.title="fe-users-and-roles (CNIE-ES fork)" \
      org.opencontainers.image.description="Modified version of SIMPL fe-users-and-roles (upstream commit e8941cb), modified by the EDNEL-RIOJA project team for CNIE-ES between 2026-03-03 and 2026-09-16. See /licenses/NOTICE.EDNEL.md." \
      org.opencontainers.image.version="ednel-v1.0.8" \
      org.opencontainers.image.vendor="CNIE-ES" \
      org.opencontainers.image.licenses="EUPL-1.2" \
      org.opencontainers.image.source="https://github.com/cnie-es/simpl-fe-users-and-roles" \
      maintainer="EDVAL Maintainers <info@cnie.es>" \
      org.opencontainers.image.url="https://github.com/cnie-es/simpl-fe-users-and-roles" \
      org.opencontainers.image.revision="${IMAGE_REVISION}" \
      org.opencontainers.image.created="${IMAGE_CREATED}"

# The release/build.sh hook produces dist/; the image only copies it.
COPY --chown=nginx:nginx dist /usr/share/nginx/html
COPY --chown=nginx:nginx _docker/nginx.conf.template /nginx.conf.template
COPY --chown=nginx:nginx --chmod=744 _docker/docker-cmd.sh /nginx-cmd.sh

# The notices must travel with every copy of the Work (EUPL-1.2, Art. 5). This repository ships no
# third-party NOTICE file, so only the licence and the modification notice are copied.
COPY LICENSE NOTICE.EDNEL.md /licenses/

CMD ["/nginx-cmd.sh"]
