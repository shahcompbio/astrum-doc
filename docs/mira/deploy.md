---
title: Mira - Deployment
sidebar_label: Deployment
---

## Deploy (Development)

### System Requirements

- [Yarn](https://yarnpkg.com/en/) (or [npm](https://www.npmjs.com/))
- [Docker](https://docker.com)

### Elasticsearch

Pull the docker image for Elasticsesarch (latest version):

https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html

and then run the container:

https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html#docker-cli-run-dev-mode

:::tip

You may opt to attach your docker container to a volume to have the data persist between sessions. Here's an example:

```
docker run -p 9200:9200 -p 9300:9300 -v data01:/usr/share/elasticsearch/data -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:7.8.1
```

:::

To load data, follow [these instructions](mira/loading-data.md).

### GraphQL

Clone Mira's graphQL repository:

```
git clone https://github.com/shahcompbio/mira-graphql
```

Go into the directory and install the dependencies:

```
cd mira-graphql
yarn install
```

Then start the development server.

```
yarn start
```

Following the URL `http://localhost:4000/graphql` should bring you to the GraphQL playground, where you can enter queries.

### React

Clone [Mira's React](https://github.com/shahcompbio/mira-react) repository:

```
git clone https://github.com/shahcompbio/mira-react.git
```

Go into the directory, add an `.npmrc` file with the fontawesome token (provided by Samantha).

```
cd mira-react
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
   - System requirements for [loading data](mira/loading-data.md)

### ElasticSearch

In the ElasticSearch VM, create a docker-compose.yml file with the following contents (make sure to edit where `!!!` are)

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
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - <!!! path of one disk>:/usr/share/elasticsearch/data
      - <!!! path of backup disk>:/usr/share/elasticsearch/backup
    ports:
      - 9200:9200
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
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - <!!! path of second disk>:/usr/share/elasticsearch/data
      - <!!! path of backup disk>:/usr/share/elasticsearch/backup
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
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - <!!! path of third disk>:/usr/share/elasticsearch/data
      - <!!! path of backup disk>:/usr/share/elasticsearch/backup

```

Then start the instance:

```
docker-compose up -d
```

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

### GraphQL + React

In our production instances, we build both the graphQL and React images and then run the application through Docker Compose, exposing the app through port 5010.

#### Building GraphQL

Build the dockerfile in the `mira-graphql` repository:

```
cd mira-graphql

docker build . -t mira-graphql
```

#### Building React

In the root directory in `mira-react`, make sure you have the appropriate `.env` file. For example, we have a file called `.env.spectrum.prod`. Here are the contents (edit where appropriate):

```
REACT_APP_BASENAME="/mira"
PUBLIC_URL="<!!! HOSTNAME>/mira"
REACT_APP_HOME_URL=<!!! HOSTNAME>
REACT_APP_WIKI_URL=<!!! HOSTNAME>
REACT_APP_MIRA_URL=<!!! HOSTNAME>
REACT_APP_SYLPH_URL=<!!! HOSTNAME>
REACT_APP_HYDRA_URL=<!!! HOSTNAME>
```

:::note
This assumes that you want this deployed in a subdomain from the host URL (like foo.bar/mira). If you want this to be the root application, then you do not need the `REACT_APP_BASENAME` variable, and the `PUBLIC_URL` variable can just be the host name.
:::

Then build the dockerfile:

```
docker build . -t mira-react --build-arg BUILD_ENV=<!!! name of env file>
```

#### Deploying on webserver

In the webserver, create a `docker-compose.yml` file with the following:

```
version: "3"
services:
  graphql:
    container_name: mira-graphql
    image: mira-graphql:latest
    environment:
      - HOST=<!!! network IP where ElasticSearch instance is>
  frontend:
    container_name: mira-frontend
    image: mira-react:latest
    ports:
      - "5010:80"
    depends_on:
      - graphql

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
Below, we redirect all requests from `SERVER_NAME/mira` to the app. This MUST match the `PUBLIC_URL` in the `.env` file in `mira-react`:
:::

```
upstream mira {
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
        server_name     40.87.0.178;
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

        location /mira/ {
                proxy_pass      http://mira/;
        }

        location /mira/db/ {
                rewrite ^/mira/db/(.*)$         /$1     break;
                proxy_pass      http://mira-db;
        }

        location / {
                root    /usr/share/nginx/html;
                index   index.html      index.htm;
        }
}
```
