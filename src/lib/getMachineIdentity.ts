import os from "os";

export interface MachineIdentity {
    machineId: string;
    username: string;
}

export const getMachineIdentity = (): MachineIdentity => {
    const { username } = os.userInfo();
    const machineId = `${os.hostname()}-${os.platform()}-${os.arch()}`;

    return {
        machineId,
        username,
    };
};
