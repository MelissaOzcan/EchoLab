FROM rust:latest
WORKDIR /home/ubuntu/EchoLab/docker/rust-runner
COPY rustRunner.rs .
RUN rustc -o rustRunner rustRunner.rs
CMD ["./rustRunner"]
