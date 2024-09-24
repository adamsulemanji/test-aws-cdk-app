import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import { Construct } from 'constructs';

export class FrontendConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Create an S3 bucket to host the React app
    const websiteBucket = new s3.Bucket(this, 'ReactFrontendBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
    });

    // Deploy React build files to the S3 bucket
    new s3deploy.BucketDeployment(this, 'DeployReactApp', {
      sources: [
        s3deploy.Source.asset(
          path.join(__dirname, '../frontend/my-react-app/build'),
        ),
      ], // Path to React app build directory
      destinationBucket: websiteBucket,
    });

    // Output the S3 website URL
    new cdk.CfnOutput(this, 'BucketURL', {
      value: websiteBucket.bucketWebsiteUrl,
      description: 'URL for the React frontend',
    });
  }
}
