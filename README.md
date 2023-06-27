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

[![MIT license](https://img.shields.io/github/license/yume-chan/ya-webadb)](https://github.com/yume-chan/ya-webadb/blob/main/LICENSE)

A library and application for browsers to interact with Android devices via ADB.

All features are working on Chrome for Android, use a C-to-C cable or run WebSockify in Termux to connect.

[🚀 Online Demo](https://yume-chan.github.io/ya-webadb)

For USB connection, close Google ADB (Run `adb kill-server` in a terminal or close `adb.exe` from Task Manager) and all programs that may use ADB (e.g. Android Studio, Visual Studio, Godot Editor, etc.) before connecting.

## Compatibility

| Connection                                | Chromium-based Browsers        | Firefox   | Node.js                       |
| ----------------------------------------- | ------------------------------ | --------- | ----------------------------- |
| USB cable                                 | Supported using [WebUSB] API   | No        | Supported using `usb` package |
| Wireless through [WebSocket] <sup>1</sup> | Supported                      | Supported | Possible using `ws` package   |
| Wireless through TCP                      | WIP using [Direct Sockets] API | No        | Possible using `net` module   |

[webusb]: https://wicg.github.io/webusb/
[websocket]: https://websockets.spec.whatwg.org/
[direct sockets]: https://wicg.github.io/direct-sockets/

<sup>1</sup> Requires WebSockify softwares, see [instruction](https://github.com/yume-chan/ya-webadb/discussions/245#discussioncomment-384030) for detail.

## Features

-   📁 File Management
    -   📋 List
    -   ⬆ Upload
    -   ⬇ Download
    -   🗑 Delete
-   📷 Screen Capture
-   📜 Terminal Emulator powered by [Tabby](https://github.com/Eugeny/tabby)
    -   Tabs and split panes
    -   Color themes
    -   Rich configuration
-   ⚙ Enable ADB over WiFi
-   📦 Install APK
-   🎥 [Scrcpy](https://github.com/Genymobile/scrcpy) compatible client
    -   Screen mirroring
    -   Audio forwarding (Android >= 11)
    -   Recording
    -   Control device with mouse, touch and keyboard
-   🐛 Chrome Remote Debugging that supporting
    -   Google Chrome (stable, beta, dev, canary)
    -   Microsoft Edge (stable, beta, dev, canary)
    -   Opera (stable, beta)
    -   Vivaldi
-   🔌 Power and reboot to different modes

## Contribute

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## Sponsors

[Become a backer](https://opencollective.com/ya-webadb) and get your image on our README on Github with a link to your site.

<a href="https://opencollective.com/ya-webadb/backer/0/website?requireActive=false" target="_blank"><img src="https://opencollective.com/ya-webadb/backer/0/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/ya-webadb/backer/1/website?requireActive=false" target="_blank"><img src="https://opencollective.com/ya-webadb/backer/1/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/ya-webadb/backer/2/website?requireActive=false" target="_blank"><img src="https://opencollective.com/ya-webadb/backer/2/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/ya-webadb/backer/3/website?requireActive=false" target="_blank"><img src="https://opencollective.com/ya-webadb/backer/3/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/ya-webadb/backer/4/website?requireActive=false" target="_blank"><img src="https://opencollective.com/ya-webadb/backer/4/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/ya-webadb/backer/5/website?requireActive=false" target="_blank"><img src="https://opencollective.com/ya-webadb/backer/5/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/ya-webadb/backer/6/website?requireActive=false" target="_blank"><img src="https://opencollective.com/ya-webadb/backer/6/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/ya-webadb/backer/7/website?requireActive=false" target="_blank"><img src="https://opencollective.com/ya-webadb/backer/7/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/ya-webadb/backer/8/website?requireActive=false" target="_blank"><img src="https://opencollective.com/ya-webadb/backer/8/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/ya-webadb/backer/9/website?requireActive=false" target="_blank"><img src="https://opencollective.com/ya-webadb/backer/9/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/ya-webadb/backer/10/website?requireActive=false" target="_blank"><img src="https://opencollective.com/ya-webadb/backer/10/avatar.svg?requireActive=false"></a>

## Used open-source projects

-   [ADB](https://android.googlesource.com/platform/packages/modules/adb) from Google ([Apache License 2.0](./adb.NOTICE))
-   [Scrcpy](https://github.com/Genymobile/scrcpy) from Romain Vimont ([Apache License 2.0](https://github.com/Genymobile/scrcpy/blob/master/LICENSE))
-   [Tabby](https://github.com/Eugeny/tabby) from Eugeny ([MIT License](https://github.com/Eugeny/tabby/blob/master/LICENSE))
-   [webm-muxer](https://github.com/Vanilagy/webm-muxer) from Vanilagy ([MIT License](https://github.com/Vanilagy/webm-muxer/blob/main/LICENSE))
-   [web-streams-polyfill](https://github.com/MattiasBuelens/web-streams-polyfill) from Mattias Buelens ([MIT License](https://github.com/MattiasBuelens/web-streams-polyfill/blob/master/LICENSE))
