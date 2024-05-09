# EchoLab

## Background
EchoLab is a web application designed to revolutionize the way developers, students, and educators collaborate on programming projects. Unlike traditional online code compilers, EchoLab introduces the concept of "rooms" – collaborative spaces where users can choose from five major programming languages (Java, C++, Python, Node.js, Rust) to write and execute code in real-time. This feature fosters a community-centric approach to coding, allowing users to collaborate seamlessly. With support for multiple languages EchoLab is versatile. Participants in a room can write, share, and run code in real-time, providing an interactive coding environment that is perfect for peer programming, tutoring, or collaborative projects. A standout feature is the built-in voice call functionality within each room. This allows for real-time voice communication among participants, enhancing collaboration and making it easier to discuss ideas, troubleshoot code, and teach programming concepts. Teachers can leverage EchoLab to create a virtual classroom, where they can code live, demonstrate programming concepts, and provide immediate feedback to students, all while engaging in voice discussions.

By combining coding with voice communication, EchoLab offers an immersive learning experience that mimics in-person collaboration, making it especially beneficial for remote education. Whether for professional development teams, student projects, or coding bootcamps, EchoLab streamlines the process of working together on code, reducing barriers to effective collaboration. Accessible from anywhere with an internet connection, it breaks down geographical barriers, enabling global collaboration and learning opportunities.

## Deployment
The project is currently deployed on: http://3.142.174.77:5173/

The code running on the EC2 server in on the `nouman` branch. The code on `main` can be used to run and test the application locally (Check `How to Setup (locally)`).

#### IMPORTANT

You can access the deployed website by pasting the above URL in any browser. However, because the application is deployed to HTTP, and isn't authenticated using the SSL/TLS certificates, your browser will block the applications access to your microphone, which prevents the audio call feature from working. 

(We bought a domain (echolab.site) and got valid SSL certificates (on the `nouman` branch), but weren't able to successfully deploy on HTTPS)

To access the website and all of it's features, follow the below steps.

(NOTE: The instructions below only work for Google Chrome. But this can also be done for Firefox and all other Chromium based browsers)

##### Step 1: 

Quit/Close the Google Chrome application if it is open.

##### Step 2:

Find the location for Google Chrome in your file system. It can usually be found in these locations.

For MacOS:
```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```
for Windows:
```bash
"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
```
for Linux:
```bash
"/usr/bin/google-chrome"
or
"/usr/bin/chromium"
```
##### Step 3:

Run the following command in your terminal after replacing `"/path/to/google/chrome"` with your path:
```bash
"/path/to/google/chrome" --unsafely-treat-insecure-origin-as-secure="http://3.142.174.77:5173/" --user-data-dir="/tmp/chrome_dev_test"
```
##### Step 4:

Running the above command will open a Google Chrome tab. You can paste the URL for our web application (`http://3.142.174.77:5173/`) here.

## How to Setup (Locally)
Clone EchoLab repository:
```bash
git clone https://github.com/MelissaOzcan/EchoLab.git
```

Go into the EchoLab/ directory:
```bash
cd EchoLab/
```
Go into the server/ directory, install development dependencies, and start the server:
```bash
cd server/
npm i
npm start
```
Go into the agora-server/ directory, install development dependencies, and start the Agora server:
```bash
cd ../agora-server
npm i 
npm start
```
Go into the client/ directory, install development dependencies, and start the client server:
```bash
cd ../client/
npm i
npm run dev
```

## Contributors:
- Nouman Syed
- Diego Ramirez
- Sabah Naveed
- Melissa Ozcan
- Corey Heckel

## Seed Users:
email: admin1@gmail.com
password: Password1@

email: admin2@gmail.com
password: Password2@
