# Online Judge
Creates a judge for problems similar to USACO or IOI
## How to set up
NOTE: You **need** to run this on Linux, so make sure you have Linux
1. Install [isolate](https://github.com/ioi/isolate) (if you have a debian-based linux distro, you should create a debian package to install it)
   - Make sure you run `isolate.service` which can be found in the `systemmd` folder (**isolate will not work without it**)
2. Set up node by running `npm install`
3. Change the constant in `problems/getServer.js` to be the server you're hosting on
4. Make a `submissions` folder in `problems/test` (we will probably make it so it's already there)
5. Run `sudo node server.js` to initialize the server
6. The test problem can be found in `localhost:3000/problems/test/`
## How to make a problem
1. Add a folder to the `problems` folder
2. copy and paste the `index.html`, `script.js`, and `style.css` files from the `test` folder into that folder
3. Modify `index.html` to change the problem statement
4. Create a `testcases` folder
5. Modify `script.js` to set the number of testcases you have (we will probably change this so it automatically counts them)
6. For each testcase, **name them in this format**: `[testcaseNumber].in` for input, `[testcaseNumber].out` for output. testcaseNumber is one-indexed
7. Create a `submissions` folder to host submissions
## Special Thanks
- [Lumonike](https://github.com/lumonike), for emailing Brian Dean about what USACO uses for judging. We will use this judge for a project we're working on together
- ChatGPT, for coding the base of the code and giving tips lol
- DuckDuckGo, for giving me answers from StackOverflow
