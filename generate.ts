import sharp from "sharp";
import SkyFiles from "skyfiles";
import SkyUtil from "skyutil";
import 목어파츠 from "./parts/목어파츠/목어파츠.json";
import 백호파츠 from "./parts/백호파츠/백호파츠.json";
import 삼족오파츠 from "./parts/삼족오파츠/삼족오파츠.json";
import 주작파츠 from "./parts/주작파츠/주작파츠.json";
import 청룡파츠 from "./parts/청룡파츠/청룡파츠.json";
import 현무파츠 from "./parts/현무파츠/현무파츠.json";
import results from "./results.json";

const generate = async (path: string, parts: any) => {

    const id = (results as any).length;

    const result: any = {
        id,
        attributes: [],
    };

    const imageParts: any[] = [];

    for (const [traitId, trait] of parts.entries()) {

        let totalPercent = 0;
        let percentCount = 0;
        for (const part of trait.parts) {
            if ((part as any).percent !== undefined) {
                totalPercent += (part as any).percent;
                percentCount += 1;
            }
        }
        const basePercent = (100 - totalPercent) / (trait.parts.length - percentCount);

        let rand = Math.random() * 100;
        for (const [partId, part] of trait.parts.entries()) {
            rand -= (part as any).percent === undefined ? basePercent : (part as any).percent;
            if (rand <= 0) {
                result.attributes.push({ trait_type: trait.name, value: part.name });
                imageParts.push({ traitId, partId });
                break;
            }
        }
    }

    // check duplicated
    if ((results as any).find((r: any) => JSON.stringify(r.attributes) === JSON.stringify(result.attributes)) !== undefined) {
        // retry.
        await generate(path, parts);
    }

    else {
        (results as any).push(result);

        let images: any[] = [];
        for (const imagePart of imageParts) {
            images = images.concat(parts[imagePart.traitId].parts[imagePart.partId].images);
        }
        images.sort((a, b) => a.order - b.order);

        const parameters: any[] = [];
        for (const image of images) {
            if (image !== undefined) {
                parameters.push({ input: path + image.path });
            }
        }

        await sharp({
            create: {
                width: 945,
                height: 945,
                channels: 4,
                background: { r: 255, g: 167, b: 173, alpha: 0 }
            }
        })
            .composite(parameters)
            .png()
            .toFile(`results/${id}.png`);

        console.log(`#${id} generated.`);
    }
};

(async () => {
    await SkyUtil.repeatResultAsync(328, async () => await generate("parts/목어파츠/", 목어파츠));
    await SkyUtil.repeatResultAsync(328, async () => await generate("parts/삼족오파츠/", 삼족오파츠));
    await SkyUtil.repeatResultAsync(327, async () => await generate("parts/청룡파츠/", 청룡파츠));
    await SkyUtil.repeatResultAsync(327, async () => await generate("parts/주작파츠/", 주작파츠));
    await SkyUtil.repeatResultAsync(327, async () => await generate("parts/백호파츠/", 백호파츠));
    await SkyUtil.repeatResultAsync(327, async () => await generate("parts/현무파츠/", 현무파츠));

    for (let i = results.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [results[i], results[j]] = [results[j], results[i]];
    }

    for (const [id, result] of results.entries()) {
        await SkyFiles.write(`results-shuffle/${id}.png`, await SkyFiles.readBuffer(`results/${(result as any).id}.png`));
        (result as any).id = id;
    }

    await SkyFiles.write("results.json", JSON.stringify(results));
})();
