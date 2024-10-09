
/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';
// Deterministic JSON.stringify()
const stringify  = require('json-stringify-deterministic');
const sortKeysRecursive  = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');
class AssetTransfer extends Contract {
    async InitLedger(ctx) {
        const assets = [
            {
                ID: 'User1',
                Timestamp: '13:13:41',
                Action: 'read',
                Sensitivity: 'yes',
                Status: 'yes',
            },
            {
                ID: 'User1',
                Timestamp: '14:14:11',
                Action: 'read',
                Sensitivity: 'yes',
                Status: 'yes',
            },
            {
                ID: 'User1',
                Timestamp: '13:13:51',
                Action: 'read',
                Sensitivity: 'no',
                Status: 'No',
            },
            {
                ID: 'User1',
                Timestamp: '14:14:15',
                Action: 'read',
                Sensitivity: 'no',
                Status: 'no',
            },
            {
                ID: 'User1',
                Timestamp: '14:14:12',
                Action: 'read',
                Sensitivity: 'yes',
                Status: 'no',
            },
            {
                ID: 'User1',
                Timestamp: '13:13:43',
                Action: 'read',
                Sensitivity: 'no',
                Status: 'yes',
            },
            {
                ID: 'User1',
                Timestamp: '13:13:53',
                Action: 'read',
                Sensitivity: 'yes',
                Status: 'no',
            },
            {
                ID: 'User1',
                Timestamp: '13:13:54',
                Action: 'read',
                Sensitivity: 'no',
                Status: 'yes',
            },
            
            {
                ID: 'User1',
                Timestamp: '13:13:41',
                Action: 'read',
                Sensitivity: 'Yes',
                Status: 'no',
            },
            {
                ID: 'User2',
                Timestamp: '13:13:41',
                Action: 'read',
                Sensitivity: 'Yes',
                Status: 'no',
            },
            
            {
                ID: 'User7',
                Timestamp: '00:0:00',
                Action: 'delete',
                Sensitivity: 'Yes',
                Status: 'yes', 
            },

            {
                ID: 'User7',
                Timestamp: '00:0:01',
                Action: 'delete',
                Sensitivity: 'No',
                Status: 'No',
            },

            {
                ID: 'User7',
                Timestamp: '00:0:02',
                Action: 'delete',
                Sensitivity: 'Yes',
                Status: 'No',
            },

            {
                ID: 'User7',
                Timestamp: '00:0:03',
                Action: 'delete',
                Sensitivity: 'no',
                Status: 'yes',
            },
            {
                ID: 'User1',
                Timestamp: '00:0:05',
                Action: 'Login',
                Sensitivity: 'no',
                Status: 'yes', 
            },
            {
                ID: 'User1',
                Timestamp: '00:0:06',
                Action: 'Login',
                Sensitivity: 'yes',
                Status: 'no',
            },
            {
                ID: 'User1',
                Timestamp: '00:0:07',
                Action: 'Login',
                Sensitivity: 'yes',
                Status: 'yes',
            },
            {
                ID: 'User1',
                Timestamp: '00:0:08',
                Action: 'Login',
                Sensitivity: 'no',
                Status: 'no',
            },

        ];
        for (const asset of assets) {
            asset.docType = 'asset';
            const uniqueKey = `${asset.ID}_${asset.Timestamp}`;
            // example of how to Modify to world state deterministically
            // use convetion of alphabetic order
            // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
            // when retrieving data, in any lang, the order of data will be the same and consequently also the corresonding hash
            await ctx.stub.putState(uniqueKey, Buffer.from(stringify(sortKeysRecursive(asset))));
        }
    }
    // CreateAsset issues a new asset to the world state with given details.
    async CreateAsset(ctx, id, timestamp, action, sensitivity, status) {
       const uniqueKey = `${id}_${timestamp}`; // Create a unique key using the ID and Timestamp
        
        const asset = {
            ID: id,
            Timestamp: timestamp,
            Action: action,
            Sensitivity: sensitivity,
            Status: status,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(uniqueKey, Buffer.from(stringify(sortKeysRecursive(asset))));
        return JSON.stringify(asset);
    }

// CountTotalUsers returns the total number of users (assets) in the ledger.
async CountTotalUsers(ctx) {
    let count = 0;
    const iterator = await ctx.stub.getStateByRange('', ''); // Get all assets from the ledger
    let result = await iterator.next();
    
    // Loop through the assets and count each entry
    while (!result.done) {
        count++; // Increment the count for each asset
        result = await iterator.next();
    }
    console.log('Total users in ledger: ${count}');
    return count; // Return the total count
    
}

///////////////////////////////////////////////////////////////////////////
//Calculation of User risk on Read Action
///////////////////////////////////////////////////////////////////////////




//Function to count total logs on Sensitive assets with action read
//need to add for the read function
 async CountUserLogsWithSensitiveAssetsRead(ctx, userId) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        let count = 0; 
        // Loop through all assets
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            // Check if the asset matches the user ID and has sensitivity "yes"
            if (record.ID === userId && (record.Action == 'read' || record.Action == 'Read')  && (record.Sensitivity === 'yes' || record.Sensitivity === 'Yes')) {
                count += 1; // Increment the count if condition is met
            }
            result = await iterator.next();
        }
        return count; // Return the count of logs
    }
   
//Function to count total logs on NonSensitive assets with action read
   
   
async CountUserLogsWithNonSensitiveAssetsRead(ctx, userId) {
    const allResults = [];
    const iterator = await ctx.stub.getStateByRange('', '');
    let result = await iterator.next();
    let count = 0; // To track the number of logs with status 'No'
    // Loop through all assets
    while (!result.done) {
        const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
        let record;
        try {
            record = JSON.parse(strValue);
        } catch (err) {
            console.log(err);
            record = strValue;
        }
        // Check if the asset matches the user ID and has status 'No'
        if (record.ID === userId && (record.Action == 'read' || record.Action == 'Read')  && (record.Sensitivity === 'no' || record.Sensitivity === 'No')) {
            count += 1; // Increment the count if condition is met
        }
        result = await iterator.next();
    }
    return count; // Return the count of logs
}







//Function to count logs of Failed Attempts on Sensitive Assets with action read
async CountSensitivityYesStatusNoRead(ctx, userId) {
    const allResults = [];
    const iterator = await ctx.stub.getStateByRange('', '');
    let result = await iterator.next();
    let count = 0; // To track the number of logs with status 'No'
    // Loop through all assets
    while (!result.done) {
        const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
        let record;
        try {
            record = JSON.parse(strValue);
        } catch (err) {
            console.log(err);
            record = strValue;
        }
        // Check if the asset matches the user ID and with sensitivity "yes " and has status 'No'
        if (record.ID === userId && (record.Action == 'read' || record.Action == 'Read') && (record.Sensitivity === 'yes' || record.Sensitivity === 'Yes') && (record.Status === 'No' || record.Status === 'no')) {
            count += 1; // Increment the count if condition is met
        }
        result = await iterator.next();
    }
    return count; // Return the count of logs
}


//Function to count logs of Failed Attempts on NonSensitive Assets with action read
    async CountSensitivityNoStatusNoRead(ctx, userId) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        let count = 0; 
        // Loop through all assets
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            // Check if the asset matches the user ID and sensitivity "No" and has status 'No'
            if (record.ID === userId && (record.Action == 'read' || record.Action == 'Read') && (record.Sensitivity === 'no' || record.Sensitivity === 'No') && (record.Status === 'no' || record.Status === 'No')) {
                count += 1; // Increment the count if condition is met
            }
            result = await iterator.next();
        }
        return count; // Return the count of logs
    }






// Function to calculate the probability of maliciousness of user's actions on sensitive resources
async CalculateMaliciousProbabilitySensitiveRead(ctx, userId) {
    // Get the number of logs where Sensitivity is 'yes' and Status is 'no'
    const failedSensitiveLogs = await this.CountSensitivityYesStatusNoRead(ctx, userId);
    
    // Get the total number of logs with sensitive assets for the user
    const totalSensitiveLogs = await this.CountUserLogsWithSensitiveAssetsRead(ctx, userId);
    
    // Check if totalSensitiveLogs is 0 to avoid division by zero
    if (totalSensitiveLogs === 0) {
        return 0; // If there are no sensitive logs, the probability is 0
    }
    
    // Calculate the probability
    const probabilityRead = failedSensitiveLogs / totalSensitiveLogs;
    
    return probabilityRead; // Return the calculated probability
}


// Function to calculate the probability of maliciousness of user's actions on nonsensitive resources
async CalculateMaliciousProbabilityNonSensitiveRead(ctx, userId) {
    // get logs of total Failed Attempts on NonSensitive Assets with action read
    const failedNonSensitiveLogs = await this.CountSensitivityNoStatusNoRead(ctx, userId);
    
    // Get the total number of logs with sensitive assets for the user
    const totalNonSensitiveLogs = await this.CountUserLogsWithNonSensitiveAssetsRead(ctx, userId);
    
    // Check if totalSensitiveLogs is 0 to avoid division by zero
    if (totalNonSensitiveLogs === 0) {
        return 0; // If there are no sensitive logs, the probability is 0
    }
    
    // Calculate the probability
    const probability = failedNonSensitiveLogs / totalNonSensitiveLogs;
    
    return probability; // Return the calculated probability
}

////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////



async CalculateRiskSensitiveRead(ctx, userId) {
    // get logs of total Failed Attempts on NonSensitive Assets with action read
    const ProbfailedSensitiveLogs = await this.CalculateMaliciousProbabilitySensitiveRead(ctx, userId);
    
    // Get the total number of logs with sensitive assets for the user
    const Impact = 0.33;
    
    // Check if totalSensitiveLogs is 0 to avoid division by zero
    if (ProbfailedSensitiveLogs === 0) {
        return 0; // If there are no sensitive logs, the risk is 0
    }
    
    // Calculate the risk
    const Risk = Impact * ProbfailedSensitiveLogs;
    console.log(`Total Risk with action "Read/View" on Sensitive Resources score for user: ${Risk}`);
    return Risk; // Return the calculated Risk
    console.log('RIsk on sensitive resources, ', Risk);
}





//calclating risk of Action "Read" on NonSensitive Assets 
async CalculateRiskNonSensitiveRead(ctx, userId) {
    // get logs of total Failed Attempts on NonSensitive Assets with action read
    const ProbfailedNonSensitiveLogs = await this.CalculateMaliciousProbabilityNonSensitiveRead(ctx, userId);
    
    // Get the total number of logs with sensitive assets for the user
    const Impact = 0.33;
    
    // Check if totalSensitiveLogs is 0 to avoid division by zero
    if (ProbfailedNonSensitiveLogs === 0) {
        return 0; // If there are no sensitive logs, the risk is 0
    }
    
    // Calculate the risk
    const Risk = Impact * ProbfailedNonSensitiveLogs;
    
    return Risk; // Return the calculated Risk
}





async CalculateFinalRiskRead(ctx, userId) {
    // get logs of total Failed Attempts on NonSensitive Assets with action read
    
    const RiskSensitiveRead = await this.CalculateRiskSensitiveRead(ctx, userId);
    const RiskNonSensitiveRead = await this.CalculateRiskNonSensitiveRead(ctx, userId);
    

    
    // Get the total number of logs with sensitive assets for the user
    const WeightSensitive = 0.7;
    const WeightNonSensitive = 0.3;
    
    
    // Calculate the risk
    const Risk = ((WeightSensitive * RiskSensitiveRead) + (WeightNonSensitive * RiskNonSensitiveRead))/ (WeightSensitive + WeightNonSensitive);
    console.log("Hello, " + Risk + "!")
    return Risk; // Return the calculated Risk
}





///////////////////////////////////////////////////////////////////////////
//Calculation of User risk on Delete Action
///////////////////////////////////////////////////////////////////////////


//Function to count total logs on Sensitive assets with action Delete
//need to add for the read function
async CountUserLogsWithSensitiveAssetsDelete(ctx, userId) {
    const allResults = [];
    const iterator = await ctx.stub.getStateByRange('', '');
    let result = await iterator.next();

    let count = 0; // To track the number of logs 

    // Loop through all assets
    while (!result.done) {
        const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
        let record;
        try {
            record = JSON.parse(strValue);
        } catch (err) {
            console.log(err);
            record = strValue;
        }

        // Check if the asset matches the user ID and has sensitivity 'Yes'
        if (record.ID === userId && (record.Action == 'delete' || record.Action == 'Delete')  && (record.Sensitivity === 'yes' || record.Sensitivity === 'Yes')) {
            count += 1; // Increment the count if condition is met
        }

        result = await iterator.next();
    }

    return count; // Return the count of logs
}



//Function to count total logs on NonSensitive assets with action read


async CountUserLogsWithNonSensitiveAssetsDelete(ctx, userId) {
const allResults = [];
const iterator = await ctx.stub.getStateByRange('', '');
let result = await iterator.next();

let count = 0; // To track the number of logs with Sensitivity "No"

// Loop through all assets
while (!result.done) {
    const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
    let record;
    try {
        record = JSON.parse(strValue);
    } catch (err) {
        console.log(err);
        record = strValue;
    }

    // Check if the asset matches the user ID and has Sensitivity 'No'
    if (record.ID === userId && (record.Action == 'delete' || record.Action == 'Delete')  && (record.Sensitivity === 'no' || record.Sensitivity === 'No')) {
        count += 1; // Increment the count if condition is met
    }

    result = await iterator.next();
}

return count; // Return the count of logs
}








//Function to count logs of Failed Attempts on Sensitive Assets with action delete
async CountSensitivityYesStatusNoDelete(ctx, userId) {
const allResults = [];
const iterator = await ctx.stub.getStateByRange('', '');
let result = await iterator.next();

let count = 0; // To track the number of logs with status 'No'

// Loop through all assets
while (!result.done) {
    const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
    let record;
    try {
        record = JSON.parse(strValue);
    } catch (err) {
        console.log(err);
        record = strValue;
    }

    // Check if the asset matches the user ID and has status 'No'
    if (record.ID === userId && (record.Action == 'delete' || record.Action == 'Delete') && (record.Sensitivity === 'yes' || record.Sensitivity === 'Yes') && (record.Status === 'No' || record.Status === 'no')) {
        count += 1; // Increment the count if condition is met
    }

    result = await iterator.next();
}

return count; // Return the count of logs
}



//Function to count logs of Failed Attempts on NonSensitive Assets with action delete

async CountSensitivityNoStatusNoDelete(ctx, userId) {
    const allResults = [];
    const iterator = await ctx.stub.getStateByRange('', '');
    let result = await iterator.next();

    let count = 0; // To track the number of logs with status 'No'

    // Loop through all assets
    while (!result.done) {
        const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
        let record;
        try {
            record = JSON.parse(strValue);
        } catch (err) {
            console.log(err);
            record = strValue;
        }

        // Check if the asset matches the user ID and has sensitivity and status 'No'
        if (record.ID === userId && (record.Action == 'delete' || record.Action == 'Delete') && (record.Sensitivity === 'no' || record.Sensitivity === 'No') && (record.Status === 'no' || record.Status === 'No')) {
            count += 1; // Increment the count if condition is met
        }

        result = await iterator.next();
    }

    return count; // Return the count of logs
}







// Function to calculate the probability of maliciousness of user's actions on sensitive resources
async CalculateMaliciousProbabilitySensitiveDelete(ctx, userId) {
// Get the number of logs where Sensitivity is 'yes' and Status is 'no'
const failedSensitiveLogs = await this.CountSensitivityYesStatusNoDelete(ctx, userId);

// Get the total number of logs with sensitive assets for the user
const totalSensitiveLogs = await this.CountUserLogsWithSensitiveAssetsDelete(ctx, userId);

// Check if totalSensitiveLogs is 0 to avoid division by zero
if (totalSensitiveLogs === 0) {
    return 0; // If there are no sensitive logs, the probability is 0
}

// Calculate the probability
const probabilityDelete = failedSensitiveLogs / totalSensitiveLogs;

return probabilityDelete; // Return the calculated probability
}



// Function to calculate the probability of maliciousness of user's actions on nonsensitive resources
async CalculateMaliciousProbabilityNonSensitiveDelete(ctx, userId) {

// get logs of total Failed Attempts on NonSensitive Assets with action read
const failedNonSensitiveLogs = await this.CountSensitivityNoStatusNoDelete(ctx, userId);

// Get the total number of logs with non sensitive assets for the user
const totalNonSensitiveLogs = await this.CountUserLogsWithNonSensitiveAssetsDelete(ctx, userId);

// Check if totalSensitiveLogs is 0 to avoid division by zero
if (totalNonSensitiveLogs === 0) {
    return 0; // If there are no sensitive logs, the probability is 0
}

// Calculate the probability
const probability = failedNonSensitiveLogs / totalNonSensitiveLogs;

return probability; // Return the calculated probability
}


////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////




async CalculateRiskSensitiveDelete(ctx, userId) {

// get logs of total Failed Attempts on NonSensitive Assets with action delete
const ProbfailedSensitiveLogs = await this.CalculateMaliciousProbabilitySensitiveDelete(ctx, userId);

// Get the total number of logs with sensitive assets for the user
const Impact = 0.33;

// Check if totalSensitiveLogs is 0 to avoid division by zero
if (ProbfailedSensitiveLogs === 0) {
    return 0; // If there are no sensitive logs, the risk is 0
}

// Calculate the risk
const Risk = (Impact * ProbfailedSensitiveLogs) + (Impact * ProbfailedSensitiveLogs);
console.log(`Total Risk with action "Delete" on Sensitive Resources score for user: ${Risk}`);
return Risk; // Return the calculated Risk
}






//calclating risk of Action "Delete" on NonSensitive Assets 

async CalculateRiskNonSensitiveDelete(ctx, userId) {
// get logs of total Failed Attempts on NonSensitive Assets with action delete
const ProbfailedNonSensitiveLogs = await this.CalculateMaliciousProbabilityNonSensitiveDelete(ctx, userId);

const Impact = 0.33;

// Check if total failed nonSensitiveLogs are 0 to avoid division by zero
if (ProbfailedNonSensitiveLogs === 0) {
    return 0; // If there are no sensitive logs, the risk is 0
}

// Calculate the risk
const Risk = (Impact * ProbfailedNonSensitiveLogs) + (Impact * ProbfailedNonSensitiveLogs);

return Risk; // Return the calculated Risk
}






async CalculateFinalRiskDelete(ctx, userId) {
// get logs of total Failed Attempts on NonSensitive Assets with action Delete


const RiskSensitiveDelete = await this.CalculateRiskSensitiveDelete(ctx, userId);
const RiskNonSensitiveDelete = await this.CalculateRiskNonSensitiveDelete(ctx, userId);

// Get the total number of logs with sensitive assets for the user
const WeightSensitive = 0.7;
const WeightNonSensitive = 0.3;

// Calculate the risk
const Risk = ((WeightSensitive * RiskSensitiveDelete) + (WeightNonSensitive * RiskNonSensitiveDelete))/ (WeightSensitive + WeightNonSensitive);

return Risk; // Return the calculated Risk
}


///////////////////////////////////////////
//////////////////////////////////////////
//Calculating Risk of User Against the Action "Modify"
///////////////////////////////////////////


//Function to count total logs on Sensitive assets with action "Modify"
async CountUserLogsWithSensitiveAssetsModify(ctx, userId) {
    const allResults = [];
    const iterator = await ctx.stub.getStateByRange('', '');
    let result = await iterator.next();
    let count = 0; // To track the number of logs with status 'No'
    // Loop through all assets
    while (!result.done) {
        const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
        let record;
        try {
            record = JSON.parse(strValue);
        } catch (err) {
            console.log(err);
            record = strValue;
        }
        // Check if the asset matches the user ID and has status 'No'
        if (record.ID === userId && (record.Action == 'modify' || record.Action == 'Modify')  && (record.Sensitivity === 'yes' || record.Sensitivity === 'Yes')) {
            count += 1; // Increment the count if condition is met
        }
        result = await iterator.next();
    }
    return count; // Return the count of logs
}

//Function to count total logs on NonSensitive assets with action Modify


async CountUserLogsWithNonSensitiveAssetsModify(ctx, userId) {
const allResults = [];
const iterator = await ctx.stub.getStateByRange('', '');
let result = await iterator.next();
let count = 0; // To track the number of logs with status 'No'
// Loop through all assets
while (!result.done) {
    const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
    let record;
    try {
        record = JSON.parse(strValue);
    } catch (err) {
        console.log(err);
        record = strValue;
    }
    // Check if the asset matches the user ID and has status 'No'
    if (record.ID === userId && (record.Action == 'modify' || record.Action == 'Modify')  && (record.Sensitivity === 'no' || record.Sensitivity === 'No')) {
        count += 1; // Increment the count if condition is met
    }
    result = await iterator.next();
}
return count; // Return the count of logs
}



//Function to count logs of Failed Attempts on Sensitive Assets with action Modify
async CountSensitivityYesStatusNoModify(ctx, userId) {
const allResults = [];
const iterator = await ctx.stub.getStateByRange('', '');
let result = await iterator.next();
let count = 0; // To track the number of logs with status 'No'
// Loop through all assets
while (!result.done) {
    const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
    let record;
    try {
        record = JSON.parse(strValue);
    } catch (err) {
        console.log(err);
        record = strValue;
    }
    // Check if the asset matches the user ID and has status 'No'
    if (record.ID === userId && (record.Action == 'modify' || record.Action == 'Modify') && (record.Sensitivity === 'yes' || record.Sensitivity === 'Yes') && (record.Status === 'No' || record.Status === 'no')) {
        count += 1; // Increment the count if condition is met
    }
    result = await iterator.next();
}
return count; // Return the count of logs
}


//Function to count logs of Failed Attempts on NonSensitive Assets with action Modify
async CountSensitivityNoStatusNoModify(ctx, userId) {
    const allResults = [];
    const iterator = await ctx.stub.getStateByRange('', '');
    let result = await iterator.next();
    let count = 0; // To track the number of logs with status 'No'
    // Loop through all assets
    while (!result.done) {
        const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
        let record;
        try {
            record = JSON.parse(strValue);
        } catch (err) {
            console.log(err);
            record = strValue;
        }
        // Check if the asset matches the user ID and has status 'No'
        if (record.ID === userId && (record.Action == 'modify' || record.Action == 'Modify') && (record.Sensitivity === 'no' || record.Sensitivity === 'No') && (record.Status === 'no' || record.Status === 'No')) {
            count += 1; // Increment the count if condition is met
        }
        result = await iterator.next();
    }
    return count; // Return the count of logs
}






// Function to calculate the probability of maliciousness of user's actions on sensitive resources
async CalculateMaliciousProbabilitySensitiveModify(ctx, userId) {
// Get the number of logs where Sensitivity is 'yes' and Status is 'no'
const failedSensitiveLogsModify = await this.CountSensitivityYesStatusNoModify(ctx, userId);

// Get the total number of logs with sensitive assets for the user
const totalSensitiveLogsModify = await this.CountUserLogsWithSensitiveAssetsModify(ctx, userId);

// Check if totalSensitiveLogs is 0 to avoid division by zero
if (totalSensitiveLogsModify === 0) {
    return 0; // If there are no sensitive logs, the probability is 0
}

// Calculate the probability
const probabilityModify = failedSensitiveLogsModify / totalSensitiveLogsModify;

return probabilityModify; // Return the calculated probability
}


// Function to calculate the probability of maliciousness of user's actions on nonsensitive resources
async CalculateMaliciousProbabilityNonSensitiveModify(ctx, userId) {
// get logs of total Failed Attempts on NonSensitive Assets with action Modify
const failedNonSensitiveLogsModify = await this.CountSensitivityNoStatusNoModify(ctx, userId);

// Get the total number of logs with non sensitive assets for the user
const totalNonSensitiveLogsModify = await this.CountUserLogsWithNonSensitiveAssetsModify(ctx, userId);

// Check if totalSensitiveLogs is 0 to avoid division by zero
if (totalNonSensitiveLogsModify === 0) {
    return 0; // If there are no sensitive logs, the probability is 0
}

// Calculate the probability
const probability = failedNonSensitiveLogsModify / totalNonSensitiveLogsModify;

return probability; // Return the calculated probability
}

////////////////////////////////////////////////////
//Calculating Risk for Action Modify on Sesitive Assets



async CalculateRiskSensitiveModify(ctx, userId) {
// get logs of total Failed Attempts on NonSensitive Assets with action Modify
const ProbfailedSensitiveLogsModify = await this.CalculateMaliciousProbabilitySensitiveModify(ctx, userId);

// Get the total number of logs with sensitive assets for the user
const Impact = 0.33;


// Calculate the risk
const Risk = (Impact * ProbfailedSensitiveLogsModify) + (Impact * ProbfailedSensitiveLogsModify);
console.log(`Total Risk with action "Modify" on Sensitive Resources score for user: ${Risk}`);
return Risk; // Return the calculated Risk
console.log('RIsk on sensitive resources, ', Risk);
}





//calclating risk of Action "Modify" on NonSensitive Assets 
async CalculateRiskNonSensitiveModify(ctx, userId) {
// get logs of total Failed Attempts on NonSensitive Assets with action Modify
const ProbfailedNonSensitiveLogsModify = await this.CalculateMaliciousProbabilityNonSensitiveModify(ctx, userId);

// Get the total number of logs with non sensitive assets for the user
const Impact = 0.33;


// Calculate the risk
const Risk = (Impact * ProbfailedNonSensitiveLogsModify) + (Impact * ProbfailedNonSensitiveLogsModify);

return Risk; // Return the calculated Risk
}





async CalculateFinalRiskModify(ctx, userId) {
// get logs of total Failed Attempts on NonSensitive Assets with action Modify

const RiskSensitiveModify = await this.CalculateRiskSensitiveModify(ctx, userId);
const RiskNonSensitiveModify = await this.CalculateRiskNonSensitiveModify(ctx, userId);



// Get the total number of logs with sensitive assets for the user
const WeightSensitive = 0.7;
const WeightNonSensitive = 0.3;


// Calculate the risk
const Risk = ((WeightSensitive * RiskSensitiveModify) + (WeightNonSensitive * RiskNonSensitiveModify))/ (WeightSensitive + WeightNonSensitive);

return Risk; // Return the calculated Risk
}






///////////////////////////////////////////////////////////////////////////
//Calculation of User risk on Create Action
///////////////////////////////////////////////////////////////////////////




//Function to count total logs on Sensitive assets with action Create
//need to add for the Create function
async CountUserLogsWithSensitiveAssetsCreate(ctx, userId) {
    const allResults = [];
    const iterator = await ctx.stub.getStateByRange('', '');
    let result = await iterator.next();
    let count = 0; // To track the number of logs with status 'No'
    // Loop through all assets
    while (!result.done) {
        const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
        let record;
        try {
            record = JSON.parse(strValue);
        } catch (err) {
            console.log(err);
            record = strValue;
        }
        // Check if the asset matches the user ID and has status 'No'
        if (record.ID === userId && (record.Action == 'create' || record.Action == 'Create')  && (record.Sensitivity === 'yes' || record.Sensitivity === 'Yes')) {
            count += 1; // Increment the count if condition is met
        }
        result = await iterator.next();
    }
    return count; // Return the count of logs
}

//Function to count total logs on NonSensitive assets with action Create


async CountUserLogsWithNonSensitiveAssetsCreate(ctx, userId) {
const allResults = [];
const iterator = await ctx.stub.getStateByRange('', '');
let result = await iterator.next();
let count = 0; // To track the number of logs with status 'No'
// Loop through all assets
while (!result.done) {
    const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
    let record;
    try {
        record = JSON.parse(strValue);
    } catch (err) {
        console.log(err);
        record = strValue;
    }
    // Check if the asset matches the user ID and has status 'No'
    if (record.ID === userId && (record.Action == 'create' || record.Action == 'Create')  && (record.Sensitivity === 'no' || record.Sensitivity === 'No')) {
        count += 1; // Increment the count if condition is met
    }
    result = await iterator.next();
}
return count; // Return the count of logs
}







//Function to count logs of Failed Attempts on Sensitive Assets with action Create
async CountSensitivityYesStatusNoCreate(ctx, userId) {
const allResults = [];
const iterator = await ctx.stub.getStateByRange('', '');
let result = await iterator.next();
let count = 0; // To track the number of logs with status 'No'
// Loop through all assets
while (!result.done) {
    const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
    let record;
    try {
        record = JSON.parse(strValue);
    } catch (err) {
        console.log(err);
        record = strValue;
    }
    // Check if the asset matches the user ID and has status 'No'
    if (record.ID === userId && (record.Action == 'create' || record.Action == 'Create') && (record.Sensitivity === 'yes' || record.Sensitivity === 'Yes') && (record.Status === 'No' || record.Status === 'no')) {
        count += 1; // Increment the count if condition is met
    }
    result = await iterator.next();
}
return count; // Return the count of logs
}


//Function to count logs of Failed Attempts on NonSensitive Assets with action Create
async CountSensitivityNoStatusNoCreate(ctx, userId) {
    const allResults = [];
    const iterator = await ctx.stub.getStateByRange('', '');
    let result = await iterator.next();
    let count = 0; // To track the number of logs with status 'No'
    // Loop through all assets
    while (!result.done) {
        const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
        let record;
        try {
            record = JSON.parse(strValue);
        } catch (err) {
            console.log(err);
            record = strValue;
        }
        // Check if the asset matches the user ID and has status 'No'
        if (record.ID === userId && (record.Action == 'create' || record.Action == 'Create') && (record.Sensitivity === 'no' || record.Sensitivity === 'No') && (record.Status === 'no' || record.Status === 'No')) {
            count += 1; // Increment the count if condition is met
        }
        result = await iterator.next();
    }
    return count; // Return the count of logs
}






// Function to calculate the probability of maliciousness of user's actions on sensitive resources
async CalculateMaliciousProbabilitySensitiveCreate(ctx, userId) {
// Get the number of logs where Sensitivity is 'yes' and Status is 'no'
const failedSensitiveLogs = await this.CountSensitivityYesStatusNoCreate(ctx, userId);

// Get the total number of logs with sensitive assets for the user
const totalSensitiveLogs = await this.CountUserLogsWithSensitiveAssetsCreate(ctx, userId);

// Check if totalSensitiveLogs is 0 to avoid division by zero
if (totalSensitiveLogs === 0) {
    return 0; // If there are no sensitive logs, the probability is 0
}

// Calculate the probability
const probabilityCreate = failedSensitiveLogs / totalSensitiveLogs;

return probabilityCreate; // Return the calculated probability
}


// Function to calculate the probability of maliciousness of user's actions on nonsensitive resources
async CalculateMaliciousProbabilityNonSensitiveCreate(ctx, userId) {
// get logs of total Failed Attempts on NonSensitive Assets with action Create
const failedNonSensitiveLogs = await this.CountSensitivityNoStatusNoCreate(ctx, userId);

// Get the total number of logs with non sensitive assets for the user
const totalNonSensitiveLogs = await this.CountUserLogsWithNonSensitiveAssetsCreate(ctx, userId);

// Check if totalSensitiveLogs is 0 to avoid division by zero
if (totalNonSensitiveLogs === 0) {
    return 0; // If there are no non sensitive logs, the probability is 0
}

// Calculate the probability
const probability = failedNonSensitiveLogs / totalNonSensitiveLogs;

return probability; // Return the calculated probability
}

////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////



async CalculateRiskSensitiveCreate(ctx, userId) {
// get logs of total Failed Attempts on NonSensitive Assets with action Create
const ProbfailedSensitiveLogsCreate = await this.CalculateMaliciousProbabilitySensitiveCreate(ctx, userId);

// Get the total number of logs with sensitive assets for the user
const Impact = 0.33;



// Calculate the risk
const Risk = (Impact * ProbfailedSensitiveLogsCreate) + (Impact * ProbfailedSensitiveLogsCreate);
console.log(`Total Risk with action "Create" on Sensitive Resources score for user: ${Risk}`);
return Risk; // Return the calculated Risk
console.log('RIsk on sensitive resources, ', Risk);
}





//calclating risk of Action "Create" on NonSensitive Assets 
async CalculateRiskNonSensitiveCreate(ctx, userId) {
// get logs of total Failed Attempts on NonSensitive Assets with action Create
const ProbfailedNonSensitiveLogs = await this.CalculateMaliciousProbabilityNonSensitiveCreate(ctx, userId);

// Get the total number of logs with sensitive assets for the user
const Impact = 0.33;



// Calculate the risk
const Risk = (Impact * ProbfailedNonSensitiveLogs) + (Impact * ProbfailedNonSensitiveLogs);

return Risk; // Return the calculated Risk
}





async CalculateFinalRiskCreate(ctx, userId) {
// get logs of total Failed Attempts on NonSensitive Assets with action Create

const RiskSensitiveCreate= await this.CalculateRiskSensitiveCreate(ctx, userId);
const RiskNonSensitiveCreate = await this.CalculateRiskNonSensitiveCreate(ctx, userId);



// Get the total number of logs with sensitive assets for the user
const WeightSensitive = 0.7;
const WeightNonSensitive = 0.3;


// Calculate the risk
const Risk = ((WeightSensitive * RiskSensitiveCreate) + (WeightNonSensitive * RiskNonSensitiveCreate))/ (WeightSensitive + WeightNonSensitive);

return Risk; // Return the calculated Risk
}



///////////////////////////////////////////////////////////////////////////
//Calculation of User risk on Login Action
///////////////////////////////////////////////////////////////////////////




//Function to count total logs on Sensitive assets with action Login

async CountUserLogsWithSensitiveAssetsLogin(ctx, userId) {
    const allResults = [];
    const iterator = await ctx.stub.getStateByRange('', '');
    let result = await iterator.next();
    let count = 0; 
    // Loop through all assets
    while (!result.done) {
        const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
        let record;
        try {
            record = JSON.parse(strValue);
        } catch (err) {
            console.log(err);
            record = strValue;
        }
        // Check if the asset matches the user ID and has sensitivity "yes"
        if (record.ID === userId && (record.Action == 'login' || record.Action == 'Login')  && (record.Sensitivity === 'yes' || record.Sensitivity === 'Yes')) {
            count += 1; // Increment the count if condition is met
        }
        result = await iterator.next();
    }
    return count; // Return the count of logs
}

//Function to count total logs on NonSensitive assets with action Login


async CountUserLogsWithNonSensitiveAssetsLogin(ctx, userId) {
const allResults = [];
const iterator = await ctx.stub.getStateByRange('', '');
let result = await iterator.next();
let count = 0; // To track the number of logs with status 'No'
// Loop through all assets
while (!result.done) {
    const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
    let record;
    try {
        record = JSON.parse(strValue);
    } catch (err) {
        console.log(err);
        record = strValue;
    }
    // Check if the asset matches the user ID and has status 'No'
    if (record.ID === userId && (record.Action == 'login' || record.Action == 'Login')  && (record.Sensitivity === 'no' || record.Sensitivity === 'No')) {
        count += 1; // Increment the count if condition is met
    }
    result = await iterator.next();
}
return count; // Return the count of logs
}







//Function to count logs of Failed Attempts on Sensitive Assets with action Login
async CountSensitivityYesStatusNoLogin(ctx, userId) {
const allResults = [];
const iterator = await ctx.stub.getStateByRange('', '');
let result = await iterator.next();
let count = 0; // To track the number of logs with status 'No'
// Loop through all assets
while (!result.done) {
    const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
    let record;
    try {
        record = JSON.parse(strValue);
    } catch (err) {
        console.log(err);
        record = strValue;
    }
    // Check if the asset matches the user ID and with sensitivity "yes " and has status 'No'
    if (record.ID === userId && (record.Action == 'login' || record.Action == 'Login') && (record.Sensitivity === 'yes' || record.Sensitivity === 'Yes') && (record.Status === 'No' || record.Status === 'no')) {
        count += 1; // Increment the count if condition is met
    }
    result = await iterator.next();
}
return count; // Return the count of logs
}


//Function to count logs of Failed Attempts on NonSensitive Assets with action Login
async CountSensitivityNoStatusNoLogin(ctx, userId) {
    const allResults = [];
    const iterator = await ctx.stub.getStateByRange('', '');
    let result = await iterator.next();
    let count = 0; 
    // Loop through all assets
    while (!result.done) {
        const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
        let record;
        try {
            record = JSON.parse(strValue);
        } catch (err) {
            console.log(err);
            record = strValue;
        }
        // Check if the asset matches the user ID and sensitivity "No" and has status 'No'
        if (record.ID === userId && (record.Action == 'login' || record.Action == 'Login') && (record.Sensitivity === 'no' || record.Sensitivity === 'No') && (record.Status === 'no' || record.Status === 'No')) {
            count += 1; // Increment the count if condition is met
        }
        result = await iterator.next();
    }
    return count; // Return the count of logs
}






// Function to calculate the probability of maliciousness of user's actions on sensitive resources
async CalculateMaliciousProbabilitySensitiveLogin(ctx, userId) {
// Get the number of logs where Sensitivity is 'yes' and Status is 'no'
const failedSensitiveLogs = await this.CountSensitivityYesStatusNoLogin(ctx, userId);

// Get the total number of logs with sensitive assets for the user
const totalSensitiveLogs = await this.CountUserLogsWithSensitiveAssetsLogin(ctx, userId);

// Check if totalSensitiveLogs is 0 to avoid division by zero
if (totalSensitiveLogs === 0) {
    return 0; // If there are no sensitive logs, the probability is 0
}

// Calculate the probability
const probabilityLogin = failedSensitiveLogs / totalSensitiveLogs;

return probabilityLogin; // Return the calculated probability
}


// Function to calculate the probability of maliciousness of user's actions on nonsensitive resources
async CalculateMaliciousProbabilityNonSensitiveLogin(ctx, userId) {
// get logs of total Failed Attempts on NonSensitive Assets with action Login
const failedNonSensitiveLogsLoginNS = await this.CountSensitivityNoStatusNoLogin(ctx, userId);

// Get the total number of logs with sensitive assets for the user
const totalNonSensitiveLogsLoginNS = await this.CountUserLogsWithNonSensitiveAssetsLogin(ctx, userId);

// Check if totalSensitiveLogs is 0 to avoid division by zero
if (totalNonSensitiveLogsLoginNS === 0) {
    return 0; // If there are no sensitive logs, the probability is 0
}

// Calculate the probability
const probabilityLoginNS = failedNonSensitiveLogsLoginNS / totalNonSensitiveLogsLoginNS;

return probabilityLoginNS; // Return the calculated probability
}

////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////



async CalculateRiskSensitiveLogin(ctx, userId) {
// get logs of total Failed Attempts on NonSensitive Assets with action Login
const ProbfailedSensitiveLogsLoginS = await this.CalculateMaliciousProbabilitySensitiveLogin(ctx, userId);

// Get the total number of logs with sensitive assets for the user
const Impact = 0.33;

// Check if totalSensitiveLogs is 0 to avoid division by zero
if (ProbfailedSensitiveLogsLoginS === 0) {
    return 0; // If there are no sensitive logs, the risk is 0
}

// Calculate the risk
const RiskLS = Impact * ProbfailedSensitiveLogsLoginS;
console.log(`Total Risk with action "Login" on Sensitive Resources score for user: ${RiskLS}`);
return RiskLS; // Return the calculated Risk
console.log('RIsk on sensitive resources, ', RiskLS);
}





//calclating risk of Action "Login" on NonSensitive Assets 
async CalculateRiskNonSensitiveLogin(ctx, userId) {
// get logs of total Failed Attempts on NonSensitive Assets with action Login
const ProbfailedNonSensitiveLogsLogin = await this.CalculateMaliciousProbabilityNonSensitiveLogin(ctx, userId);

// Get the total number of logs with sensitive assets for the user
const Impact = 0.33;

// Check if totalSensitiveLogs is 0 to avoid division by zero
if (ProbfailedNonSensitiveLogsLogin === 0) {
    return 0; // If there are no sensitive logs, the risk is 0
}

// Calculate the risk
const RiskL = Impact * ProbfailedNonSensitiveLogsLogin;

return RiskL; // Return the calculated Risk
}





async CalculateFinalRiskLogin(ctx, userId) {
// get logs of total Failed Attempts on NonSensitive Assets with action Login

const RiskSensitiveLogin = await this.CalculateRiskSensitiveLogin(ctx, userId);
const RiskNonSensitiveLogin = await this.CalculateRiskNonSensitiveLogin(ctx, userId);



// Get the total number of logs with sensitive assets for the user
const WeightSensitive = 0.7;
const WeightNonSensitive = 0.3;


// Calculate the risk
const Risk = ((WeightSensitive * RiskSensitiveLogin) + (WeightNonSensitive * RiskNonSensitiveLogin))/ (WeightSensitive + WeightNonSensitive);
console.log("Hello, " + Risk + "!")
return Risk; // Return the calculated Risk
}



////////////////////////////////////////////////


////////////////////////////////////////////////


////////////////////////////////////////////////





async CalculateOverallRisk(ctx, userId) {
    // get logs of total Failed Attempts on NonSensitive Assets with action Create
    
    const RiskRead= await this.CalculateFinalRiskRead(ctx, userId);
    const RiskDelete = await this.CalculateFinalRiskDelete(ctx, userId);
    const RiskModify = await this.CalculateFinalRiskModify(ctx, userId);
    const RiskCreate = await this.CalculateFinalRiskCreate(ctx, userId);
    const RiskLogin = await this.CalculateFinalRiskLogin(ctx, userId);

    
    
    
    // Get the total number of logs with sensitive assets for the user
    
    const WeightDelete = 0.25;
    const WeightModify = 0.20;
    const WeightCreate = 0.15;
    const WeightRead = 0.1;
    const WeightLogin = 0.5;
    
    
    // Calculate the risk
    const Risk = ((WeightRead * RiskRead) +(WeightDelete * RiskDelete)+ (WeightModify * RiskModify)+  (WeightCreate * RiskCreate)+  (WeightLogin * RiskLogin))/ (WeightDelete +WeightModify + WeightCreate + WeightRead+ WeightLogin);
    console.log(`Final risk value is ${Risk}`);
    return Risk; // Return the calculated Risk
    }

















































    // ReadAsset returns the asset stored in the world state with given id.
    async ReadAsset(ctx, id) {
        const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return assetJSON.toString();
    }
    // UpdateAsset updates an existing asset in the world state with provided parameters.
    async UpdateAsset(ctx, id, timestamp, action, sensitivity, status) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }
        // overwriting original asset with new asset
        const updatedAsset = {
            ID: id,
            Timestamp: timestamp,
            Action: action,
            Sensitivity: sensitivity,
            Status: status,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        return ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(updatedAsset))));
    }
    // DeleteAsset deletes an given asset from the world state.
    async DeleteAsset(ctx, id) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }
    // AssetExists returns true when asset with given ID exists in world state.
    async AssetExists(ctx, id) {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }
    // TransferAsset updates the owner field of asset with given id in the world state.
    async TransferAsset(ctx, id, newSensitivity) {
        const assetString = await this.ReadAsset(ctx, id);
        const asset = JSON.parse(assetString);
        const oldSensitivity = asset.Sensitivity;
        asset.Sensitivity = newSensitivity;
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
        return oldSensitivity;
    }
    // GetAllAssets returns all assets found in the world state.
    async GetAllAssets(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}
module.exports = AssetTransfer;
