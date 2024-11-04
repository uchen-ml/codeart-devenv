import * as fs from "node:fs/promises";
import { z } from "zod";

const Schema = z.array(
    z
        .object({
            file: z.string(),
            arguments: z.array(z.string()).default([]),
            directory: z.string(),
        })
        .strict(),
);
type CompilationDatabaseSchema = z.infer<typeof Schema>;

type Record = Omit<CompilationDatabaseSchema[number], "file">;

class CompilationDatabase {
    constructor(private readonly data: Map<string, Record[]>) {}

    stats = () => {
        return {
            entries: this.data.size,
        };
    };

    static read = async (path: string) => {
        const json = (await fs.readFile(path)).toString();
        const database = await Schema.parseAsync(JSON.parse(json));
        const map = new Map<string, Record[]>();
        for (const { file, ...rest } of database) {
            map.set(file, [...(map.get(file) ?? []), rest]);
        }
        return new CompilationDatabase(map);
    };
}

export default class CompilationDatabases {
    read = async (path: string) => {
        if (!this.dbs.has(path)) {
            this.dbs.set(path, CompilationDatabase.read(path));
        }
        return await this.dbs.get(path)!;
    };

    private readonly dbs = new Map<string, Promise<CompilationDatabase>>();
}
