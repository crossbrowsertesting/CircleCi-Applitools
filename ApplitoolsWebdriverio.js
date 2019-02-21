var webdriverio = require('webdriverio');
var request = require('request');
var {Eyes, Target} = require('@applitools/eyes.webdriverio');

var username = 'CBT username'; 			// the email address associated with your account
var authkey = 'CBT authkey';					// can be found on the "Manage Account" page of our app
var options = {
  desiredCapabilities: {
    name: 'Selenium Test Example',
    build: '1.0',
    browser_api_name: "FF64",
    os_api_name: "Win10",
    browserName: 'firefox',
    record_video: 'false',
    record_network: 'false'
},
host: "hub.crossbrowsertesting.com",
port: 80,
user: username,
key: authkey      
}

var sessionId;

// Full eyes documentation
// https://applitools.com/docs/api/eyes-sdk/classes-gen/class_eyes/method-eyes-setforcefullpagescreenshot-selenium-javascript.html
var eyes = new Eyes();
eyes.setApiKey('Applitools API Key');
//eyes.setForceFullPageScreenshot(true);

// create your webdriverio.remote with your options as an argument
var driver = webdriverio.remote(options);

var runTest = async () => {
    var score;
    await driver.init();
    sessionId = await driver.requestHandler.sessionID;
    try {
        await eyes.open(driver, 'CrossBrowserTesting', 'My first Applitools test with NodeJS', { width: 800, height: 600 });
        await driver.url('https://crossbrowsertesting.com/visual-testing');
        await eyes.check('Visual Testing', Target.window());
        await eyes.check('Visual Testing2', Target.window());
        // End visual testing. Validate visual correctness.
        await eyes.close();
        score = 'pass';
    } catch (reason) {
        //console.log(reason)
        console.log('Eyes returned differences');
        console.log('See the differences here ' + reason._testResults._url);
        score = 'fail';
    } finally {
        await driver.end();
        await eyes.abortIfNotClosed();
        await setScore(sessionId, score);
        console.log('Test finished!', score);
    }
}

var setScore = async (sessionId, score) => {
    try {
        await request({
            method: 'PUT',
            uri: 'https://crossbrowsertesting.com/api/v3/selenium/' + sessionId,
            body: {'action': 'set_score', 'score': score },
            json: true
        }).auth(username, authkey);
    } catch (err) {
        console.log(err)
    }
}

runTest();
