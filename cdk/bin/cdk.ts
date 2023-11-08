#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { DatabaseStack } from '../lib/database-stack';
import { WebAppStack } from '../lib/web-app-stack';
import { ApiStack } from '../lib/api-stack';
import { config } from '../config/config'


const envAU = { account: config.AccountId, region: config.Region}

const app = new cdk.App();

const databaseStack = new DatabaseStack(app, 'DatabaseStack', {
    env : envAU
});

const webAppStack = new WebAppStack(app, 'WebAppStack', {
    env : envAU,
    /* dbConnectionString: databaseStack.dbConnectionString.value, */
});

const apiStack = new ApiStack(app, 'ApiStack', {
    env: envAU
})

webAppStack.addDependency(databaseStack);
apiStack.addDependency(databaseStack)
