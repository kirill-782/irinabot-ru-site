export interface SingleVersionUploadRequest {
    version: string;
    channel: string;
    product: string;
    archive: File;
}

export interface BatchUploadRequest {
    channel: string;
    archive: File;
}

export interface UploadVersionResultOut {
    channel: string;
    product: string;
    version: string;
    filesStored: number;
    newFilesStored: number;
}

export interface UploadVersionDryRunOut {
    channel: string;
    product: string;
    version: string;
    filesToStore: number;
    files: string[];
}

export interface BatchUploadVersionResultOut {
    product: string;
    version: string;
    imported: boolean;
    filesStored: number;
    newFilesStored: number;
    error?: string | null;
}

export interface BatchUploadResultOut {
    channel: string;
    importedVersions: number;
    skippedVersions: number;
    versions: BatchUploadVersionResultOut[];
}

export interface BatchUploadDryRunVersionOut {
    product: string;
    version: string;
    processable: boolean;
    filesToStore: number;
    files: string[];
    error?: string | null;
}

export interface BatchUploadDryRunOut {
    channel: string;
    processableVersions: number;
    failedVersions: number;
    versions: BatchUploadDryRunVersionOut[];
}

export interface ErrorOut {
    error: string;
}
