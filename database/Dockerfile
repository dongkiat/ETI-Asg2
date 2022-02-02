# syntax=docker/dockerfile:1

FROM mysql:8.0.27

ADD user_db_setup.sql /docker-entrypoint-initdb.d

RUN /entrypoint.sh

EXPOSE 3306