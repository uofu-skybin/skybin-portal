# SkyBin Portal

This repo contains the Electron-based frontend for SkyBin.

## Getting Started

First, ensure you have installed and built the skybin binary and
set up a SkyBin network locally. See "Prerequisites" for more information.

Next, clone skybin-portal:

```
$ git clone https://github.com/uofu-skybin/skybin-portal.git
```

Fetch NPM dependencies:

```
$ cd skybin-portal
$ npm install
```
Finally, build and run the portal with:

```
$ npm start
```

## Prerequisites

1. NodeJS and NPM
2. The skybin binary built from the https://github.com/uofu-skybin/skybin repo.

The skybin binary is necessary because using the portal requires
a running SkyBin network. This includes:

1. A running metaserver instance at a known network address.
2. A configured and running SkyBin renter daemon. This can be
   set up manually via the `skybin renter init` and `skybin renter daemon`
   commands or via the portal by packaging the skybin binary with the 
   portal. See the section below.
3. (Optional) A configured and running SkyBin provider daemon. 
   This can also be set up manually via the `skybin provider init` and
   `skybin provider daemon` commands or via the portal by packaging
   the skybin binary with the portal.

The easiest way to run a local SkyBin network is with the `setup.sh` script
bundled in the main SkyBin repo. See [here](https://github.com/uofu-skybin/skybin/tree/master/integration)
for instructions. 

## Packaging the skybin binary with the portal

Place a skybin binary within a `/bin` folder underneath the repo's top-level
directory to allow the portal to run SkyBin renter and provider services automatically. 

