// const LFT = require("leanft");
// const fs = require("fs");
// const path = require("path");
// const xlsx = require("xlsx");
// const { XMLParser } = require("fast-xml-parser");
// const { execSync } = require("child_process");

// // Import custom modules
// const FlightAppModel = require("../AppModels/FlightAppModel");
// const library = require("../Libraries/flightAppFunctions");

// const baseDir = path.join(__dirname, "..");
// const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
// const appConfigPath = path.join(baseDir, "ConfigTemplates", "App_Config.xml");
// const appConfigRaw = fs.readFileSync(appConfigPath, "utf8");
// const appConfig = parser.parse(appConfigRaw);
// const envConfig = appConfig.ApplicationConfiguration.EnvironmentSettings;

// async function runFramework() {
    
//     // 1. Initialize Paths
//     const enginePath = path.join(baseDir, "ExecutionEngine");
//     const testDataPath = path.join(baseDir, "TestData", "Master_TestData.xlsx");
    
//     // --- REPORTING SETUP: Initialize Master Folder ---
//     const timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
//     const masterReportDir = path.join(baseDir, "Reports", `Run_${timestamp}`);
//     fs.mkdirSync(masterReportDir, { recursive: true });

//     console.log(`Initializing LeanFT Engine and Reporter...`);
//     // THE FIX: Initialize the Engine and the Reporter SIMULTANEOUSLY.
//     // This prevents the WebSocket race-condition crash.
//     await LFT.init({
//         reporter: {
//             targetDirectory: masterReportDir,
//             reportTitle: `LeanFT Execution - ${timestamp}`
//         }
//     });

//     const appModel = new FlightAppModel(); // Load AppModel AFTER engine is initialized

//     const consolidatedPath = path.join(masterReportDir, "Consolidated_Report.html");
//     fs.writeFileSync(consolidatedPath, `
//         <html>
//         <head>
//             <title>LeanFT Execution Summary</title>
//             <style>
//                 body { font-family: Arial, sans-serif; margin: 20px; }
//                 table { border-collapse: collapse; width: 60%; margin-top: 20px; }
//                 th, td { border: 1px solid #dddddd; text-align: left; padding: 10px; }
//                 th { background-color: #f2f2f2; }
//                 .PASS { color: green; font-weight: bold; }
//                 .FAIL { color: red; font-weight: bold; }
//                 a { text-decoration: none; color: #0066cc; font-weight: bold; }
//                 a:hover { text-decoration: underline; }
//             </style>
//         </head>
//         <body>
//             <h2>LeanFT Automated Execution Summary</h2>
//             <p><b>Run ID:</b> ${timestamp}</p>
//             <table>
//                 <tr><th>Test Case ID</th><th>Status</th><th>Detailed Logs</th></tr>
//     `);
//     // -------------------------------------------------------------------

//     // 2. Load Relational Excel Data
//     const workbook = xlsx.readFile(testDataPath);
//     const masterSheet = xlsx.utils.sheet_to_json(workbook.Sheets["MasterControl"]);

//     // 3. Master Execution Loop
//     for (const row of masterSheet) {
//         if (row.ExecutionFlag && row.ExecutionFlag.toUpperCase() === "YES") {
//             const testID = row.TestID;
//             const template = row.ExecutionFlowTemplate;
            
//             console.log(`\n--------------------------------------------------`);
//             console.log(`Starting Execution for: ${testID}`);
            
//             // --- CREATE A VIRTUAL FOLDER FOR THIS TEST CASE IN LEANFT ---
//             // This safely groups the logs without breaking the connection
//             LFT.Reporter.startReportingContext(testID, `Detailed Execution Logs for ${testID}`);
            
//             // --- A. File Routing: NewRequest -> Working ---
//             const workingFile = path.join(enginePath, "Working", `${testID}.txt`);
//             fs.writeFileSync(workingFile, `Status: RUNNING\nStart Time: ${new Date().toISOString()}\n`);

//             // --- B. Relational Data Mapping ---
//             let testDataDict = { ...row }; 
//             for (const sheetName of workbook.SheetNames) {
//                 if (sheetName !== "MasterControl") {
//                     const childData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
//                     const matchedRow = childData.find(r => r.TestID === testID);
//                     if (matchedRow) {
//                         testDataDict = { ...testDataDict, ...matchedRow };
//                     }
//                 }
//             }

//             // --- C. Parse XML Flow Template ---
//             const xmlRaw = fs.readFileSync(path.join(baseDir, "InputFlowTemplates", template), "utf8");
//             const xmlFlow = parser.parse(xmlRaw);
//             const keywords = xmlFlow.TestFlow.Keyword;
//             const keywordArray = Array.isArray(keywords) ? keywords : [keywords];

//             // --- D. Dynamic Asynchronous Execution ---
//             let testStatus = "PASS";
//             try {
//                 for (let i = 0; i < keywordArray.length; i++) {
//                     const keywordName = keywordArray[i]["@_name"];
//                     console.log(`  Executing Step: [${keywordName}]`);
                    
//                     if (typeof library[keywordName] === "function") {
//                         await library[keywordName](testDataDict, appModel, envConfig);
//                     } else {
//                         throw new Error(`Keyword '${keywordName}' is missing from flightAppFunctions.js!`);
//                     }
//                 }
//             } catch (error) {
//                 console.error(`  [FATAL ERROR] Step failed: ${error.message}`);
//                 testStatus = "FAIL";
                
//                 // Log the exact failure into this specific test case's LeanFT folder
//                 LFT.Reporter.reportEvent("Test Execution Failed", error.message, LFT.Reporter.Status.Failed);
                
//                 try { execSync('taskkill /F /IM FlightsGUI.exe /T', { stdio: 'ignore' }); } catch (e) {}
//             }

//             // --- CLOSE THE VIRTUAL FOLDER FOR THIS TEST CASE ---
//             LFT.Reporter.endReportingContext();
            
//             fs.appendFileSync(consolidatedPath, `
//                 <tr>
//                     <td>${testID}</td>
//                     <td class="${testStatus}">${testStatus}</td>
//                     <td><a href="run_results.html" target="_blank">View in Master Report</a></td>
//                 </tr>
//             `);

//             // --- E. File Routing: Working -> Completed ---
//             const compFile = path.join(enginePath, "Completed", `${testID}.txt`);
//             fs.appendFileSync(workingFile, `Status: ${testStatus}\nEnd Time: ${new Date().toISOString()}\n`);
//             fs.renameSync(workingFile, compFile);
            
//             console.log(`Execution Completed for: ${testID} [${testStatus}]`);
//         }
//     }

//     // --- GENERATE THE FINAL LEANFT REPORT & CLOSE CUSTOM HTML ---
//     // This physically shuts down the engine connection, which is why it MUST be outside the loop!
//     await LFT.Reporter.generateReport();
    
//     fs.appendFileSync(consolidatedPath, `
//             </table>
//         </body>
//         </html>
//     `);
//     console.log(`\n==================================================`);
//     console.log(`Execution Complete!`);
//     console.log(`Consolidated Report saved at: \n${consolidatedPath}`);
//     console.log(`==================================================\n`);

//     await LFT.cleanup();
// }

// // Execute the async framework
// runFramework().catch(err => {
//     console.error("Framework crashed: ", err);
//     LFT.cleanup();
// });
const LFT = require("leanft");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { XMLParser } = require("fast-xml-parser");
const { execSync } = require("child_process");

// Import custom modules
const FlightAppModel = require("../AppModels/FlightAppModel");
const library = require("../Libraries/flightAppFunctions");

const baseDir = path.join(__dirname, "..");
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
const appConfigPath = path.join(baseDir, "ConfigTemplates", "App_Config.xml");
const appConfigRaw = fs.readFileSync(appConfigPath, "utf8");
const appConfig = parser.parse(appConfigRaw);
const envConfig = appConfig.ApplicationConfiguration.EnvironmentSettings;

async function runFramework() {
    
    // 1. Initialize Paths
    const enginePath = path.join(baseDir, "ExecutionEngine");
    const testDataPath = path.join(baseDir, "TestData", "Master_TestData.xlsx");
    
    // --- INITIALIZE CUSTOM REPORTING BUFFERS & DIRECTORIES ---
    const timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
    const indRepPath = path.join(baseDir, "Reports", "Individual");
    const consRepPath = path.join(baseDir, "Reports", "Consolidated");
    
    fs.mkdirSync(indRepPath, { recursive: true });
    fs.mkdirSync(consRepPath, { recursive: true });

    // CSS and JS Strings mapped exactly from VBScript
    const consCss = `<style>body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; margin: 0; background-color: #f4f7f6; color: #333; } .header { background-color: #0033A0; color: white; padding: 20px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); } .container { width: 90%; margin: 20px auto; } .summary-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; display: flex; justify-content: space-between; } .stat-box { text-align: center; padding: 10px 20px; border-radius: 5px; font-size: 18px; font-weight: bold; } .stat-total { background-color: #e2e3e5; color: #383d41; } .stat-pass { background-color: #d4edda; color: #155724; } .stat-fail { background-color: #f8d7da; color: #721c24; } .accordion { background-color: #fff; color: #444; cursor: pointer; padding: 18px; width: 100%; text-align: left; border: 1px solid #ddd; outline: none; transition: 0.4s; font-size: 16px; font-weight: bold; margin-top: 10px; border-radius: 5px; display: flex; justify-content: space-between; align-items: center; } .active, .accordion:hover { background-color: #e9ecef; } .panel { padding: 0 18px; background-color: white; display: none; overflow: hidden; border: 1px solid #ddd; border-top: none; border-bottom-left-radius: 5px; border-bottom-right-radius: 5px; } table { width: 100%; border-collapse: collapse; margin: 15px 0; } th, td { border: 1px solid #ddd; padding: 10px; text-align: left; } th { background-color: #f8f9fa; color: #333; } .badge { padding: 4px 8px; border-radius: 4px; color: white; font-size: 12px; } .badge.pass { background-color: #28a745; } .badge.fail { background-color: #dc3545; } .view-link { color: #0033A0; text-decoration: none; font-size: 14px; margin-left: 15px; } .view-link:hover { text-decoration: underline; }</style>`;
    const indCss = `<style>body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; background-color: #f8f9fa; color: #212529; } .navbar { background-color: #343a40; color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); } .navbar h2 { margin: 0; font-size: 20px; } .container { padding: 20px; max-width: 1200px; margin: auto; } .card { background: white; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.12); padding: 20px; margin-bottom: 20px; border-top: 4px solid #0033A0; } .card h3 { margin-top: 0; color: #0033A0; border-bottom: 1px solid #eee; padding-bottom: 10px; } .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; } .info-item { font-size: 14px; } .info-item strong { display: inline-block; width: 120px; color: #555; } table { width: 100%; border-collapse: collapse; margin-top: 10px; } th, td { border: 1px solid #dee2e6; padding: 12px; text-align: left; font-size: 14px; } th { background-color: #e9ecef; font-weight: 600; color: #495057; } .status-pass { color: #28a745; font-weight: bold; } .status-fail { color: #dc3545; font-weight: bold; }</style>`;
    const jsScript = `<script>function togglePanel(id) { var panel = document.getElementById('panel-' + id); var icon = document.getElementById('icon-' + id); if (panel.style.display === 'block') { panel.style.display = 'none'; icon.innerHTML = '+'; } else { panel.style.display = 'block'; icon.innerHTML = '&minus;'; } }</script>`;

    let htmlExecutionBody = "";
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    const batchStartTime = new Date();
    // ---------------------------------------------------------

    console.log(`Initializing LeanFT Engine...`);
    await LFT.init(); // Native LeanFT Reporter is removed. We use standard engine.

    const appModel = new FlightAppModel();

    // 2. Load Relational Excel Data
    const workbook = xlsx.readFile(testDataPath);
    const masterSheet = xlsx.utils.sheet_to_json(workbook.Sheets["MasterControl"]);

    // 3. Master Execution Loop
    for (const row of masterSheet) {
        if (row.ExecutionFlag && row.ExecutionFlag.toUpperCase() === "YES") {
            totalTests++;
            const testID = row.TestID;
            const template = row.ExecutionFlowTemplate;
            const testStartTime = new Date();
            let testStatus = "PASS";
            
            console.log(`\n--------------------------------------------------`);
            console.log(`Starting Execution for: ${testID}`);
            
            // --- A. INITIALIZE AUDIT LOG BUFFER & FILE TRACKING ---
            let auditBuffer = `=========================================\n  JARVIS EXECUTION AUDIT LOG\n=========================================\nTest ID: ${testID}\nTemplate: ${template}\nStart Time: ${testStartTime.toLocaleString()}\n-----------------------------------------\nTEST DATA PARAMETERS:\n`;
            
            const workingFile = path.join(enginePath, "Working", `${testID}.txt`);
            fs.writeFileSync(workingFile, `Status: RUNNING\nStart Time: ${testStartTime.toISOString()}\n`);

            // --- B. RELATIONAL DATA MAPPING ---
            let testDataDict = { ...row }; 
            for (const sheetName of workbook.SheetNames) {
                if (sheetName !== "MasterControl") {
                    const childData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
                    const matchedRow = childData.find(r => r.TestID === testID);
                    if (matchedRow) {
                        testDataDict = { ...testDataDict, ...matchedRow };
                    }
                }
            }
            
            // Print mapped data to the Audit Log just like VBScript does
            for (const [key, value] of Object.entries(testDataDict)) {
                auditBuffer += `- ${key}: ${value}\n`;
            }
            auditBuffer += `-----------------------------------------\nSTEP TRACE:\n`;

            // --- C. PARSE XML FLOW TEMPLATE ---
            const xmlRaw = fs.readFileSync(path.join(baseDir, "InputFlowTemplates", template), "utf8");
            const xmlFlow = parser.parse(xmlRaw);
            const keywords = xmlFlow.TestFlow.Keyword;
            const keywordArray = Array.isArray(keywords) ? keywords : [keywords];

            // --- D. DYNAMIC EXECUTION & HTML STEP LOGGING ---
            let stepHtmlBuffer = "";
            let stepCounter = 1;
            
            try {
                for (let i = 0; i < keywordArray.length; i++) {
                    const keywordName = keywordArray[i]["@_name"];
                    const stepTime = new Date().toLocaleString();
                    console.log(`  Executing Step: [${keywordName}]`);
                    
                    if (typeof library[keywordName] === "function") {
                        await library[keywordName](testDataDict, appModel, envConfig);
                        
                        // Log Success to buffers
                        stepHtmlBuffer += `<tr><td>${stepCounter}</td><td>Executed Keyword: ${keywordName}</td><td class='status-pass'>PASS</td><td>${stepTime}</td></tr>`;
                        auditBuffer += `[${stepTime}] Step ${stepCounter}: ${keywordName} -> SUCCESS\n`;
                    } else {
                        throw new Error(`Keyword '${keywordName}' is missing from flightAppFunctions.js!`);
                    }
                    stepCounter++;
                }
            } catch (error) {
                const stepTime = new Date().toLocaleString();
                console.error(`  [FATAL ERROR] Step failed: ${error.message}`);
                testStatus = "FAIL";
                
                // Log Failure to buffers
                stepHtmlBuffer += `<tr><td>${stepCounter}</td><td>Failed Keyword | Error: ${error.message}</td><td class='status-fail'>FAIL</td><td>${stepTime}</td></tr>`;
                auditBuffer += `[${stepTime}] Step ${stepCounter}: FAILED -> ${error.message}\n`;
                
                try { execSync('taskkill /F /IM FlightsGUI.exe /T', { stdio: 'ignore' }); } catch (e) {}
            }

            const testEndTime = new Date();
            const testDuration = Math.round((testEndTime - testStartTime) / 1000) + " seconds";
            if (testStatus === "PASS") passedTests++; else failedTests++;

            // --- E. GENERATE INDIVIDUAL EXTENT-STYLE REPORT ---
            const indFileName = `${testID}_${timestamp}.html`;
            const indReportFile = path.join(indRepPath, indFileName);
            
            let iRep = `<!DOCTYPE html><html><head><title>${testID} - Automation Report</title>${indCss}</head><body>`;
            iRep += `<div class='navbar'><h2>Flight App Test Automation Report</h2><span>${testStartTime.toLocaleString()}</span></div>`;
            iRep += `<div class='container'><div class='card'><h3>Execution Summary</h3><div class='info-grid'>`;
            iRep += `<div class='info-item'><strong>Test ID:</strong> ${testID}</div>`;
            iRep += `<div class='info-item'><strong>Template:</strong> ${template}</div>`;
            iRep += `<div class='info-item'><strong>Start Time:</strong> ${testStartTime.toLocaleString()}</div>`;
            iRep += `<div class='info-item'><strong>End Time:</strong> ${testEndTime.toLocaleString()}</div>`;
            iRep += `<div class='info-item'><strong>Duration:</strong> ${testDuration}</div>`;
            iRep += `<div class='info-item'><strong>Status:</strong> <span class='status-${testStatus.toLowerCase()}'>${testStatus}</span></div>`;
            iRep += `</div></div>`;
            iRep += `<div class='card'><h3>Step Details</h3><table><tr><th>#</th><th>Step Description</th><th>Status</th><th>Timestamp</th></tr>`;
            iRep += stepHtmlBuffer;
            iRep += `</table></div></div></body></html>`;
            
            fs.writeFileSync(indReportFile, iRep);

            // --- F. UPDATE CONSOLIDATED ACCORDION HTML ---
            htmlExecutionBody += `<button class='accordion' onclick="togglePanel('${testID}')">`;
            htmlExecutionBody += `<span><strong>${testID}</strong> | Template: ${template}`;
            htmlExecutionBody += `<a href='file:///${indReportFile.replace(/\\/g, '/')}' target='_blank' class='view-link'>[View Individual Report]</a></span>`;
            htmlExecutionBody += `<div><span class='badge ${testStatus.toLowerCase()}'>${testStatus}</span> <span id='icon-${testID}' class='toggle-icon'>+</span></div></button>`;
            htmlExecutionBody += `<div id='panel-${testID}' class='panel'><table><tr><th>Step No.</th><th>Action Description</th><th>Status</th><th>Timestamp</th></tr>`;
            htmlExecutionBody += stepHtmlBuffer.replace(/status-pass/g, "badge pass").replace(/status-fail/g, "badge fail");
            htmlExecutionBody += `</table></div>`;

            // --- G. FINALIZE AUDIT LOG & MOVE TO COMPLETED ---
            auditBuffer += `=========================================\nFINAL STATUS: ${testStatus}\nEND TIME: ${testEndTime.toLocaleString()}\nDURATION: ${testDuration}\n=========================================\n`;
            
            fs.writeFileSync(workingFile, auditBuffer);
            const compFile = path.join(enginePath, "Completed", `${testID}.txt`);
            fs.renameSync(workingFile, compFile);
            
            console.log(`Execution Completed for: ${testID} [${testStatus}]`);
        }
    }

    // --- 7. CONSTRUCT THE FINAL CONSOLIDATED DASHBOARD ---
    const consReportFile = path.join(consRepPath, `Execution_Dashboard_${timestamp}.html`);
    let cRep = `<!DOCTYPE html><html><head><title>Jarvis Automation Dashboard</title>${consCss}${jsScript}</head><body>`;
    cRep += `<div class='header'><h2>Jarvis Automation Execution Dashboard</h2><p>Executed on: ${batchStartTime.toLocaleString()}</p></div>`;
    cRep += `<div class='container'><div class='summary-card'>`;
    cRep += `<div class='stat-box stat-total'>Total Scripts Executed<br><span style='font-size: 24px;'>${totalTests}</span></div>`;
    cRep += `<div class='stat-box stat-pass'>Total Passed<br><span style='font-size: 24px;'>${passedTests}</span></div>`;
    cRep += `<div class='stat-box stat-fail'>Total Failed<br><span style='font-size: 24px;'>${failedTests}</span></div>`;
    cRep += `</div>`;
    cRep += `<h3>Execution Details</h3>`;
    cRep += htmlExecutionBody;
    cRep += `</div></body></html>`;

    fs.writeFileSync(consReportFile, cRep);

    console.log(`\n==================================================`);
    console.log(`Execution Complete!`);
    console.log(`Dashboard saved at: \n${consReportFile}`);
    console.log(`==================================================\n`);

    await LFT.cleanup();
}

// Execute the async framework
runFramework().catch(err => {
    console.error("Framework crashed: ", err);
    LFT.cleanup();
});