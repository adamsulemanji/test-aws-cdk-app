import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

// CodePipeline
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';

// CodeBuild
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as iam from 'aws-cdk-lib/aws-iam';

// We’ll import the bucket from your FrontendConstruct via props
import { FrontendConstruct } from './cloudfront';

export interface PipelineStackProps extends cdk.StackProps {
  // Pass the S3 bucket and distribution from the FrontendConstruct
  frontendConstruct: FrontendConstruct;
}

export class Pipeline extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    // ********** ARTIFACTS **********
    const sourceOutput = new codepipeline.Artifact('SourceOutput');
    const synthOutput = new codepipeline.Artifact('SynthOutput');
    // We'll store the compiled React build here:
    const frontendBuildOutput = new codepipeline.Artifact(
      'FrontendBuildOutput',
    );

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

    // ********** SYNTH PROJECT (for CDK infra) **********
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
              // We can remove the React build from here, since we’ll do it separately
            ],
          },
          pre_build: {
            commands: ['node --version', 'npm --version', 'cdk --version'],
          },
          build: {
            commands: [
              // Synthesize infrastructure templates
              'cdk synth -o dist',
            ],
          },
        },
        artifacts: {
          'base-directory': 'dist',
          files: ['**/*'],
        },
      }),
    });

    // IAM permissions so CodeBuild can do CloudFormation stuff
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

    // ********** SYNTH ACTION **********
    const synthAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'CDK_Synth',
      project: synthProject,
      input: sourceOutput,
      outputs: [synthOutput],
    });

    // ********** FRONTEND BUILD PROJECT **********
    const frontendBuildProject = new codebuild.PipelineProject(
      this,
      'FrontendBuildProject',
      {
        environment: {
          buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        },
        buildSpec: codebuild.BuildSpec.fromObjectToYaml({
          version: '0.2',
          phases: {
            install: {
              commands: ['cd frontend/my-react-app', 'npm ci'],
            },
            build: {
              commands: [
                'npm run build', // produces build/ folder
              ],
            },
          },
          artifacts: {
            'base-directory': 'frontend/my-react-app/build',
            files: ['**/*'], // everything in the React build output
          },
        }),
      },
    );

    // ********** FRONTEND BUILD ACTION **********
    const buildFrontendAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'Build_Frontend',
      project: frontendBuildProject,
      input: sourceOutput,
      outputs: [frontendBuildOutput],
    });

    // ********** DEPLOY INFRA ACTION (CloudFormation) **********
    const deployInfraAction =
      new codepipeline_actions.CloudFormationCreateUpdateStackAction({
        actionName: 'CFN_Deploy',
        stackName: 'TestAwsCdkAppStack',
        templatePath: synthOutput.atPath('TestAwsCdkAppStack.template.json'),
        adminPermissions: true,
        cfnCapabilities: [cdk.CfnCapabilities.NAMED_IAM],
      });

    // ********** DEPLOY FRONTEND ACTION (S3) **********
    // This uploads the React build artifacts to the S3 bucket from FrontendConstruct
    const deployFrontendAction = new codepipeline_actions.S3DeployAction({
      actionName: 'Deploy_Frontend_To_S3',
      bucket: props.frontendConstruct.myBucket,
      input: frontendBuildOutput,
    });

    // ********** PIPELINE DEFINITION **********
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
          stageName: 'BuildFrontend',
          actions: [buildFrontendAction],
        },
        {
          stageName: 'DeployInfra',
          actions: [deployInfraAction],
        },
        {
          stageName: 'DeployFrontend',
          actions: [deployFrontendAction],
        },
      ],
    });
  }
}
