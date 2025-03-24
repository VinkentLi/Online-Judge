const fs = require("fs");
const { exec } = require("child_process");

let initializedIsolate = false;
let inProgress = false;
const numBoxes = 5;
// stack of ids
const availableBoxes = new Array(numBoxes).fill(0).map((_, index) => index);
// results for each box
const results = new Array(numBoxes).fill([]);

module.exports.getBoxID = () => {
    if (availableBoxes.length == 0) return -1;
    return availableBoxes.at(-1);
};

module.exports.getStatus = (boxID) => results[boxID];

module.exports.judge = async (code, problem, testcaseCount) => {
    if (availableBoxes.length == 0) {
        console.error("No available grading server. Frontend should check if grading server is available before submitting!");
        return null;
    }
    const boxID = availableBoxes.pop();
    results[boxID] = new Array(testcaseCount).fill("");
    inProgress = true;
    const problemDir = `${__dirname}/problems/${problem}/`;
    const problemExists = fs.existsSync(problemDir);

    if (!problemExists) {
        console.error("Invalid problem!");
        return null;
    }

    const submissionDir = `${problemDir}submissions/`;
    const testcaseDir = problemDir + "testcases/";
    const codeFile = `${submissionDir}code.py`;
    
    if (!initializedIsolate) {
        await initIsolate();
        initializedIsolate = true;
    }

    fs.writeFileSync(codeFile, code);
    fs.copyFileSync(codeFile, `/var/local/lib/isolate/${boxID}/box/code.py`);

    for (let testcase = 1; testcase <= testcaseCount; testcase++) {
        results[boxID][testcase-1] = `Running testcase #${testcase}...`;
        results[boxID][testcase-1] = await runProgram(boxID, submissionDir, testcaseDir, testcase);
    }

    // return it back to the stack
    availableBoxes.push(boxID);
    inProgress = false;

    return results[boxID];
}

async function initIsolate() {
    // run commands concurrently
    const promises = new Array(numBoxes).fill(0).map((_, boxID) =>
        new Promise((resolve) => { exec(`isolate --cg --box-id=${boxID} --init`).on('close', resolve); })
    );
    await Promise.all(promises);
    console.log("Initialized Isolate boxes!");
}

async function runProgram(boxID, submissionDir, testcaseDir, testcase) {
    const timeLimit = 4;
    const timeWall = 2*timeLimit; // used to prevent sleeping
    const memLimit = 256 * 1024; // 256 MB is the USACO limit. could lower to allow more control groups
    const command = `isolate --cg --dir=${submissionDir} --meta=${submissionDir}meta.txt --dir=${testcaseDir} --stdin=${testcaseDir}${testcase}.in --time=${timeLimit} --wall-time=${timeWall} --cg-mem=${memLimit} --box-id=${boxID} --run -- /bin/python3 -O code.py`;
    const expected = fs.readFileSync(testcaseDir+testcase+".out");
    let result = `${testcase}. `;
    const checkOutput = (error, stdout) => {
        const metadata = parseMetafile(submissionDir);
        if (metadata.status == "TO") {
            result += "Time Limit Exceeded";
        } else if (metadata['exitsig'] == 9) { // exit signal 9 is memory limit exceeded i think
            result += "Memory Limit Exceeded";
        } else if (metadata.status != undefined) {
            result += "Runtime Error";
        } else {
            result += stdout == expected ? "Accepted" : "Wrong Answer";
        }
        result += ` (${metadata.time}s, ${(metadata['max-rss']/1024.0).toFixed(2)} MB)`;
    }
    await new Promise((resolve) => { exec(command, checkOutput).on('close', resolve); });
    return result;
}

function parseMetafile(submissionDir) {
    const metadataArr = fs.readFileSync(submissionDir+"meta.txt").toString().split(":").join("\n").split("\n");
    const metadata = {};
    for (let i = 0; i < metadataArr.length-2 /*ignore last two characters*/; i += 2) {
        metadata[metadataArr[i]] = metadataArr[i+1];
    }
    return metadata;
}

async function closeIsolate() {
    console.log("Attempting to close Isolate!");
    const promises = new Array(numBoxes).fill(0).map((_, boxID) =>
        new Promise((resolve) => { exec(`isolate --cg --box-id=${boxID} --cleanup`).on('close', resolve); })
    );
    await Promise.all(promises);
    console.log("Closed Isolate!");
}

process.on("SIGINT", async (code) => {
    await closeIsolate();
    process.exit(code);
});

process.on("SIGTERM", async (code) => {
    await closeIsolate();
    process.exit(code);
});

