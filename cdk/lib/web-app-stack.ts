import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as cdk from 'aws-cdk-lib'
import * as iam from 'aws-cdk-lib/aws-iam'
import { Construct } from 'constructs';
import { config } from '../config/config'

export class WebAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = cdk.aws_ec2.Vpc.fromLookup(this, 'tfn-vpc', {isDefault: false})

    const ecr = cdk.aws_ecr.Repository.fromRepositoryArn(this, 'ecr', config.EcrArn)

    const ecr_permissions = new iam.PolicyStatement({
      actions: [
        'ecr:BatchCheckLayerAvailability', 
        'ecr:GetDownloadUrlForLayer', 
        'ecr:BatchGetImage'
      ],
      resources: [
        '*'
      ],
});
    const cluster = ecs.Cluster.fromClusterAttributes(this, 'ecs-app-cluster', {
      clusterArn : config.EcsArn,
      clusterName : 'ecs-app-cluster',
      vpc : vpc
    })
    
    const task_policy = new iam.PolicyStatement({
      actions: [
        'ecr:BatchCheckLayerAvailability',
        'ecr:GetDownloadUrlForLayer',
        'ecr:BatchGetImage',
      ],
      resources: ['*'],
    });


    // Create a load-balanced Fargate service and make it public
    const fargate_service = new ecs_patterns.ApplicationLoadBalancedFargateService(this, "MyFargateService", {
      cluster: cluster, // Required
      cpu: 256, // Default is 256
      desiredCount: 1, // Default is 1
      taskImageOptions: { image: ecs.ContainerImage.fromEcrRepository(ecr, 'latest') },
      memoryLimitMiB: 512, // Default is 512
      publicLoadBalancer: true // Default is true
    });

    fargate_service.taskDefinition.addToExecutionRolePolicy(task_policy);




    
  }

  

}
