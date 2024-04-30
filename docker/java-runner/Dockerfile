FROM openjdk:11-jdk-slim
WORKDIR /home/ubuntu/EchoLab/docker/java-runner
COPY Main.java .
RUN javac Main.java
CMD ["java", "Main"]
