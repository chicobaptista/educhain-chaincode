# EduChain
EduChain is a dApp that originated from my MBA in Blockchain Development course final project.
It tracks progress, participation and certification on courses and is originally aimed at empowering and rewarding continuous improvement and training for education professionals.

The solution consists of three basic layers:
* Client Application
* Web RESTful API
* Blockchain and chaincode (Hyperledger Fabric)


## How it works
The following use cases are to be implemented
- [x] Create, Read, Update and Delete Users
- [x] Read User's Certification details
- [x] Create, Read, Update and Delete Courses
- [x] Enroll and Disenroll Users on Course
- [ ] Instructor Emits a Certification for a User enrolled on a Course
- [ ] Validate Certification's details with Student, Instructor and Course details

The Client Application serves as a presentation layer and as an User Interface to trigger the deseired actions.
The Web API serves as a middleware connecting directly to the blockchain peer and serving the results back to the Client App.
The chaincode itself executes all the logic and persistence of the solution.

## How to build and deploy
All layers use Typescript/Node.js as a common language, so in each relevant directory, install all dependencies with:
``` bash
yarn
```
and run each layer independently:

### Client App
``` bash
yarn run serve
```

### Web API
``` bash
yarn run start
```

### Fabric chaincode
* See Hyperledger Fabric dependencies and basic test-network guide [here](https://hyperledger-fabric.readthedocs.io/en/release-2.2/test_network.html)
* Run Fabric test network
``` bash
# Clean previous network
./network.sh down

# Start new network with default channel and a couchdb instance for private data
./network.sh up createChannel -ca -s couchdb
```
* Deploy chaincode to test-network
``` bash
./network.sh deployCC -ccn certchain -ccp ../blockcertchain/chaincode/ -ccl typescript -ccep "OR('Org1MSP.peer','Org2MSP.peer')" -cccg ../blockcertchain/chaincode/collections_config.json
```
