const LFT = require("leanft");
const Keys = LFT.Keys; 
const { exec, execSync } = require("child_process");

module.exports = {
    
    LaunchApp: async function(dataDict, appModel, envConfig) {
        console.log(`    -> Cleaning up old application instances...`);
        try { execSync('taskkill /F /IM FlightsGUI.exe /T', { stdio: 'ignore' }); } catch (e) {}

        const appPath = (envConfig && envConfig.AppPath) 
            ? envConfig.AppPath 
            : "C:\\Program Files (x86)\\OpenText\\Functional Testing\\samples\\Flights Application\\FlightsGUI.exe";
        
        console.log(`    -> Launching Application natively via Node.js...`);
        
        // FIXED: Using a detached exec command. 
        // This launches the GUI and immediately disconnects Node's error-tracking from it,
        // preventing the "ghost errors" when we intentionally kill the app later.
        exec(`"${appPath}"`);

        // Hard wait to allow heavy WPF UI to render into Windows memory
        await new Promise(resolve => setTimeout(resolve, 2000));
    },

    FlightLogin: async function(dataDict, appModel) {
        const flightWindow = appModel.OpenTextMyFlightSample();
        
        const ready = await flightWindow.windowObj.exists(15);
        if (!ready) throw new Error("Flight login window not found within 15s");
        
        // Ensure the window is pulled to the absolute front of your monitor
        await flightWindow.windowObj.activate();
        
        console.log(`    -> Entering Username: ${dataDict["Username"]}`);
        await flightWindow.agentNameEdit().click();
        await flightWindow.agentNameEdit().sendKeys(dataDict["Username"]);
        
        console.log(`    -> Entering Password: ${dataDict["Password"]}`);
        await flightWindow.passwordEdit().click();
        await flightWindow.passwordEdit().sendKeys(dataDict["Password"]); 
        
        // Brief pause to let the UI update
        await new Promise(resolve => setTimeout(resolve, 500)); 

        console.log(`    -> Clicking Login Button...`);
        // Because the app's memory was updated via setText, this button is now 100% active
        await flightWindow.okButton().click();
        
        // Wait 3 seconds for the login screen to transition
        await new Promise(resolve => setTimeout(resolve, 3000));
    },

    // NEW KEYWORD: VerifyLoginSuccess (Required by Search_Flight_Flow.xml & Login_Flow.xml)
    VerifyLoginSuccess: async function(dataDict, appModel) {
        console.log(`    -> Verifying Login Success...`);
        const flightWindow = appModel.OpenTextMyFlightSample();
        
        // Assertion: If the 'Find Flights' button exists, we know we bypassed the login screen
        const isSuccess = await flightWindow.findFlightsButton().exists(10);
        if (!isSuccess) {
            throw new Error("[Assertion Failed] Login successful, but Search screen did not load.");
        }
        console.log(`    -> Login Verification: PASSED`);
    },

    VerifyLoginFailure: async function(dataDict, appModel) {
        console.log(`    -> Verifying Expected Login Failure...`);
        const flightWindow = appModel.OpenTextMyFlightSample();
        
        // Assertion: Look for the Error Dialog defined in your AppModel
        const isFailed = await flightWindow.loginFailedDialog().exists(10);
        if (!isFailed) {
            throw new Error("[Assertion Failed] Expected Invalid Login dialog, but it was not found.");
        }
        console.log(`    -> Expected Login Failure: VERIFIED`);
        
        console.log(`    -> Closing Error Dialog...`);
        // --- THE FIX ---
        // Send the ESCAPE key directly to the dialog object itself, NOT the Desktop.
        await flightWindow.loginFailedDialog().sendKeys(Keys.ESCAPE);
        
        // Wait 1 second for the dialog to visually close before the framework kills the app
        await new Promise(resolve => setTimeout(resolve, 1000));
    },

    // KEYWORD 3: Search Flight
    SearchFlight: async function(dataDict, appModel) {
        const flightWindow = appModel.OpenTextMyFlightSample();
        
        // FIXED: Added .windowObj for synchronization
        const ready = await flightWindow.windowObj.exists(15);
        if (!ready) throw new Error("Flight search window not found within 15s");
        await flightWindow.windowObj.activate();
        
        console.log(`    -> Searching flights from ${dataDict["FromCity"]} to ${dataDict["ToCity"]}`);
        await flightWindow.fromCityCombo().select(dataDict["FromCity"]);
        await flightWindow.toCityCombo().select(dataDict["ToCity"]);
        
        console.log(`    -> Clicking Find Flights`);
        await flightWindow.findFlightsButton().click();
    },

    // NEW KEYWORD: CloseApp (Required by ALL XML Flows)
    CloseApp: async function() {
        console.log(`    -> Closing Application...`);
        // Using Node.js to forcefully kill the app ensures a clean state for the next Test Case
        try { execSync('taskkill /F /IM FlightsGUI.exe /T', { stdio: 'ignore' }); } catch (e) {}
    }
};