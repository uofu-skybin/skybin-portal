
export class SkyFile {
    id: string;
    name: string;
    isDir: boolean;
    size: number;
    modTime: string;
    accessList: Object[];
    blocks: Object[];

    constructor(accessList: Object[], blocks: Object[], id: string, isDir: boolean,
             modTime: string, name: string, size: number) {
        this.accessList = accessList;
        this.blocks = blocks;
        this.id = id;
        this.isDir = isDir;
        this.modTime = modTime;
        this.name = name;
        this.size = size;
    }
}
