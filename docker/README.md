# Dockerfiles

This directory is not directly associated with the EchoLab application and contains Dockerfiles used to build Docker Images that run user submitted code.

The Docker Images are uploaded to DockerHub:
- [noumxn/python-runner](https://hub.docker.com/repository/docker/noumxn/python-runner/general)
- [noumxn/node-runner](https://hub.docker.com/repository/docker/noumxn/node-runner/general)
- [noumxn/java-runner](https://hub.docker.com/repository/docker/noumxn/java-runner/general)
- [noumxn/cpp-runner](https://hub.docker.com/repository/docker/noumxn/cpp-runner/general)
- [noumxn/rust-runner](https://hub.docker.com/repository/docker/noumxn/rust-runner/general)

The Docker Images where uploaded from an AWS EC2 instance. The EC2 instance was also used to set up Docker Daemon. This allows EchoLab to make requests utilizing the Docker Images.

You can use the key `DockerDaemonKey.pem` stored currently in `/Echolab/server/.ssh/` to SHH into the EC2 instance using the following command:
```bash
ssh -i /RELATIVE/PATH/TO/DockerDaemonKey.pem ubuntu@18.219.85.188
```
