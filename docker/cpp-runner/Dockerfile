FROM gcc:latest
WORKDIR /usr/src/app
COPY cppRunner.cpp .
RUN g++ -o cppRunner cppRunner.cpp
CMD ["./cppRunner"]
