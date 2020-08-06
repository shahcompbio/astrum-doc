---
id: architecture
title: Architecture
sidebar_label: System Architecture
---

## Architecture

The main webserver contains an nginx proxy server. It handles all requests and directs them to the appropriate dashboard.

All applications (React / GraphQL) are contained in docker images and are run within the main webserver via docker compose files. With this method, only the port to the app's front end is exposed to the main webserver.

For applications that use ElasticSearch, there is a separate VM that runs the ElasticSearch instance. An additional VM is used to run the python scripts that loads data into ElasticSearch.
