// Metadata for a file stored in skybin.
export class SkyFile {
    id: string;
    ownerId: string;
    ownerAlias: string;
    name: string;
    isDir: boolean;
    accessList: any[];
    aesKey: string;
    aesIV: string;
    versions: Version[];
}

export function latestVersion(file: SkyFile): Version {
    if (file.versions.length < 1) {
        throw new Error('SkyFile has no versions');
    }
    return file.versions[file.versions.length - 1];
}

// Permission grants the ability to access a file to a
// non-owning user.
export class Permission {
    renterId: string;
    aesKey: string;
    aesIV: string;
}

// A block of a stored file.
export class Block {
    id: string;
    num: number;
    size: number;
    sha256hash: string;
    location: any;
    error: any;
}

// Metadata for a single version of a file.
export class Version {
    modTime: string;
    num: number;
    numDataBlocks: number;
    numParityBlocks: number;
    paddingBytes: number;
    size: number;
    uploadSize: number;
    uploadTime: string;
}

export class GetFilesResponse {
    files: SkyFile[];
}

export class RenterInfo {
    id: string;
    reservedStorage: number;
    freeStorage: number;
    totalContracts: number;
    balance: number;
}

// An upload or download.
// 'sourcePath' and 'destPath' are full path names.
export class Transfer {
    sourcePath: string;
    destPath: string;
    state: string;
    isDir: boolean;
    totalTime: string;
    blocks: any[];
    correctBlocks: number;
    failedBlocks: number;
}

export class ProviderConfig {
    providerId: string;
    publicApiAddress: string;
    metaServerAddress: string;
    localApiAddress: string;
    privateKeyFile: string;
    publicKeyFile: string;
    spaceAvail: number;
    storageRate: number;
}

export class ProviderInfo {
    providerId?: string;
    storageAllocated?: number;
    storageReserved?: number;
    storageUsed?: number;
    storageFree?: number;
    storageRate?: number;
    totalContracts?: number;
    totalBlocks?: number;
    totalRenters?: number;
    balance?: number;
}

export class Contract {
    storageSpace: string;
    renterID: string;
}

export class ContractsResponse {
    contracts: Contract[];
}

export class Transaction {
	userType: string;
	userID: string;
	contractID: string;
	transactionType: string;
	amount: number;
	description: string;
    date: string;
}

export class TransactionsResponse {
    transactions: Transaction[];
}

export class ActivityResponse {
    activity: Activity[];
}

export class Activity {
    requestType?: string;
    blockId?: string;
    renterId?: string;
    time?: Date;
    contract?: Contract;
}

export class ShareResponse {
    message: string;
}

export class DownloadFile {
    blocks: Block[];
    destPath: string;
    fileId: string;
    isDir: boolean;
    name: string;
    totalTimeMs: number;
    versionNum: number;
}

export class DownloadResponse {
    files: DownloadFile[];
    totalTimeMs: number;
}
