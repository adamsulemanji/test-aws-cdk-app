import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class RDSConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const vpc = new ec2.Vpc(this, 'my-cdk-vpc', {
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      natGateways: 0,
      maxAzs: 3,
      subnetConfiguration: [
        {
          name: 'public-subnet-1',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'isolated-subnet-1',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 28,
        },
      ],
    });

    // 👇 create a security group for the EC2 instance
    const ec2InstanceSG = new ec2.SecurityGroup(this, 'ec2-instance-sg', {
      vpc,
    });

    ec2InstanceSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'allow SSH connections from anywhere',
    );

    const ec2Instance = new ec2.Instance(this, 'ec2-instance', {
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      securityGroup: ec2InstanceSG,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE2,
        ec2.InstanceSize.MICRO,
      ),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
    });

    const dbInstance = new rds.DatabaseInstance(this, 'db-instance', {
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_14,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE3,
        ec2.InstanceSize.MICRO,
      ),
      credentials: rds.Credentials.fromGeneratedSecret('postgres'),
      multiAz: false,
      allocatedStorage: 100,
      maxAllocatedStorage: 120,
      allowMajorVersionUpgrade: false,
      autoMinorVersionUpgrade: true,
      backupRetention: cdk.Duration.days(0),
      deleteAutomatedBackups: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      deletionProtection: false,
      databaseName: 'todosdb',
      publiclyAccessible: false,
    });

    dbInstance.connections.allowFrom(ec2Instance, ec2.Port.tcp(5432));

    new cdk.CfnOutput(this, 'dbEndpoint', {
      value: dbInstance.instanceEndpoint.hostname,
    });

    new cdk.CfnOutput(this, 'secretName', {
      value: dbInstance.secret?.secretName!,
    });
  }
}
