async function checkGradingServer() {
    try {
        const response = await fetch(`http://localhost:3000/available`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        return data.result;
    } catch (error) {
        console.error(error.message);
    }
}

async function getStatus(boxID) {
    try {
        const response = await fetch(`http://localhost:3000/subStatus`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ boxID })
        });
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        return data.result;
    } catch (error) {
        console.error(error.message);
    }
}

async function submit(code, problem, testcaseCount) {
    try {
        const response = await fetch(`http://localhost:3000/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, problem, testcaseCount })
        });
        const data = await response.json();
        console.log(data);
        if (data.error) {
            throw new Error(data.error);
        }
        return data.result;
    } catch (error) {
        throw new Error(error.message);
    }
}

let alreadySubmitting = false;

export async function submitCode(document, problem, testcaseCount) {
    if (alreadySubmitting) {
        return;
    }
    alreadySubmitting = true;
    console.log("Attempted to submit code!");
    const code = document.getElementById("code").value;
    
    const outputArea = document.getElementById("output");
    let boxID = await checkGradingServer();
    while (boxID == -1) {
        outputArea.innerHTML = "Waiting for grading server...";
        await new Promise(resolve => setTimeout(resolve, 500));
        boxID = await checkGradingServer();
    }
    let completed = false;
    const completedResults = submit(code, problem, testcaseCount).then((res) => {
        completed = true;
        return res;
    });
    while (!completed) {
        const curResult = await getStatus(boxID);
        displayStatus(outputArea, curResult);
    }
    displayStatus(outputArea, await completedResults);
    alreadySubmitting = false;
}

function displayStatus(outputArea, results) {
    outputArea.innerHTML = "";
    results.forEach(line => {
        const p = document.createElement("p");
        p.style.color = getColor(line);
        p.textContent = line;
        outputArea.appendChild(p);
    });
}

function getColor(line) {
    if (line.includes("Accepted")) {
        return "green";
    } else if (line.includes("Wrong Answer") || 
               line.includes("Time Limit Exceeded") || 
               line.includes("Runtime Error") ||
               line.includes("Memory Limit Exceeded")) {
        return "red";
    }
    return "gray";
}