# shelflabels-node

## Introduction

This is a Node.js script that uploads images to PickSmart/GiCiSky Bluetooth-only Electronic Shelf Labels (ESLs).

This is a complete proof of concept so it may work for you, it might not. Just supplying this to get you going on your journey. It is nowhere near a complete solution. At the moment it uploads an image some text to an ESL but you could use it to develop your own stuff -
fetch a weather forecast, show your step count even!

It is heavily based on the [sterling work done by atc1441](https://github.com/atc1441/ATC_GICISKY_ESL) so I can't
claim much credit for it, beyond getting it to work with Node.

_No warranty is provided, so use it at your own risk!_

## Prerequisites

- A computer capable of communicating with Bluetooth LE devices
- A computer capable of running `node-canvas`
- Node.js (I've tested it on v22 but might work on earlier versions)
- A Bluetooth-only Electronic Shelf Label
- Lots of knowledge

## Usage

Tested with Node v22 on an M1 Mac. If you have `nvm` installed:

```sh
nvm use
```

Then:

```sh
npm install
```

Change the settings in `src/config,js` to match your device.

Change the image in `images` to one you actually want on your device.

Add and remove text by changing the `addText()` lines in `src/drawing.js`.

Then:

```sh
DEVICE_NAME=<your_device_name> node src/index.js
```

The `DEVICE_NAME` will be something like `PICKSMART` or `NEMR<bunch of numbers>` so look out for those when you're performing the scan.
