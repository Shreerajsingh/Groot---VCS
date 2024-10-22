#!/usr/bin/env node

import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { diffLines } from 'diff';
import chalk from 'chalk';
import { Command } from 'commander';
import { argv } from 'process';


const program = new Command();

class Groot {
    constructor(repoPath = '.') {
        this.repoPath = path.join(repoPath, '.groot');              // .groot/
        this.headPath = path.join(this.repoPath, 'HEAD');           // .groot/HEAD
        this.indexPath = path.join(this.repoPath, 'index');         // .groot/index
        this.objectsPath = path.join(this.repoPath, 'objects');     // .groot/objects/
        this.init();
    }

    async init() {
        await fs.mkdir(this.objectsPath, {recursive: true});
        try {
            await fs.writeFile(this.headPath, '' ,{flag: 'wx'});    // wx: open for writing. fails if file exists.
            await fs.writeFile(this.indexPath , JSON.stringify([]), {flag: 'wx'});
        } catch (error) {
            console.log("Already initialised the .groot folder");
        }
    }

    hashObject(content) {
        return crypto.createHash('sha1').update(content, 'utf-8').digest('hex');
    }

    async add(fileToBeAdded) {
        // fileTobeAdded: path/to/file
        const fileData = await fs.readFile(fileToBeAdded, {encoding: 'utf-8'});     // Read the file
        const fileHash = await this.hashObject(fileData);                           // Hash the file
        console.log(fileHash);

        const newFileHashedObjectPath = path.join(this.objectsPath, fileHash);      // .groot/objects/abc123
        await fs.writeFile(newFileHashedObjectPath, fileData)
        await this.updateStagingArea(fileToBeAdded, fileHash);
        console.log(`Added ${fileToBeAdded}`);
    }

    async updateStagingArea(filePath, fileHash) {
        const index = JSON.parse(await fs.readFile(this.indexPath, {encoding: 'utf-8'}));   // Read the index file
        index.push({path: filePath, hash: fileHash});                   // Add the file to the index
        await fs.writeFile(this.indexPath, JSON.stringify(index));      // Write the updated index file
    }

    async commit(message) {
        const index = JSON.parse(await fs.readFile(this.indexPath, {encoding: 'utf-8'}));
        const parentCommit = await this.getCurrentHead();

        const commitData = {
            timeStamp: new Date().toISOString(),
            message,
            files: index,
            parent: parentCommit
        }

        const commitHash = await this.hashObject(JSON.stringify(commitData));
        const commitPath = path.join(this.objectsPath, commitHash);
        await fs.writeFile(commitPath, JSON.stringify(commitData));
        await fs.writeFile(this.headPath, commitHash);
        await fs.writeFile(this.indexPath, JSON.stringify([]));

    }

    async getCurrentHead() {
        try {
            return await fs.readFile(this.headPath, {encoding: 'utf-8'});
        } catch (error) {
            return null;
        }
    }

    async log() {
        let currentCommitHash = await this.getCurrentHead();

        while(currentCommitHash) {
            const commitData = JSON.parse(await fs.readFile(path.join(this.objectsPath, currentCommitHash), {encoding: 'utf-8'}));

            console.log(`Commit: ${currentCommitHash}\nDate: ${commitData.timeStamp}\n\n  ${commitData.message}\n\n`);

            currentCommitHash = commitData.parent;
        }
    }

    async showCommitDiff(commitHash) {
        const commitData = JSON.parse(await this.getCommitData(commitHash));

        if(!commitData) {
            console.log("Commit not found");
            return;
        }

        console.log("Changes in the last commit are: \n");

        for(const file of commitData.files) {
            console.log(`File: ${file.path}`);
            const fileContent = await this.getFileContent(file.hash);

            if(commitData.parent) {
                const parentCommitData = JSON.parse(await this.getCommitData(commitData.parent));
                const parentFileContent = await this.getParentFileContent(parentCommitData, file.path);

                if(parentFileContent !== undefined) {
                    console.log('\nDiff:')
                    const diff = diffLines(parentFileContent, fileContent);

                    // console.log(diff);

                    diff.forEach(part => {
                        if(part.added) {
                            process.stdout.write(chalk.green("++"+part.value));
                        } else if(part.removed) {
                            process.stdout.write(chalk.red("--"+part.value));
                        } else {
                            process.stdout.write(chalk.gray(part.value));
                        }

                        console.log();  // new line
                    })
                } else {
                    console.log("New file in this commit");
                }
                console.log();
            } else {
                console.log("First commit");
            }
        }

    }

    async getParentFileContent(parentCommitData, filePath) {
        const parentFile = parentCommitData.files.find(file => file.path === filePath);

        if(parentFile) {
            return await this.getFileContent(parentFile.hash);
        }
    }

    async getCommitData(commitHash) {
        const commitPath = path.join(this.objectsPath, commitHash);
        try {
            return await fs.readFile(commitPath, {encoding: 'utf-8'});
        } catch (error) {
            console.log("Failed to read the commit data", error);
            return null;
        }
    }

    async getFileContent(fileHash) {
        const filePath = path.join(this.objectsPath, fileHash);
        return await fs.readFile(filePath, {encoding: 'utf-8'});
    }
}

// (async () => {
//     const groot = new Groot();
//     // await groot.add('sample.txt');
//     // await groot.add('sample2.txt');
//     // await groot.commit("Diff test commit 1");

//     // await groot.log();

//     // await groot.showCommitDiff('d0c3aee42bfb0913b27ca7a13133760b9f4cb0b6');
// })();

program.command('init').action(async () => {
    const groot = new Groot();
})

program.command('add <file>').action(async (file) => {
    const groot = new Groot();
    await groot.add(file);
})

program.command('commit <message>').action(async (message) => {
    const groot = new Groot();
    await groot.commit(message);
})

program.command('log').action(async () => {
    const groot = new Groot();
    await groot.log();
})

program.command('show <commitHash>').action(async (commitHash) => {
    const groot = new Groot();
    await groot.showCommitDiff(commitHash);
})

program.parse(argv);