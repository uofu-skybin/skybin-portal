
export class SkyFile {
    accessList: Object[];
    blocks: Object[];
    id: string;
    isDir: boolean;
    modTime: string;
    name: string;
    size: number;

    constructor(accessList: Object[], blocks: Object[], id: string, isDir: boolean, modTime: string, name: string, size: number) {
        this.accessList = accessList;
        this.blocks = blocks;
        this.id = id;
        this.isDir = isDir;
        this.modTime = modTime;
        this.name = name;
        this.size = size;
    }
}
