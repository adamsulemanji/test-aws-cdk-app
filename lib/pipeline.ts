import * as cdk from 'aws-cdk-lib';
import * as constructs from 'constructs';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as iam from 'aws-cdk-lib/aws-iam';

export class Pipeline extends cdk.Stack {
  constructor(scope: constructs.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ********** PIPELINE **********
    const sourceOutput = new codepipeline.Artifact();
    const synthOutput = new codepipeline.Artifact();

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
            commands: [
              'npm install -g aws-cdk',
              'npm install',
              'cd frontend/my-react-app',
              'npm install',
            ],
          },
          pre_build: {
            commands: ['node --version', 'npm --version', 'cdk --version'],
          },
          build: {
            commands: [
              'cd ../',
              'cd frontend/my-react-app',
              'npm run build',
              'cd ../../',
              'cdk synth -o dist',
            ],
          },
        },
        artifacts: {
          'base-directory': 'dist', // Ensure dist is set as output dir
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

    // ********** PIPELINE ACTIONS **********
    const synthAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'CDK_Synth',
      project: synthProject,
      input: sourceOutput,
      outputs: [synthOutput],
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
          stageName: 'Deploy',
          actions: [deployAction],
        },
      ],
    });
  }
}
