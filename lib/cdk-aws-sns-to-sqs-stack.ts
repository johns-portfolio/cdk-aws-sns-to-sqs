import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as sns from 'aws-cdk-lib/aws-sns'
import * as sqs from 'aws-cdk-lib/aws-sqs'
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as path from 'path'
import * as events from 'aws-cdk-lib/aws-events'
import * as targets from 'aws-cdk-lib/aws-events-targets'
import * as iam from 'aws-cdk-lib/aws-iam'
import { Effect } from 'aws-cdk-lib/aws-iam'

export class CdkAwsSnsToSqsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // The code that defines your stack goes here

    const queue1 = new sqs.Queue(this, 'UserLoginQueue1')
    const queue2 = new sqs.Queue(this, 'UserLoginQueue2')
    const topic = new sns.Topic(this, 'UserLoginTopic')
    topic.addSubscription(new subs.SqsSubscription(queue1))
    topic.addSubscription(new subs.SqsSubscription(queue2))

    const fn = new lambda.Function(this, 'UserLoginFunction', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'index.main',
      code: lambda.Code.fromAsset(path.join(__dirname, 'auth')),
      environment: {
        ENV: 'PROD',
        LOGIN_TOPIC_ARN: topic.topicArn
      }
    })
    fn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['sns:*'],
        effect: Effect.ALLOW,
        resources: ['*']
      })
    )

    const eventRule = new events.Rule(this, 'ScheduleUserLoginFunction', {
      schedule: events.Schedule.cron({ minute: '*', hour: '*' })
    })
    eventRule.addTarget(new targets.LambdaFunction(fn))
  }
}
