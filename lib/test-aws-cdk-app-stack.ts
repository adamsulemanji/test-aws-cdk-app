import * as cdk from 'aws-cdk-lib';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { CodePipeline, CodePipelineSource, CodeBuildStep } from 'aws-cdk-lib/pipelines';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import { Construct } from 'constructs';

class TestAwsCdkAppStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);
    new TestAwsCdkAppStack(this, 'TestAwsCdkAppStack');
  }
}

class TestAwsCdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    new Queue(this, 'TestAwsCdkAppQueue', {
      visibilityTimeout: cdk.Duration.seconds(300)
    });
    new Queue(this, 'TestAwsCdkAppDeadLetterQueue', {
      visibilityTimeout: cdk.Duration.seconds(300)
    });
  }
}

export class TestAwsCdkAppPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'CDKPipeline',
      synth: new CodeBuildStep('SynthStep', {
        input: CodePipelineSource.gitHub('adamsulemanji/test-aws-cdk-app', 'master', {
          authentication: cdk.SecretValue.secretsManager("github_token2")
        }),
        installCommands: [
          'npm install -g aws-cdk'
        ],
        commands: [
          'npm ci',
          'npm run build',
          'npx cdk synth'
        ],
        buildEnvironment: {
          buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
        },
      }),
    });

    pipeline.addStage(new TestAwsCdkAppStage(this, 'Deploy'));
  }
}