import os from "node:os";

export const getMachineIdentity = () => {
    const { username } = os.userInfo();
    const machineId = `${os.hostname()}-${os.platform()}-${os.arch()}`;

    return {
        machineId,
        username,
    };
};
