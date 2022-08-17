# Piping ADB
[Android Debug Bridge (ADB)](https://developer.android.com/studio/command-line/adb) over [Piping Server](https://github.com/nwtgck/piping-server) on Web browser

## Usage
First, open adbd 5555 port on an Android device using `adb tcpip 5555` or `su 0 setprop service.adb.tcp.port 5555; su 0 stop adbd; su 0 start adbd`

Second, the device starts a tunneling over Piping Server in some way, equivalent to the following command:   
```bash
curl -sSN https://ppng.io/mycspath | nc localhost 5555 | curl -sSNT - https://ppng.io/myscpath
```

- [Termux](https://termux.dev) is useful to run `curl` and `nc`.
- See "[Secure TCP tunnel from anywhere with curl and nc for single connection](https://dev.to/nwtgck/secure-tcp-tunnel-from-anywhere-with-curl-and-nc-for-single-connection-2k5i)" to know how the tunneling works.

Finally, open the following URL on a Chromium-based browser.  
<https://piping-adb.nwtgck.org/?auto_connect&server=https://ppng.io&cs_path=mycspath&sc_path=myscpath>

## Acknowledgements

This project is highly based on [ya-webadb](https://github.com/yume-chan/ya-webadb). Thanks to the original author!

The following document is from the original README.

[![GitHub license](https://img.shields.io/github/license/yume-chan/ya-webadb)](https://github.com/yume-chan/ya-webadb/blob/main/LICENSE)

Manipulate Android devices from any (supported) web browsers, even from another Android device.

[🚀 Online Demo](https://yume-chan.github.io/ya-webadb)

## Compatibility

| Connection                            | Chromium-based Browsers               | Firefox | Node.js  |
| ------------------------------------- | ------------------------------------- | ------- | -------- |
| USB cable                             | Yes via [WebUSB]                      | No      | Possible |
| Wireless via [WebSocket] <sup>1</sup> | Yes                                   | Yes     | Possible |
| Wireless via TCP                      | Yes via [Direct Sockets] <sup>2</sup> | No      | Possible |

[WebUSB]: https://wicg.github.io/webusb/
[WebSocket]: https://websockets.spec.whatwg.org/
[Direct Sockets]: https://wicg.github.io/direct-sockets/

<sup>1</sup> Requires WebSockify softwares, see [instruction](https://github.com/yume-chan/ya-webadb/discussions/245#discussioncomment-384030) for detail.

<sup>2</sup> Chrome for Android doesn't support Direct Sockets. Need extra steps to enable. See [#349](https://github.com/yume-chan/ya-webadb/issues/349) for detail.

## Security concerns

Accessing USB devices (especially your phone) directly from a web page can be **very dangerous**. Firefox developers even refused to implement the WebUSB standard because they [considered it to be **harmful**](https://mozilla.github.io/standards-positions/#webusb).

## Features

* 📁 File Management
  * 📋 List
  * ⬆ Upload
  * ⬇ Download
  * 🗑 Delete
* 📷 Screen Capture
* 📜 Interactiv Shell
* ⚙ Enable ADB over WiFi
* 📦 Install APK
* 🎥 [Scrcpy](https://github.com/Genymobile/scrcpy) compatible client (screen mirroring and controling device)
* 🔌 Power and reboot to different modes

[📋 Project Roadmap](https://github.com/yume-chan/ya-webadb/issues/348)

## Contribute

See [CONTRIBUTE.md](./CONTRIBUTE.md)

## Credits

* Google for [ADB](https://android.googlesource.com/platform/packages/modules/adb) ([Apache License 2.0](./adb.NOTICE))
* Romain Vimont for [Scrcpy](https://github.com/Genymobile/scrcpy) ([Apache License 2.0](https://github.com/Genymobile/scrcpy/blob/master/LICENSE))
