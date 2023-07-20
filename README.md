# loren
## Introduction
NOTE: This readme is not yet complete for setting up this project

This repository holds the MVP for loren, a tool that makes it easy for school to give access to ready to use wordpress and prestashop instance to their students and teacher for a cheap price.
This aims to be entirely self-service

## getting started
This repo holds the source code for both the infrastructure and the app.
to install the dev dependencies, run setup.sh on macos/linux or setup.ps1 on windows.

## general guidelines
Please make sure all secrets are always encrypted with sops. There is api keys in there and somoene getting a hold of them could be costly.

## loren-server
this has not been fully implemented. A test project was done on golang but we're rewriting it in node for ease of use
### dev guidelines
1. camelCase should be used for functions and variables, PascalCase for classes and types.
2. Routes should only pass the request to the middlewares and controllers, no logic should be defined in them.
3. Controllers should only concern themselves with the http logic. Validate parameters (is the json valid ? Are every parameters present ?) They should not contain business logic, even if it concerns validation (password length)
4. Services should concern the business logic, they should not be aware of the protocol used to make the request (http in our case)
5. Models contains the shape of our data and methods to store and retrieve it, they should only concern themselves with storage and retrieval, with no business logic.
6. Explicitly declare the types for functions signature.
8. Don't forget to add dev dependencies with npm --save-dev
### start the server
run `npm run dev`, the changes to the file will be picked up automatically.

## infra
Part of this project will run on kubernetes. This is necessary in order to easily provide instances of wordpress & prestashop.
We chose a k3s cluster on hetzner cloud arm servers for a cheap and reliable way to host it.
You can stand up a new cluster by running the start.sh script and completly destroy it by running the teardown.sh script.


## loren-client
This has not yet been implemented
