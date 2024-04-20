#include <cstdlib>
#include <iostream>
#include <fstream>
#include <string>

int main() {
    std::string codeFilename = "code.cpp";
    std::string outputFilename = "output.txt";

    std::string compileCmd = "g++ -o code " + codeFilename;
    int compileStatus = system(compileCmd.c_str());

    if (compileStatus != 0) {
        std::cerr << "Compilation failed." << std::endl;
        return 1;
    }

    std::string runCmd = "./code > " + outputFilename + " 2>&1";
    int runStatus = system(runCmd.c_str());

    std::ifstream outputFile(outputFilename);
    if (outputFile.is_open()) {
        std::string line;
        while (getline(outputFile, line)) {
            std::cout << line << std::endl;
        }
        outputFile.close();
    } else {
        std::cerr << "Failed to open output file." << std::endl;
        return 1;
    }

    return runStatus;
}
