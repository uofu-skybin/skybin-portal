
// Metadata for a file stored in skybin.
export interface SkyFile {
    id: string;
    ownerId: string;
    name: string;
    isDir: boolean;
    accessList: any[];
    aesKey: string;
    aesIV: string;
    versions: Version[];
}

export function latestVersion(file: SkyFile): Version {
    if (file.versions.length < 1) {
        throw new Error('File has no versions');
    }
    return file.versions[file.versions.length - 1];
}

// Permission grants the ability to access a file to a
// non-owning user.
export interface Permission {
    renterId: string;
    aesKey: string;
    aesIV: string;
}

// A block of a stored file.
export interface Block {
    id: string;
    num: number;
    size: number;
    sha256hash: string;
    locations: any[];
}

// Metadata for a single version of a file.
export interface Version {
    num: number;
    size: number;
    modTime: string;
    uploadSize: number;
    paddingBytes: number;
    numDataBlocks: number;
    numParityBlocks: number;
    blocks: any[];
}

export class LoadSkyFilesResponse {
    files: SkyFile[];
}
