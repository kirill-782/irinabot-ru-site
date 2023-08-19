import { Map } from "../models/rest/Map";

export const fileSafaName = (file: string) => {
    return file
        .replace(/\//g, "_")
        .replace(/\\\\/g, "_")
        .replace(/\*/g, "_")
        .replace(/</g, "_")
        .replace(/>/g, "_")
        .replace(/\|/g, "_")
        .replace(/ /g, "_");
};

export const getBotFileName = (fileName: string, id: number) => {
    let result = fileSafaName(fileName);

    // Remove file extension
    result = result.substring(0, result.length - 4);

    if (result.length <= 28) return `${id}_${result}.w3x`;

    return `${id}_${result.substring(0, 15)}_${result.substring(result.length - 12)}.w3x`;
};
