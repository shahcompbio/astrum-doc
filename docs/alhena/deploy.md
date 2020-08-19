---
title: Alhena - Deployment
sidebar_label: Deployment
---

## Deploy (Development)

### System Requirements

- [Yarn](https://yarnpkg.com/en/) (or [npm](https://www.npmjs.com/))
- [Docker](https://docker.com)

### Elasticsearch

We will be installing Elasticsearch with SSL/TLS encryption, which can be set up as described on the [official Elasticsearch guide](https://www.elastic.co/guide/en/elasticsearch/reference/current/configuring-tls-docker.html).

To load data, follow [these instructions](alhena/loading-data.md).

### GraphQL

Clone [Alhena's graphQL](https://github.com/shahcompbio/alhena-graphql) repository:

```
git clone https://github.com/shahcompbio/alhena-graphql
```

Go into the directory and install the dependencies:

```
cd alhena-graphql
yarn install
```

Then start the development server.

```
yarn start
```

Following the URL `http://localhost:4000/graphql` should bring you to the GraphQL playground, where you can enter queries.

### React

Clone [Alhena's React](https://github.com/shahcompbio/alhena-react) repository:

```
git clone https://github.com/shahcompbio/alhena-react.git
```

Go into the directory, add an `.npmrc` file with the fontawesome token (provided by Samantha).

```
cd alhena-react
touch .npmrc
```

Install the dependencies:

```
yarn install
```

Then start the development server.

```
yarn start
```

This should automatically open `http://localhost:3000` on your browser. If not, then navigate to that URL.

## Deploy (Production)

### System Requirements

- [Docker](https://docker.com)
- [Docker Compose](https://docs.docker.com/compose/)

### Environment

In our production instances, we use virtual machines with these specifications:

1. Webserver
   - 4 CPU, 8GB RAM
   - [Docker Compose](https://docs.docker.com/compose/)
   - [nginx](https://www.nginx.com/)
2. ElasticSearch
   - 4 CPU, 64GB RAM
   - 4 1TB disks (one for each of three ES node, one as backup)
   - [Docker Compose](https://docs.docker.com/compose/)
3. Loader
   - 4 CPU, 8GB RAM
   - System requirements for [loading data](alhena/loading-data.md)

### ElasticSearch

In the ElasticSearch VM, set up the VM similarly to as described by the [official Elasticsearch guide](https://www.elastic.co/guide/en/elasticsearch/reference/current/configuring-tls-docker.html).

#### Troubleshooting

1. Disks are not writable

Make sure the disks are accessable to write into by elasticsearch itself

```
chown 1000:1000 <path to disk>
```

2. vm.max_map_count not high enough

```
sysctl -w vm.max_map_count=262144
```

### ElasticSearch

On the Elasticsearch Vm, create an instances.yml file with the following contents:

```
instances:
  - name: es01
    dns:
      - es01
      - localhost
    ip:
      - 127.0.0.1

  - name: es02
    dns:
      - es02
      - localhost
    ip:
      - 127.0.0.1

  - name: es03
    dns:
      - es03
      - localhost
    ip:
      - 127.0.0.1
```

On the Elasticsearch VM, add the following env file and replace the password

```
COMPOSE_PROJECT_NAME=es
CERTS_DIR=/usr/share/elasticsearch/config/certificates
ELASTIC_PASSWORD=PleaseChangeMe
```

On the Elasticsearch VM, create a create-certs.yml file with the following contents

```
version: '2.2'

services:
  create_certs:
    container_name: create_certs
    image: docker.elastic.co/elasticsearch/elasticsearch:7.9.0
    command: >
      bash -c '
        if [[ ! -f /certs/bundle.zip ]]; then
          bin/elasticsearch-certutil cert --silent --pem --in config/certificates/instances.yml -out /certs/bundle.zip;
          unzip /certs/bundle.zip -d /certs;
        fi;
        chown -R 1000:0 /certs
      '
    user: "0"
    working_dir: /usr/share/elasticsearch
    volumes: ['certs:/certs', '.:/usr/share/elasticsearch/config/certificates']

volumes: {"certs"}
```

on the ElasticSearch VM, create a docker-compose.yml file with the following contents (make sure to edit where `!!!` are)

```
version: "3"
services:
  es01:
    image: docker.elastic.co/elasticsearch/elasticsearch:<!!! version>
    container_name: es01
    environment:
      - node.name=es01
      - discovery.seed_hosts=es02,es03
      - cluster.initial_master_nodes=es01,es02,es03
      - cluster.name=docker-cluster
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
      - search.max_buckets=50000
      - http.max_content_length=500mb
      - "path.repo=/usr/share/elasticsearch/backup"
      - ELASTIC_PASSWORD=$ELASTIC_PASSWORD
      - xpack.security.enabled=true
      - xpack.security.http.ssl.enabled=true
      - xpack.security.http.ssl.key=$CERTS_DIR/es01/es01.key
      - xpack.security.http.ssl.certificate_authorities=$CERTS_DIR/ca/ca.crt
      - xpack.security.http.ssl.certificate=$CERTS_DIR/es01/es01.crt
      - xpack.security.transport.ssl.enabled=true
      - xpack.security.transport.ssl.verification_mode=certificate
      - xpack.security.transport.ssl.certificate_authorities=$CERTS_DIR/ca/ca.crt
      - xpack.security.transport.ssl.certificate=$CERTS_DIR/es01/es01.crt
      - xpack.security.transport.ssl.key=$CERTS_DIR/es01/es01.key

    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - <!!! path of one disk>:/usr/share/elasticsearch/data
      - <!!! path of backup disk>:/usr/share/elasticsearch/backup
      - certs:$CERTS_DIR
    ports:
      - 9200:9200
    healthcheck:
      test: curl --cacert $CERTS_DIR/ca/ca.crt -s https://localhost:9200 >/dev/null; if [[ $$? == 52 ]]; then echo 0; else echo 1; fi
      interval: 30s
      timeout: 10s
      retries: 5

  es02:
    image: docker.elastic.co/elasticsearch/elasticsearch:<!!! version>
    container_name: es02
    environment:
      - node.name=es02
      - discovery.seed_hosts=es01,es03
      - cluster.initial_master_nodes=es01,es02,es03
      - cluster.name=docker-cluster
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
      - search.max_buckets=50000
      - http.max_content_length=500mb
      - "path.repo=/usr/share/elasticsearch/backup"
      - ELASTIC_PASSWORD=$ELASTIC_PASSWORD
      - xpack.security.enabled=true
      - xpack.security.http.ssl.enabled=true
      - xpack.security.http.ssl.key=$CERTS_DIR/es02/es02.key
      - xpack.security.http.ssl.certificate_authorities=$CERTS_DIR/ca/ca.crt
      - xpack.security.http.ssl.certificate=$CERTS_DIR/es02/es02.crt
      - xpack.security.transport.ssl.enabled=true
      - xpack.security.transport.ssl.verification_mode=certificate
      - xpack.security.transport.ssl.certificate_authorities=$CERTS_DIR/ca/ca.crt
      - xpack.security.transport.ssl.certificate=$CERTS_DIR/es02/es02.crt
      - xpack.security.transport.ssl.key=$CERTS_DIR/es02/es02.key
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - <!!! path of second disk>:/usr/share/elasticsearch/data
      - <!!! path of backup disk>:/usr/share/elasticsearch/backup
      - certs:$CERTS_DIR
  es03:
  image: docker.elastic.co/elasticsearch/elasticsearch:<!!! version>
  container_name: es03
  environment:
    - node.name=es03
    - discovery.seed_hosts=es01,es02
    - cluster.initial_master_nodes=es01,es02,es03
    - cluster.name=docker-cluster
    - bootstrap.memory_lock=true
    - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
    - search.max_buckets=50000
    - http.max_content_length=500mb
    - "path.repo=/usr/share/elasticsearch/backup"
    - ELASTIC_PASSWORD=$ELASTIC_PASSWORD
    - xpack.security.enabled=true
    - xpack.security.http.ssl.enabled=true
    - xpack.security.http.ssl.key=$CERTS_DIR/es03/es03.key
    - xpack.security.http.ssl.certificate_authorities=$CERTS_DIR/ca/ca.crt
    - xpack.security.http.ssl.certificate=$CERTS_DIR/es03/es03.crt
    - xpack.security.transport.ssl.enabled=true
    - xpack.security.transport.ssl.verification_mode=certificate
    - xpack.security.transport.ssl.certificate_authorities=$CERTS_DIR/ca/ca.crt
    - xpack.security.transport.ssl.certificate=$CERTS_DIR/es03/es03.crt
    - xpack.security.transport.ssl.key=$CERTS_DIR/es03/es03.key
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - <!!! path of third disk>:/usr/share/elasticsearch/data
      - <!!! path of backup disk>:/usr/share/elasticsearch/backup
      - certs:$CERTS_DIR

volumes:
  certs:
```

1. Generate certificates

```
docker-compose -f create-certs.yml run --rm create_certs
```

2. Start the instance:

```
docker-compose up -d
```

3. Access the password using the API

```
docker run --rm -v es_certs:/certs --network=es_default docker.elastic.co/elasticsearch/elasticsearch:7.9.0 curl --cacert /certs/ca/ca.crt -u elastic:PleaseChangeMe https://es01:9200
```

4. Use the "elasticsearch-setup-passwords" to generate passwords for all users

```
docker exec es01 /bin/bash -c "bin/elasticsearch-setup-passwords \
auto --batch \
--url https://localhost:9200"
```

### GraphQL + React

In our production instances, we build both the graphQL and React images and then run the application through Docker Compose, exposing the app through port 5010.

#### Building GraphQL

Build the dockerfile in the `alhena-graphql` repository:

```
cd alhena-graphql

docker build . -t alhena-graphql
```

#### Building React

In the root directory in `alhena-react`, make sure you have the appropriate `.env` file. For example, we have a file called `.env.spectrum.prod`. Here are the contents (edit where appropriate):

```
REACT_APP_BASENAME="/alhena"
PUBLIC_URL="<!!! HOSTNAME>/alhena"
```

:::note
This assumes that you want this deployed in a subdomain from the host URL (like foo.bar/alhena). If you want this to be the root application, then you do not need the `REACT_APP_BASENAME` variable, and the `PUBLIC_URL` variable can just be the host name.
:::

Then build the dockerfile:

```
docker build . -t alhena-react --build-arg BUILD_ENV=<!!! name of env file>
```

#### GraphQL environment

In the webserver, create a `graphql.env` file with the following:

```
ES_USER=elastic
ES_PASSWORD=<elasticsearch password>
CLIENT_PORT="9200"
SERVER_NAME=<add your server name>

```

#### Deploying on webserver

In the webserver, create a `docker-compose.yml` (same location as your graphql.env file) file with the following:

```
version: "3"
services:
  graphql:
    container_name: alhena-graphql
    image: alhena-graphql:latest
    environment:
      - HOST=<!!! network IP where ElasticSearch instance is>
    env_file:
      - graphql.env
  frontend:
    container_name: alhena-frontend
    image: alhena-react:latest
    ports:
      - "5010:80"
    depends_on:
      - graphql
    volumes:
      - <ssl cert location /etc/ssl/ssl.crt>:/etc/nginx/alhena.crt
      - <ssl key location /etc/ssl/ssl.key>:/etc/nginx/alhena.key
  redis:
    image: redis
    container_name: redis
    ports:
      - "6379:6379"
    expose:
      - 6379
    volumes:
      - <redis data folder>:/data

```

:::caution

If the webserver and the ElasticSearch VMs are not the same network, it may be necessary to install an nginx proxy on the ElasticSearch VM so that the graphQL container can access it.

:::

Then start the instance:

```
docker-compose up -d
```

You should be able to access the app through port 5010 from the host. At this point, we use an nginx reverse proxy on the web server to redirect URL requests to the port. Here's an example:

:::note
Below, we redirect all requests from `SERVER_NAME/alhena` to the app. This MUST match the `PUBLIC_URL` in the `.env` file in `alhena-react`:
:::

```
upstream alhena {
    server localhost:5010;
    keepalive 15;
}
upstream alhena-db {
    server <!!! HOST FOR ELASTICSEARCH>:9200;
    keepalive 15;
}
server {
        listen 80;
        listen [::]:80;
        server_name     #.#.#.#;
        return         301 https://$server_name$request_uri;
}
server {
        listen 80;
        listen [::]:80;
        server_name     <!!! SERVER NAME>;

        gzip on;
        gzip_vary on;
        gzip_types text/plain text/css text/javascript application/javascript application/x-javascript;
        client_max_body_size 2M;

        location /alhena/ {
                proxy_pass      http://alhena/;
        }

        location /alhena/db/ {
                rewrite ^/alhena/db/(.*)$         /$1     break;
                proxy_pass      http://alhena-db;
        }

        location / {
                root    /usr/share/nginx/html;
                index   index.html      index.htm;
        }
}
```
