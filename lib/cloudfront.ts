import { CfnOutput, Duration, RemovalPolicy, Size } from 'aws-cdk-lib';
import {
  AllowedMethods,
  Distribution,
  OriginAccessIdentity,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { CanonicalUserPrincipal, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';

export class FrontendConstruct extends Construct {
  constructor(app: Construct, id: string) {
    super(app, id);

    // ********** Frontend Bucket **********
    const myBucket = new Bucket(this, 'myBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const cloudfrontOAI = new OriginAccessIdentity(this, 'cloudfront-OAI');

    // ********** Bucket Policy **********
    myBucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [myBucket.arnForObjects('*')],
        principals: [
          new CanonicalUserPrincipal(
            cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId,
          ),
        ],
      }),
    );

    // ********** Route 53 **********
    const zone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: 'adamsulemanji.com',
    });

    // ********** ACM Certificate **********
    const certificate = new acm.Certificate(this, 'Certificate', {
      domainName: 'test.adamsulemanji.com',
      validation: acm.CertificateValidation.fromDns(zone),
    });

    // ********** CloudFront Distribution **********
    const s3Origin = new S3Origin(myBucket);

    const distribution = new Distribution(this, 'myDist', {
      defaultBehavior: {
        origin: s3Origin,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: AllowedMethods.ALLOW_ALL,
      },
      defaultRootObject: 'index.html',
      domainNames: ['test.adamsulemanji.com'], // Specify the subdomain
      certificate, // Attach the ACM certificate
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200, // Serve index.html
          responsePagePath: '/index.html',
          ttl: Duration.minutes(1),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200, // Serve index.html
          responsePagePath: '/index.html',
          ttl: Duration.minutes(1),
        },
      ],
    });

    // ********** Route 53 Alias Record **********
    new route53.ARecord(this, 'AliasRecord', {
      zone,
      recordName: 'test',
      target: route53.RecordTarget.fromAlias(
        new route53targets.CloudFrontTarget(distribution),
      ),
    });

    // ********** Bucket Deployment **********
    new BucketDeployment(this, 'DeployWithInvalidation', {
      sources: [Source.asset('./frontend/my-react-app/build')],
      destinationBucket: myBucket,
      distribution,
      memoryLimit: 1024,
      ephemeralStorageSize: Size.mebibytes(1024),
      distributionPaths: ['/*'],
    });

    // ********** Output **********
    new CfnOutput(this, 'DistributionDomainName', {
      value: distribution.domainName,
      description: 'Distribution Domain Name',
      exportName: 'DistributionDomainName',
    });
  }
}
