#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TestAwsCdkAppStack } from '../lib/stack';
import { Pipeline } from '../lib/pipeline';

const app = new cdk.App();
new TestAwsCdkAppStack(app, 'TestAwsCdkAppStack', {
});

new Pipeline(app, 'Pipeline', {});