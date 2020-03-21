# Garage Door Opener

ExpressJS API to interface with [Homebridge Web Garage](https://www.npmjs.com/package/homebridge-web-garage) and [Homebridge](https://github.com/homebridge/homebridge).

![Imgur video](https://i.imgur.com/EsxpNbm.mp4)

## Use

1. Raspberry Pi GPIO wiring

See wiring setup for Relay and Reed switches. [Diagram](https://imgur.com/a/fMZNoQ9)

![Diagram](https://i.imgur.com/ADvvfQB.png)

![Photo](https://imgur.com/8GJqtxX.jpg)

If you use a different pin you will need to update the pin number in the `config.js` file.

2. Install Homebridge either on the Raspberry Pi or elsewhere

You can specify the URL (with port) using as environment variable for `HOMEBRIDGE_URL` or if installed locally and using default port 2000 with [Homebridge Web Garage](https://www.npmjs.com/package/homebridge-web-garage) you don;t need to do anything.

```bash
sudo npm install -g --unsafe-perm homebridge homebridge-config-ui-x
sudo hb-service install --user homebridge
```

3. Install [Homebridge Web Garage](https://www.npmjs.com/package/homebridge-web-garage) Plugin

```bash
sudo npm install -g homebridge-web-garage
```

Update homebridge config for the plugin:

```json
"accessories": [
     {
       "accessory": "GarageDoorOpener",
       "name": "Garage",
       "apiroute": "http://myurl.com"
     }
]
```

4. Install NodeJS on Raspberry Pi

5. Install this package

```bash
curl -Lo app.zip https://github.com/tmackness/homebridge-web-garage-api/archive/master.zip
unzip app.zip
rm app.zip
```

This will be in a directory named: `homebridge-web-garage-api-master`

6. Install PM2 and Run App

`sudo npm i -g pm2`

Add app to a process:

`pm2 start src/app.js` or `npm run app:pm2`.

Run it with full path: `pm2 start /home/pi/homebridge-web-garage-api-master/src/app.js`

Add PM2 startup script to auto start app on reboot (replace `<pi>` with username if run under a different username)

`sudo pm2 startup systemd -u pi --hp /home/pi`

Save the process:

`pm2 save`
