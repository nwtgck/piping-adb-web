import {
    DefaultButton,
    Dialog,
    Dropdown,
    IDropdownOption,
    PrimaryButton,
    ProgressIndicator,
    Stack,
    StackItem,
} from "@fluentui/react";
import {
    Adb,
    AdbDaemonDevice,
    AdbDaemonTransport,
    AdbPacketData,
    AdbPacketInit,
} from "@yume-chan/adb";
import AdbWebCredentialStore from "@yume-chan/adb-credential-web";
import AdbDaemonDirectSocketsDevice from "@yume-chan/adb-daemon-direct-sockets";
import {
    AdbDaemonWebUsbDeviceManager,
    AdbDaemonWebUsbDeviceWatcher,
} from "@yume-chan/adb-daemon-webusb";
import AdbDaemonWebSocketDevice from "@yume-chan/adb-daemon-ws";
import {
    Consumable,
    InspectStream,
    ReadableStream,
    WritableStream,
    pipeFrom,
} from "@yume-chan/stream-extra";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GLOBAL_STATE } from "../state";
import { CommonStackTokens, Icons } from "../utils";

import {AdbPipingBackend} from "../adb-piping-backend";
import {useRouter} from "next/router";

const DropdownStyles = { dropdown: { width: "100%" } };

const CredentialStore = new AdbWebCredentialStore();

function urlJoin(baseUrl: string, path: string): string {
    return baseUrl.replace(/\/$/, '') + "/" + path;
}

function _Connect(): JSX.Element | null {
    const [selected, setSelected] = useState<AdbDaemonDevice | undefined>();
    const router = useRouter();
    const [connecting, setConnecting] = useState(false);
    const [autoConnect, setAutoConnect] = useState(false);

    const [usbSupported, setUsbSupported] = useState(true);
    const [usbDeviceList, setUsbDeviceList] = useState<AdbDaemonDevice[]>([]);
    const updateUsbDeviceList = useCallback(async () => {
        const devices: AdbDaemonDevice[] =
            await AdbDaemonWebUsbDeviceManager.BROWSER!.getDevices();
        setUsbDeviceList(devices);
        return devices;
    }, []);

    useEffect(
        () => {
            // Only run on client
            const supported = !!AdbDaemonWebUsbDeviceManager.BROWSER;
            setUsbSupported(supported);

            if (!supported) {
                GLOBAL_STATE.showErrorDialog(
                    "Your browser does not support WebUSB standard, which is required for this site to work.\n\nLatest version of Google Chrome, Microsoft Edge, or other Chromium-based browsers are required."
                );
                return;
            }

            updateUsbDeviceList();

            const watcher = new AdbDaemonWebUsbDeviceWatcher(
                async (serial?: string) => {
                    const list = await updateUsbDeviceList();

                    if (serial) {
                        setSelected(
                            list.find((device) => device.serial === serial)
                        );
                        return;
                    }
                },
                globalThis.navigator.usb
            );

            return () => watcher.dispose();
        },
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
        []
    );

    const [webSocketDeviceList, setWebSocketDeviceList] = useState<
        AdbDaemonWebSocketDevice[]
    >([]);
    useEffect(() => {
        const savedList = localStorage.getItem("ws-backend-list");
        if (!savedList) {
            return;
        }

        const parsed = JSON.parse(savedList) as { address: string }[];
        setWebSocketDeviceList(
            parsed.map((x) => new AdbDaemonWebSocketDevice(x.address))
        );
    }, []);

    const addWebSocketDevice = useCallback(() => {
        const address = window.prompt("Enter the address of WebSockify server");
        if (!address) {
            return;
        }
        setWebSocketDeviceList((list) => {
            const copy = list.slice();
            copy.push(new AdbDaemonWebSocketDevice(address));
            globalThis.localStorage.setItem(
                "ws-backend-list",
                JSON.stringify(copy.map((x) => ({ address: x.serial })))
            );
            return copy;
        });
    }, []);

    const [tcpDeviceList, setTcpDeviceList] = useState<
        AdbDaemonDirectSocketsDevice[]
    >([]);
    useEffect(() => {
        if (!AdbDaemonDirectSocketsDevice.isSupported()) {
            return;
        }

        const savedList = localStorage.getItem("tcp-backend-list");
        if (!savedList) {
            return;
        }

        const parsed = JSON.parse(savedList) as {
            address: string;
            port: number;
        }[];
        setTcpDeviceList(
            parsed.map(
                (x) => new AdbDaemonDirectSocketsDevice(x.address, x.port)
            )
        );
    }, []);

    const addTcpDevice = useCallback(() => {
        const host = window.prompt("Enter the address of device");
        if (!host) {
            return;
        }

        const port = window.prompt("Enter the port of device", "5555");
        if (!port) {
            return;
        }

        const portNumber = Number.parseInt(port, 10);

        setTcpDeviceList((list) => {
            const copy = list.slice();
            copy.push(new AdbDaemonDirectSocketsDevice(host, portNumber));
            globalThis.localStorage.setItem(
                "tcp-backend-list",
                JSON.stringify(
                    copy.map((x) => ({
                        address: x.host,
                        port: x.port,
                    }))
                )
            );
            return copy;
        });
    }, []);

    const [pipingBackendList, setPipingBackendList] = useState<AdbPipingBackend[]>([]);

    useEffect(() => {
        const pipingSererUrl = router.query["server"] as string ?? "https://ppng.io";
        const csPath = router.query["cs_path"] as string | undefined;
        const scPath = router.query["sc_path"] as string | undefined;
        if (csPath === undefined || scPath === undefined) {
            return;
        }
        const headersString = router.query["headers"] as string | undefined;
        const headers = headersString === undefined ? undefined : new Headers(JSON.parse(decodeURIComponent(headersString)));
        const adbPipingBackend = new AdbPipingBackend({
            csUrl: urlJoin(pipingSererUrl, csPath),
            scUrl: urlJoin(pipingSererUrl, scPath),
            scHeaders: headers,
            csHeaders: headers,
        });
        setPipingBackendList([adbPipingBackend]);
        // setSelectedBackend(adbPipingBackend);
        setSelected(adbPipingBackend);
        const autoConnectString = router.query["auto_connect"] as string | undefined;
        setAutoConnect(autoConnectString === "" || autoConnectString === "true" || autoConnectString === "1");
    }, [router]);

    useEffect(() => {
        if (autoConnect) {
            console.log("auto connecting...", selected);
            connect();
        }
    }, [autoConnect]);


    const handleSelectedChange = (
        e: React.FormEvent<HTMLDivElement>,
        option?: IDropdownOption
    ) => {
        setSelected(option?.data as AdbDaemonDevice);
    };

    const addUsbDevice = useCallback(async () => {
        const device =
            await AdbDaemonWebUsbDeviceManager.BROWSER!.requestDevice();
        setSelected(device);
        await updateUsbDeviceList();
    }, [updateUsbDeviceList]);

    const connect = useCallback(async () => {
        if (!selected) {
            return;
        }

        setConnecting(true);

        let readable: ReadableStream<AdbPacketData>;
        let writable: WritableStream<Consumable<AdbPacketInit>>;
        try {
            const streams = await selected.connect();

            // Use `InspectStream`s to intercept and log packets
            readable = streams.readable.pipeThrough(
                new InspectStream((packet) => {
                    GLOBAL_STATE.appendLog("in", packet);
                })
            );

            writable = pipeFrom(
                streams.writable,
                new InspectStream((packet: Consumable<AdbPacketInit>) => {
                    GLOBAL_STATE.appendLog("out", packet.value);
                })
            );
        } catch (e: any) {
            GLOBAL_STATE.showErrorDialog(e);
            setConnecting(false);
            return;
        }

        async function dispose() {
            // Adb won't close the streams,
            // so manually close them.
            try {
                readable.cancel();
            } catch {}
            try {
                await writable.close();
            } catch {}
            GLOBAL_STATE.setDevice(undefined, undefined);
        }

        try {
            const device = new Adb(
                await AdbDaemonTransport.authenticate({
                    serial: selected.serial,
                    connection: { readable, writable },
                    credentialStore: CredentialStore,
                })
            );

            device.disconnected.then(
                async () => {
                    await dispose();
                },
                async (e) => {
                    GLOBAL_STATE.showErrorDialog(e);
                    await dispose();
                }
            );

            GLOBAL_STATE.setDevice(selected, device);
        } catch (e: any) {
            GLOBAL_STATE.showErrorDialog(e);
            await dispose();
        } finally {
            setConnecting(false);
        }
    }, [selected]);

    const disconnect = useCallback(async () => {
        try {
            await GLOBAL_STATE.adb!.close();
        } catch (e: any) {
            GLOBAL_STATE.showErrorDialog(e);
        }
    }, []);

    const deviceList = useMemo(
        () =>
            ([] as AdbDaemonDevice[]).concat(
                usbDeviceList,
                webSocketDeviceList,
                tcpDeviceList,
                pipingBackendList,
            ),
        [usbDeviceList, webSocketDeviceList, tcpDeviceList, pipingBackendList]
    );

    const deviceOptions = useMemo(() => {
        return deviceList.map((device) => ({
            key: device.serial,
            text: `${device.serial} ${device.name ? `(${device.name})` : ""}`,
            data: device,
        }));
    }, [deviceList]);

    useEffect(() => {
        setSelected((old) => {
            if (old) {
                const current = deviceList.find(
                    (device) => device.serial === old.serial
                );
                if (current) {
                    return current;
                }
            }

            return deviceList.length ? deviceList[0] : undefined;
        });
    }, [deviceList]);

    const addMenuProps = useMemo(() => {
        const items = [];

        if (usbSupported) {
            items.push({
                key: "usb",
                text: "USB",
                onClick: addUsbDevice,
            });
        }

        items.push({
            key: "websocket",
            text: "WebSocket",
            onClick: addWebSocketDevice,
        });

        if (AdbDaemonDirectSocketsDevice.isSupported()) {
            items.push({
                key: "direct-sockets",
                text: "Direct Sockets TCP",
                onClick: addTcpDevice,
            });
        }

        return {
            items,
        };
    }, [usbSupported, addUsbDevice, addWebSocketDevice, addTcpDevice]);

    return (
        <Stack tokens={{ childrenGap: 8, padding: "0 0 8px 8px" }}>
            <Dropdown
                disabled={!!GLOBAL_STATE.adb || deviceOptions.length === 0}
                label="Available devices"
                placeholder="No available devices"
                options={deviceOptions}
                styles={DropdownStyles}
                dropdownWidth={300}
                selectedKey={selected?.serial}
                onChange={handleSelectedChange}
            />

            {!GLOBAL_STATE.adb ? (
                <Stack horizontal tokens={CommonStackTokens}>
                    <StackItem grow shrink>
                        <PrimaryButton
                            iconProps={{ iconName: Icons.PlugConnected }}
                            text="Connect"
                            disabled={!selected}
                            primary={!!selected}
                            styles={{ root: { width: "100%" } }}
                            onClick={connect}
                        />
                    </StackItem>
                    <StackItem grow shrink>
                        <DefaultButton
                            iconProps={{ iconName: Icons.AddCircle }}
                            text="Add"
                            split
                            splitButtonAriaLabel="Add other connection type"
                            menuProps={addMenuProps}
                            disabled={!usbSupported}
                            primary={!selected}
                            styles={{ root: { width: "100%" } }}
                            onClick={addUsbDevice}
                        />
                    </StackItem>
                </Stack>
            ) : (
                <DefaultButton
                    iconProps={{ iconName: Icons.PlugDisconnected }}
                    text="Disconnect"
                    onClick={disconnect}
                />
            )}

            <Dialog
                hidden={!connecting}
                dialogContentProps={{
                    title: "Connecting...",
                    subText: "Please authorize the connection on your device",
                }}
            >
                <ProgressIndicator />
            </Dialog>
        </Stack>
    );
}

export const Connect = observer(_Connect);
