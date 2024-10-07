import * as cdk from 'aws-cdk-lib';
import * as constructs from 'constructs';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class Pipeline extends cdk.Stack {
  constructor(scope: constructs.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ********** S3 BUCKET FOR FRONTEND **********
    const frontendBucket = new s3.Bucket(this, 'FrontendBucket', {
      websiteIndexDocument: 'index.html',
    });

    // ********** PIPELINE ARTIFACTS **********
    const sourceOutput = new codepipeline.Artifact();
    const synthOutput = new codepipeline.Artifact();
    const frontendOutput = new codepipeline.Artifact();

    // ********** GITHUB SOURCE ACTION **********
    const sourceAction = new codepipeline_actions.GitHubSourceAction({
      actionName: 'GitHub_Source',
      owner: 'adamsulemanji',
      repo: 'test-aws-cdk-app',
      oauthToken: cdk.SecretValue.secretsManager('github_token2'),
      output: sourceOutput,
      branch: 'master',
      trigger: codepipeline_actions.GitHubTrigger.WEBHOOK,
    });

    // ********** SYNTH PROJECT **********
    const synthProject = new codebuild.PipelineProject(this, 'SynthProject', {
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        privileged: true,
      },
      buildSpec: codebuild.BuildSpec.fromObjectToYaml({
        version: '0.2',
        phases: {
          install: {
            runtimeVersions: {
              nodejs: '20',
            },
            commands: ['npm install -g aws-cdk', 'npm install'],
          },
          pre_build: {
            commands: ['node --version', 'npm --version', 'cdk --version'],
          },
          build: {
            commands: ['pwd', 'ls -al', 'cdk synth -o dist TestAwsCdkAppStack'],
          },
        },
        artifacts: {
          'base-directory': 'dist',
          files: ['**/*'],
        },
      }),
    });

    // ********** SYNTH PROJECT POLICY **********
    synthProject.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          'cloudformation:DescribeStacks',
          'cloudformation:CreateChangeSet',
          'cloudformation:ExecuteChangeSet',
          'cloudformation:DeleteChangeSet',
          'cloudformation:DescribeChangeSet',
          's3:*',
          'sts:AssumeRole',
          'iam:PassRole',
        ],
        resources: ['*'],
      }),
    );

    // ********** FRONTEND BUILD PROJECT **********
    const frontendBuild = new codebuild.PipelineProject(this, 'FrontendBuild', {
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
      },
      buildSpec: codebuild.BuildSpec.fromObjectToYaml({
        version: '0.2',
        phases: {
          install: {
            commands: ['cd frontend/my-react-app', 'npm install'],
          },
          build: {
            commands: ['npm run build'],
          },
        },
        artifacts: {
          'base-directory': 'frontend/my-react-app/build',
          files: ['**/*'],
        },
      }),
    });

    // ********** PIPELINE ACTIONS **********
    const synthAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'CDK_Synth',
      project: synthProject,
      input: sourceOutput,
      outputs: [synthOutput],
    });

    const frontendBuildAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'Frontend_Build',
      project: frontendBuild,
      input: sourceOutput,
      outputs: [frontendOutput],
    });

    const s3DeployAction = new codepipeline_actions.S3DeployAction({
      actionName: 'S3_Deploy',
      bucket: frontendBucket,
      input: frontendOutput,
    });

    // ********** DEPLOY ACTION **********
    const deployAction =
      new codepipeline_actions.CloudFormationCreateUpdateStackAction({
        actionName: 'CFN_Deploy',
        stackName: 'TestAwsCdkAppStack',
        templatePath: synthOutput.atPath('TestAwsCdkAppStack.template.json'),
        adminPermissions: true,
        cfnCapabilities: [cdk.CfnCapabilities.NAMED_IAM],
      });

    // ********** PIPELINE **********
    new codepipeline.Pipeline(this, 'TestAwsCdkAppPipeline', {
      pipelineName: 'TestAwsCdkAppPipeline',
      stages: [
        {
          stageName: 'Source',
          actions: [sourceAction],
        },
        {
          stageName: 'Synth',
          actions: [synthAction],
        },
        {
          stageName: 'Build',
          actions: [frontendBuildAction],
        },
        {
          stageName: 'Deploy',
          actions: [deployAction, s3DeployAction],
        },
      ],
    });
  }
}
