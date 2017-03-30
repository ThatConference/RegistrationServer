# Registration Server

### .env

You need to setup local var's to get things wired up and working against the different services.

### straight node setup and run.

1. `npm install`
2. `npm start`

You can also just run the container itself.

### Testing
TBD

### Containers

Running a container in dev mode.
`docker-compose up` will build a new container, mount in your local source and run it. `docker-compose up -d` will just run in the background.

Building a new container from the compose file.
```
docker-compose build
```

Build from the dockerfile itself.

Build an image [namespace/containername:tag]:
```
docker build -t [thatconference/that-registration-server:tag] .
```

Tag and ReTag:

```
docker tag [source name:tag] [target name:tag]` | `docker tag [imageId] [target]
```

Push to the docker registry:

```
docker push namespace/name:tag
```
