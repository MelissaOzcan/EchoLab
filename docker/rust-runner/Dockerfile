FROM rust:latest
WORKDIR /usr/src/app
COPY rustRunner.rs .
RUN rustc -o rustRunner rustRunner.rs
CMD ["./rustRunner"]
