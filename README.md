# shelflabels-node

## Introduction

This is a Node.js script that uploads images to PickSmart/GiCiSky Bluetooth-only Electronic Shelf Labels (ESLs).

This is a complete proof of concept so it may work for you, it might not. Just supplying this to get you going on your journey. It is nowhere near a complete solution. At the moment it uploads an image and some text to an ESL but you could use it to develop your own stuff -
fetch a weather forecast, even show your step count!

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

Then assemble your own canvas at `prepareImage()`:

For images, here is an example:

```sh
DEVICE_NAME=<your_device_name> node src/sendImage.js
```

For text only, you can use this:

```sh
DEVICE_NAME=<your_device_name> node src/sendTexr.js
```

To retrieve data from an API and display it, you can use this example which displays the current temperature:

```sh
DEVICE_NAME=<your_device_name> node src/sendWeather.js
```

(You'll need to update your latitude and longitude in the config, unless you're particularly interested in Lisburn, County Antrim.)

I might add more examples to get data from third party services if I'm feeling generous.

The `DEVICE_NAME` will be something like `PICKSMART` or `NEMR<bunch of numbers>` so look out for those when you're performing the scan.

This code is tested with a Picksmart 2.9" BWR device. This
device doesn't appear to use compression so the code for
sending compressed images is totally untested, so use that at your own risk.
