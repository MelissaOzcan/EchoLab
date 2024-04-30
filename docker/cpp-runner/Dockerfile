FROM gcc:latest
WORKDIR /home/ubuntu/EchoLab/docker/cpp-runner
COPY cppRunner.cpp .
RUN g++ -o cppRunner cppRunner.cpp
CMD ["./cppRunner"]
