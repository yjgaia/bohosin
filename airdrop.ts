import fs from "fs";
import SkyUtil from "skyutil";
import holders from "./dao-holders.json";

(async () => {
    const addresses: string[] = [];

    for (const [address, count] of Object.entries(holders)) {
        if (count >= 2) {
            SkyUtil.repeat(Math.floor(count / 2), () => {
                addresses.push(address);
            });
        }
    }

    for (let i = 0; i < Math.ceil(addresses.length / 200); i += 1) {
        let tos = "[";
        let ids = "[";
        for (const [id, address] of addresses.entries()) {
            if (id >= i * 200 && id < (i + 1) * 200) {
                if (id > i * 200) {
                    tos += ",";
                    ids += ",";
                }
                tos += `"${address}"`;
                ids += id;
            }
        }
        tos += "]";
        ids += "]";
        fs.writeFileSync(`parameters/parameter-${i}-tos.txt`, tos);
        fs.writeFileSync(`parameters/parameter-${i}-ids.txt`, ids);
    }
})();