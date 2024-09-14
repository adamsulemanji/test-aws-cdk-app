import * as cdk from 'aws-cdk-lib';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';

import { Construct } from 'constructs';

export class TestAwsCdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    new Queue(this, 'TestAwsCdkAppQueue', {
      visibilityTimeout: cdk.Duration.seconds(300)
    });

    new Queue(this, 'TestAwsCdkAppDeadLetterQueue', {
      visibilityTimeout: cdk.Duration.seconds(300)
    });


    // Define the pipeline
    new CodePipeline(this, 'Pipeline', {
      pipelineName: 'CDKPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('adamsulemanji/test-aws-cdk-app', 'master', {
          authentication: cdk.SecretValue.secretsManager("github_token2")
        }),
        commands: [
          'npm ci',
          'npm run build',
          'npx cdk synth'
        ]
      }),
    });

  }
}
