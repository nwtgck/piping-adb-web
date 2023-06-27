// cspell: ignore apks
// cspell: ignore obbs

import { AdbCommandBase } from "@yume-chan/adb";

export interface AdbBackupOptions {
    apps: string[] | "all" | "all-including-system";
    apks: boolean;
    obbs: boolean;
    shared: boolean;
    widgets: boolean;
    compress: boolean;
    user: number;
}

export class AdbBackup extends AdbCommandBase {
    backup(options: AdbBackupOptions): Promise<void> {
        void options;
        throw new Error("Not implemented");
    }

    restore(options: AdbBackupOptions): Promise<void> {
        void options;
        throw new Error("Not implemented");
    }
}
