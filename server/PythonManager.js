const os = require('os');
const { exit } = require('process');

let PYTHON_INSTALLED = false;

function EnsurePythonIsInstalledLinux() {
    if (os.platform() != 'win32') {
        if (!IsPythonInstalled()) {
            console.log(`❌Python 3 is not installed. Installing now...`);
            
            // Install python3 packages. Takes ~15 minutes so not ideal to use.
            InstallPythonPackage();
            
            // Future todo: find a different solution to have nodejs and python3 installed on startup.
            
        } else {
            console.log(`✅Python 3 is installed.`);
            PYTHON_INSTALLED = true;
        }
    } else {
        PYTHON_INSTALLED = true;
    }
}

function InstallPythonPackage() {
    try {
        const exec = require('child_process').exec;
        exec(
            'apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y python3.6',
            (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                }
                // console.log(`stdout: ${stdout}`);
                // console.error(`stderr: ${stderr}`);
                
                if (IsPythonInstalled()) {
                    console.log(`✅Python 3 is now installed.`);
                    PYTHON_INSTALLED = true;
                } else {
                    console.log(`❌Python 3 could not be installed. Exiting.`);
                    exit(1);
                }
            }
        );

    } catch (error) {
        console.log(`❌Python 3 could not be installed. Exiting.`);
        exit(1);
    }
}

function IsPythonInstalled() {
    try {
        const execSync = require('child_process').execSync;
        const output = execSync('python3 --version');
        return output.includes('Python 3');
    } catch (error) {
        return false;
    }
}

function IS_PYTHON_INSTALLED() {
    return PYTHON_INSTALLED;
}

module.exports = {EnsurePythonIsInstalledLinux, IS_PYTHON_INSTALLED};
