# ETI Assignment 2

![Main-Interface CI](https://github.com/dongkiat/ETI-Asg2/actions/workflows/CI_Main.yml/badge.svg)
![Docker CD](https://github.com/dongkiat/ETI-Asg2/actions/workflows/Docker.yml/badge.svg)
![Release CD](https://github.com/dongkiat/ETI-Asg2/actions/workflows/Release.yml/badge.svg)

## Edufi Main Interface - Package 3.1

> Lim Dong Kiat

## 🎯 Table of Contents

1. System Architecture and Design
   - Overview
   - User Authentication
   - User Session and Authorization
   - Admin Authentication
   - Testability
2. CI/CD
   - Testing
   - Docker Build and Push
   - Release Creation
3. Setup
   - Scripts
   - Docker-compose
4. Features
   - User Login
   - User Home Page
   - User Session
   - Admin Login

## 1) 💡 System Architecture and Design

### 🙆‍♂️ Overview
![architecture](https://user-images.githubusercontent.com/56468194/152674225-9bbec36d-577a-40f9-be9e-7c32eb77c31d.png)

This package consists of one main server that runs on Node js with Express js. It will communicate with a redis admin database, as well as student and tutor databases supported by packages 3.2 and 3.3 for authentication. Mock student and tutor databases were created so that authentication can be tested locally, independent of the ones from the respective supposed packages. The server will also communicate with a redis session database so as to store the user session and use it to authorize access for users.

---

### 🔐 User Authentication
A mysql connection will be created with the respective user databases upon startup and a query will be made to retrieve the user ID specified during login. If the user ID exists, it will check that the password is correct, before authenticating the user. If the user ID is invalid or the password is wrong, it will display the respective error message. If there is some other error, such as a failed connection to the user database, then a system error toast pop up will appear indicating so.

---

### 👮 User Session and Authorization
After successful login and authentication, a user session will be created. The session and its details will be stored on the redis session database. The main content consists of the user ID and usertype. Each session has been set to expire after 20 minutes. A cookie with the name connect.sid will also be created in the http header and it will only contain the session ID. This cookie is vital as it will allow for the browser to retrieve the right session details from the session datatbase. The presence of a session can then be used to carry out authorization, such as access to the home page, as well as for the other packages to use.

---

### 🔐 Admin Authentication
Validation wise, it is similar to the user authentication. However, the difference is that it will be communicating with a redis database instead.

---

### ⚗️ Testability
Testing is done using Jest and Supertest libraries. To make the code testable, the code itself thus has to be structured in such a way that it can accomodate the test scripts. The main change is the use of dependency injection. First, the code for interacting with the databases are separated and grouped into their own modules. Then, the app itself is turned into a module which accepts the database connection objects as arguments. So instead of the main app calling the database connection objects, the connection objects are passed into the app as arguments instead. This allows for the databases to be mocked, as mock databases can now be passed into the main app during testing.

---

## 2) 🔗 CI/CD

### 🧪 Testing
Upon push and pull request to main, the CI Main workflow will run, which will run all the tests scripts on the incoming code. If all tests pass, there will be a green tick, otherwise a red cross will appear, meaning that some tests failed.

Automating tests saves time, and also reduces human error, helping to promote high continuous integration throughout the development process.

---

### 🐳 Docker Build and Push
Upon pushing a new tag to main, the Docker workflow will run, which will build a Docker image of the main-interface using the Dockerfile within it. It will then subsequently push the image to the DockerHub repository, allowing for users to immediately pull it from wherever the deployment server is.

This greatly promotes high conitnuous deployment, as the simple act of pushing a git tag will automate the entire image build and push process, and the user can straight away pull and run the image on the deployment server. This skips and removes alot of the manual work and saves alot of time, making the deployment process efficient and more convenient.

---

### 🚀 Release Creation
Upon pusing a new tag to main, the Release workflow will run as well. A new release for the tag will be created, and the deployment folder will be zipped and attached to the release as a release asset. Because the app is using docker images which are publised on DockerHub, only the scripts and compose files are needed if the user just wants to get the app up and running. Thus zipping and attaching the deployment folder allows users a more lightweight method of running the app, as compared to having to download the whole repository and all the source code. The release will also be filled with a base template and saved as a draft. By saving it as a draft, the user can then manually fill the release with the necessary notes and info before actually publishing it.

This workflow saves a lot of time and manual work, especially in the creation and attaching of the deployment zip folder, thus bringing greater convenience and efficiency in the release and deployment process.

---

## 3) ⚙️ Setup

### 🤖 Scripts
A script is created to interact with the deployment processes. The script has 2 variations: deploy.bat for windows and deploy.sh for linux, which can be found in the deployment folder. The script has 3 main functionalities, which are startup, shutdown and monitor. A help manual will display if any wrong command is entered.

![image](https://user-images.githubusercontent.com/56468194/152676918-98b09607-b8e7-4141-8d18-de9a8dabe19a.png)

Windows: `deploy [command] [option]`  
Linux: `bash deploy.sh [command] [option]`

The `up` command will start the app create all the containers. The default option means no option, just `deploy up`.

The `down` command will shutdown and remove all the containers. It comes with the same options. When shutting down, do use the same option that was used in startup. For example, if `deploy up -mock` was used in startup, then do use `deply down -mock` when shutting down.

The `monitor` command will display the logs for the main-interface.

Usage example:

1. startup: `deploy up -mock`
2. monitor: `deploy monitor`
3. shutdown: `deploy down -mock`

---

### 🐋 Docker-compose
The scripts will still setup the containers via running docker-compose commands. Although technically with scripts, using the standard docker run is viable. However, personally, docker-compose seems more organized and it satisfies all the necessary needs anyways.

---

## 4) 📚 Features, UI and UX

### 🔑 User Login
<img src="https://user-images.githubusercontent.com/56468194/152674286-53f6c212-1739-4138-978c-fff0d458aeae.png" width="70%">

<img src="https://user-images.githubusercontent.com/56468194/152674293-83fb4105-dbc7-43a4-83c9-95a24d8291b8.png" width="45%"> <img src="https://user-images.githubusercontent.com/56468194/152674294-a87ed5b0-a0d6-44dd-b5aa-da8354528545.png" width="45.5%">
Login when user ID or password invalid.  

<img src="https://user-images.githubusercontent.com/56468194/152674297-5920690f-747f-4bca-898b-a43535460b68.png" width="70%">
Login when system error detected.

---

### 🏡 User Home Page
<img src="https://user-images.githubusercontent.com/56468194/152674311-f145c632-7ee0-4d32-b1bf-7da5c4ca140c.png" width="70%">

Student home page.  

<img src="https://user-images.githubusercontent.com/56468194/152674314-66186e50-645d-48a7-8c00-a895397a9c22.png" width="70%">
Tutor home page.

---

### 🦉 User Session
As the login and home page uses the same URL, which page a user is directed to will depend on the existence of a session. If the user does not have a session, then he will be brough to the login page. However, if he has logged in and has a session, then he will be brought straight to the home page.

---

### 🏛️ Admin Login
<img src="https://user-images.githubusercontent.com/56468194/152674480-5c400bdc-d37c-4c06-bed8-8e0774fe4cc9.png" width="70%">

<img src="https://user-images.githubusercontent.com/56468194/152674499-056b877a-b843-48d6-9ab0-c577c0705dcb.png" width="47%"> <img src="https://user-images.githubusercontent.com/56468194/152674500-2218a93d-bfd2-48dc-b203-9b1b156f64b7.png" width="43.5%">
Login when user ID or password invalid.  

<img src="https://user-images.githubusercontent.com/56468194/152674494-9536eca9-4f47-4719-ba8b-91dfd9df3853.png" width="70%">
Login when system error detected.
