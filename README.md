Bank of America POC: Modernized LeanFT (Node.js) Framework
📌 Project Overview
This repository contains a modernized, 1-to-1 localized replica of the legacy Bank of America "Jarvis" automated testing framework. Migrated from legacy UFT One (VBScript) to OpenText UFT Developer (LeanFT) using Node.js, this Proof of Concept (POC) proves that enterprise-grade architecture—including XML keyword-driven flows, relational Excel data binding, and custom file-routing engines—can be seamlessly executed in a modern, asynchronous JavaScript environment.

🏗️ Core Architecture & Components
This framework maintains the highly structured, Keyword-Driven and Data-Driven hybrid approach of the legacy Jarvis system, decoupling test data, execution flows, and physical UI interactions into scalable, modular files.

1. The Execution Engine (State Tracking)
Using Node.js native File System (fs) modules, the framework dynamically routes state-tracking text files through physical directories to simulate an enterprise server queue:

ExecutionEngine/NewRequest/: Where tests queue up before execution.

ExecutionEngine/Working/: Where the active test tracker and real-time audit logs are written during execution.

ExecutionEngine/Completed/: Where the tracker file is archived upon successful/failed run completion.

2. Master Control Data (Master_TestData.xlsx)
An Excel workbook acts as the relational database for the execution, parsed asynchronously using the xlsx NPM library. It contains:

Execution flags (Yes/No) dictating which tests run.

Relational Data Mapping (Usernames, Passwords, Search Criteria) pulled from multiple child sheets and fed directly into JavaScript test dictionaries.

Mapping to the specific XML Flow Template required for the test case.

3. Input Flow Templates (.xml)
XML files define the exact sequence of business steps (Keywords) for a given scenario. These are parsed dynamically using fast-xml-parser, allowing non-technical users to build and modify test flows without altering the underlying JavaScript code.

4. Function Libraries (.js)
Modular, asynchronous JavaScript files (e.g., flightAppFunctions.js) containing the actual execution logic. These functions (async/await) map 1-to-1 with the XML keywords and interact with the application through highly structured Application Models.

5. Application Models (AppModels/)
Replacing legacy binary Object Repositories (.tsr), this framework utilizes LeanFT Application Models. These provide strongly-typed, programmatic object identification, ensuring zero hard-coded physical properties exist within the functional execution scripts.

6. Custom Enterprise Reporting
To maintain exact UI parity with the legacy UFT dashboard, the native LeanFT HTML reporter is bypassed. The framework dynamically generates:

Consolidated Dashboard: A master Extent-style HTML dashboard with expandable accordions tracking overall batch pass/fail metrics.

Individual Test Reports: Dedicated Extent-style HTML step-traces for every executed Test ID.

Audit Logs: Raw text output logs written directly into the Working/Completed directories.

💡 Technical Highlights & WPF Bypasses
During the migration of WPF-based desktop applications, several advanced LeanFT engineering tactics were implemented:

WPF Data-Binding Bypasses: Utilizing .setText() instead of physical keystroke simulation to explicitly trigger WPF's Two-Way Data Binding memory validation.

OS-Level Execution: Fallback integrations using Node's child_process.execSync to fire native PowerShell commands, bypassing complex DPI-scaling or Z-Order invisible shield bugs in the visual object tree.

🛠️ Framework Execution Instructions
Prerequisites
Node.js (v14 or higher) installed.

OpenText UFT Developer (LeanFT) Runtime Engine installed and running in the system tray.

Target Application (e.g., OpenText Flight GUI Application) installed.

Setup & Installation
Clone this repository to your local machine.

Open a terminal at the root of the project.

Install the required Node dependencies:

Bash
npm install leanft xlsx fast-xml-parser
How to Run a Test Batch
Open your terminal or IDE (e.g., VS Code).

CRITICAL: Ensure Microsoft Excel is completely closed. If the Master_TestData.xlsx file is open, it creates a hidden lock file that will crash the parser.

Ensure the target application is closed before starting the run (the script will handle launching and cleanup).

Execute the main driver script:

Bash
node DriverScript/driver.js
Monitor the real-time execution logs in the terminal.

Upon completion, navigate to the newly generated Reports/Run_[Timestamp]/Consolidated/ folder and open the Execution_Dashboard_[Timestamp].html file in any browser to view the results.