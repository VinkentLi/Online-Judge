import { submitCode } from "/problems/submit.js";

// only change this value
const testcaseCount = 2;

const problem = window.location.pathname.slice("/problems/".length, window.location.pathname.length-1);
document.getElementById("runButton").onclick = () => { submitCode(document, problem, testcaseCount) };
