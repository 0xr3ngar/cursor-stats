import os from "os";

export interface MachineIdentity {
    machineId: string;
}

export const getMachineIdentity = (): MachineIdentity => {
    const machineId = `${os.hostname()}-${os.platform()}-${os.arch()}`;

    return {
        machineId,
    };
};
