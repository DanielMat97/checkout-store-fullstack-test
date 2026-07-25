function alarmActions() {
  return [{ Ref: 'CheckoutObservabilityAlertsTopic' }];
}

/**
 * CloudWatch dashboards, alarms, SNS, and read-only IAM viewer for checkout-api.
 * Merged into serverless.ts `resources`.
 *
 * @param {{ stage: string }} opts — Serverless `${sls:stage}` token (resolved at deploy).
 */
function observabilityResources({ stage }) {
  const dashboardName = `checkout-api-${stage}-ops`;
  const viewerUserName = `checkout-api-${stage}-cw-viewer`;

  /** HTTP API + Lambda + EMF + SQS widgets (ApiId substituted via Fn::Sub). */
  const dashboardBodyTemplate = JSON.stringify({
    widgets: [
      {
        type: 'text',
        x: 0,
        y: 0,
        width: 24,
        height: 1,
        properties: {
          markdown: `# checkout-api ${stage} — API · Lambda · custom EMF · SQS`,
        },
      },
      {
        type: 'metric',
        x: 0,
        y: 1,
        width: 12,
        height: 6,
        properties: {
          title: 'HTTP API 4xx / 5xx',
          region: '${AWS::Region}',
          view: 'timeSeries',
          stacked: false,
          period: 60,
          stat: 'Sum',
          metrics: [
            [
              'AWS/HttpApi',
              '4xx',
              'ApiId',
              '${ApiId}',
              'Stage',
              '$default',
              { label: '4xx' },
            ],
            ['.', '5xx', '.', '.', '.', '.', { label: '5xx' }],
          ],
        },
      },
      {
        type: 'metric',
        x: 12,
        y: 1,
        width: 12,
        height: 6,
        properties: {
          title: 'HTTP API latency (ms)',
          region: '${AWS::Region}',
          view: 'timeSeries',
          period: 60,
          metrics: [
            [
              'AWS/HttpApi',
              'Latency',
              'ApiId',
              '${ApiId}',
              'Stage',
              '$default',
              { stat: 'Average', label: 'avg' },
            ],
            ['...', { stat: 'p99', label: 'p99' }],
          ],
        },
      },
      {
        type: 'metric',
        x: 0,
        y: 7,
        width: 12,
        height: 6,
        properties: {
          title: 'Custom EMF — RequestCount by StatusClass',
          region: '${AWS::Region}',
          view: 'timeSeries',
          period: 60,
          stat: 'Sum',
          metrics: [
            [
              'Checkout/API',
              'RequestCount',
              'Service',
              'products',
              'Stage',
              '${Stage}',
              'StatusClass',
              '2xx',
            ],
            ['...', '4xx'],
            ['...', '5xx'],
            [
              'Checkout/API',
              'RequestCount',
              'Service',
              'transactions',
              'Stage',
              '${Stage}',
              'StatusClass',
              '2xx',
            ],
            ['...', '4xx'],
            ['...', '5xx'],
          ],
        },
      },
      {
        type: 'metric',
        x: 12,
        y: 7,
        width: 12,
        height: 6,
        properties: {
          title: 'Custom EMF — LatencyMs (avg)',
          region: '${AWS::Region}',
          view: 'timeSeries',
          period: 60,
          stat: 'Average',
          metrics: [
            [
              'Checkout/API',
              'LatencyMs',
              'Service',
              'products',
              'Stage',
              '${Stage}',
              'StatusClass',
              '2xx',
            ],
            [
              'Checkout/API',
              'LatencyMs',
              'Service',
              'transactions',
              'Stage',
              '${Stage}',
              'StatusClass',
              '2xx',
            ],
            [
              'Checkout/API',
              'LatencyMs',
              'Service',
              'customers',
              'Stage',
              '${Stage}',
              'StatusClass',
              '2xx',
            ],
            [
              'Checkout/API',
              'LatencyMs',
              'Service',
              'deliveries',
              'Stage',
              '${Stage}',
              'StatusClass',
              '2xx',
            ],
          ],
        },
      },
      {
        type: 'metric',
        x: 0,
        y: 13,
        width: 12,
        height: 6,
        properties: {
          title: 'Lambda Errors',
          region: '${AWS::Region}',
          view: 'timeSeries',
          period: 60,
          stat: 'Sum',
          metrics: [
            ['AWS/Lambda', 'Errors', 'FunctionName', '${ProductsFn}'],
            ['.', '.', '.', '${CustomersFn}'],
            ['.', '.', '.', '${DeliveriesFn}'],
            ['.', '.', '.', '${TransactionsFn}'],
            ['.', '.', '.', '${OrdersWorkerFn}'],
          ],
        },
      },
      {
        type: 'metric',
        x: 12,
        y: 13,
        width: 12,
        height: 6,
        properties: {
          title: 'Lambda Duration (avg ms)',
          region: '${AWS::Region}',
          view: 'timeSeries',
          period: 60,
          stat: 'Average',
          metrics: [
            ['AWS/Lambda', 'Duration', 'FunctionName', '${ProductsFn}'],
            ['.', '.', '.', '${CustomersFn}'],
            ['.', '.', '.', '${DeliveriesFn}'],
            ['.', '.', '.', '${TransactionsFn}'],
            ['.', '.', '.', '${OrdersWorkerFn}'],
          ],
        },
      },
      {
        type: 'metric',
        x: 0,
        y: 19,
        width: 12,
        height: 6,
        properties: {
          title: 'Lambda Invocations / Throttles',
          region: '${AWS::Region}',
          view: 'timeSeries',
          period: 60,
          stat: 'Sum',
          metrics: [
            ['AWS/Lambda', 'Invocations', 'FunctionName', '${TransactionsFn}'],
            ['.', 'Throttles', '.', '.'],
            ['.', 'Invocations', '.', '${OrdersWorkerFn}'],
            ['.', 'Throttles', '.', '.'],
          ],
        },
      },
      {
        type: 'metric',
        x: 12,
        y: 19,
        width: 12,
        height: 6,
        properties: {
          title: 'SQS orders queue depth',
          region: '${AWS::Region}',
          view: 'timeSeries',
          period: 60,
          stat: 'Average',
          metrics: [
            [
              'AWS/SQS',
              'ApproximateNumberOfMessagesVisible',
              'QueueName',
              '${OrdersQueueName}',
            ],
            ['.', 'ApproximateNumberOfMessagesNotVisible', '.', '.'],
            [
              'AWS/SQS',
              'ApproximateNumberOfMessagesVisible',
              'QueueName',
              '${OrdersDlqName}',
              { label: 'DLQ visible' },
            ],
          ],
        },
      },
      {
        type: 'log',
        x: 0,
        y: 25,
        width: 24,
        height: 6,
        properties: {
          title: 'Recent http.request errors / warns (Insights)',
          region: '${AWS::Region}',
          query: `SOURCE '/aws/lambda/${'${TransactionsFn}'}'\n| filter message = "http.request" and (data.statusClass = "5xx" or data.statusClass = "4xx")\n| fields @timestamp, level, data.route, data.statusCode, data.durationMs, correlationId\n| sort @timestamp desc\n| limit 40`,
          view: 'table',
        },
      },
    ],
  });

  function httpApiAlarm(id, metricName, threshold, description) {
    return {
      Type: 'AWS::CloudWatch::Alarm',
      Properties: {
        AlarmName: `checkout-api-${stage}-httpapi-${metricName.toLowerCase()}`,
        AlarmDescription: description,
        Namespace: 'AWS/HttpApi',
        MetricName: metricName,
        Dimensions: [
          { Name: 'ApiId', Value: { Ref: 'HttpApi' } },
          { Name: 'Stage', Value: '$default' },
        ],
        Statistic: 'Sum',
        Period: 300,
        EvaluationPeriods: 1,
        Threshold: threshold,
        ComparisonOperator: 'GreaterThanOrEqualToThreshold',
        TreatMissingData: 'notBreaching',
        AlarmActions: alarmActions(),
        OKActions: alarmActions(),
      },
    };
  }

  function latencyAlarm() {
    return {
      Type: 'AWS::CloudWatch::Alarm',
      Properties: {
        AlarmName: `checkout-api-${stage}-httpapi-latency-spike`,
        AlarmDescription: 'HTTP API average latency spike (≥3s over 5m, 2 periods)',
        Namespace: 'AWS/HttpApi',
        MetricName: 'Latency',
        Dimensions: [
          { Name: 'ApiId', Value: { Ref: 'HttpApi' } },
          { Name: 'Stage', Value: '$default' },
        ],
        Statistic: 'Average',
        Period: 300,
        EvaluationPeriods: 2,
        DatapointsToAlarm: 2,
        Threshold: 3000,
        ComparisonOperator: 'GreaterThanOrEqualToThreshold',
        TreatMissingData: 'notBreaching',
        AlarmActions: alarmActions(),
        OKActions: alarmActions(),
      },
    };
  }

  function lambdaErrorAlarm(logicalId, functionLogicalId, shortName) {
    return {
      [logicalId]: {
        Type: 'AWS::CloudWatch::Alarm',
        Properties: {
          AlarmName: `checkout-api-${stage}-lambda-${shortName}-errors`,
          AlarmDescription: `Lambda Errors ≥1 in 5m (${shortName})`,
          Namespace: 'AWS/Lambda',
          MetricName: 'Errors',
          Dimensions: [
            {
              Name: 'FunctionName',
              Value: { Ref: functionLogicalId },
            },
          ],
          Statistic: 'Sum',
          Period: 300,
          EvaluationPeriods: 1,
          Threshold: 1,
          ComparisonOperator: 'GreaterThanOrEqualToThreshold',
          TreatMissingData: 'notBreaching',
          AlarmActions: alarmActions(),
          OKActions: alarmActions(),
        },
      },
    };
  }

  const Resources = {
    CheckoutObservabilityAlertsTopic: {
      Type: 'AWS::SNS::Topic',
      Properties: {
        TopicName: `checkout-api-${stage}-ops-alerts`,
        Tags: [
          { Key: 'Service', Value: 'checkout-api' },
          { Key: 'Stage', Value: stage },
        ],
      },
    },
    CheckoutObservabilityAlertEmail: {
      Type: 'AWS::SNS::Subscription',
      Condition: 'HasObservabilityAlertEmail',
      Properties: {
        TopicArn: { Ref: 'CheckoutObservabilityAlertsTopic' },
        Protocol: 'email',
        Endpoint: '${env:OBSERVABILITY_ALERT_EMAIL, ""}',
      },
    },
    CheckoutOpsDashboard: {
      Type: 'AWS::CloudWatch::Dashboard',
      Properties: {
        DashboardName: dashboardName,
        DashboardBody: {
          'Fn::Sub': [
            dashboardBodyTemplate,
            {
              ApiId: { Ref: 'HttpApi' },
              Stage: stage,
              ProductsFn: { Ref: 'ProductsLambdaFunction' },
              CustomersFn: { Ref: 'CustomersLambdaFunction' },
              DeliveriesFn: { Ref: 'DeliveriesLambdaFunction' },
              TransactionsFn: { Ref: 'TransactionsLambdaFunction' },
              OrdersWorkerFn: { Ref: 'OrdersWorkerLambdaFunction' },
              OrdersQueueName: {
                'Fn::GetAtt': ['CheckoutOrdersEventsQueue', 'QueueName'],
              },
              OrdersDlqName: { 'Fn::GetAtt': ['CheckoutOrdersEventsDlq', 'QueueName'] },
            },
          ],
        },
      },
    },
    CheckoutHttpApi5xxAlarm: httpApiAlarm(
      'CheckoutHttpApi5xxAlarm',
      '5xx',
      1,
      'HTTP API 5xx ≥1 in 5 minutes',
    ),
    CheckoutHttpApi4xxAlarm: httpApiAlarm(
      'CheckoutHttpApi4xxAlarm',
      '4xx',
      20,
      'HTTP API 4xx ≥20 in 5 minutes (client error spike)',
    ),
    CheckoutHttpApiLatencyAlarm: latencyAlarm(),
    ...lambdaErrorAlarm(
      'CheckoutProductsLambdaErrorsAlarm',
      'ProductsLambdaFunction',
      'products',
    ),
    ...lambdaErrorAlarm(
      'CheckoutCustomersLambdaErrorsAlarm',
      'CustomersLambdaFunction',
      'customers',
    ),
    ...lambdaErrorAlarm(
      'CheckoutDeliveriesLambdaErrorsAlarm',
      'DeliveriesLambdaFunction',
      'deliveries',
    ),
    ...lambdaErrorAlarm(
      'CheckoutTransactionsLambdaErrorsAlarm',
      'TransactionsLambdaFunction',
      'transactions',
    ),
    ...lambdaErrorAlarm(
      'CheckoutOrdersWorkerLambdaErrorsAlarm',
      'OrdersWorkerLambdaFunction',
      'orders-worker',
    ),
    CheckoutCwViewerUser: {
      Type: 'AWS::IAM::User',
      Properties: {
        UserName: viewerUserName,
        // Do not set Stage/Service here — Serverless stackTags already include STAGE
        // (IAM tag keys are case-insensitive → Duplicate tag keys).
        Tags: [{ Key: 'Purpose', Value: 'cloudwatch-dashboard-readonly' }],
      },
    },
    CheckoutCwViewerPolicy: {
      Type: 'AWS::IAM::Policy',
      Properties: {
        PolicyName: `checkout-api-${stage}-cw-viewer`,
        Users: [{ Ref: 'CheckoutCwViewerUser' }],
        // Keep under IAM inline 2KB limit: one dashboard + metrics render + stage log groups only.
        PolicyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'Dash',
              Effect: 'Allow',
              Action: 'cloudwatch:GetDashboard',
              Resource: {
                'Fn::Sub': [
                  'arn:aws:cloudwatch::${AWS::AccountId}:dashboard/${DashboardName}',
                  { DashboardName: dashboardName },
                ],
              },
            },
            {
              Sid: 'Metrics',
              Effect: 'Allow',
              Action: [
                'cloudwatch:GetMetricData',
                'cloudwatch:GetMetricStatistics',
                'cloudwatch:ListMetrics',
                'cloudwatch:GetMetricWidgetImage',
              ],
              Resource: '*',
            },
            {
              Sid: 'Logs',
              Effect: 'Allow',
              Action: [
                'logs:StartQuery',
                'logs:StopQuery',
                'logs:GetQueryResults',
                'logs:DescribeQueries',
                'logs:FilterLogEvents',
                'logs:GetLogEvents',
                'logs:DescribeLogStreams',
              ],
              Resource: [
                {
                  'Fn::Sub': `arn:aws:logs:\${AWS::Region}:\${AWS::AccountId}:log-group:/aws/lambda/checkout-api-${stage}-*`,
                },
                {
                  'Fn::Sub': `arn:aws:logs:\${AWS::Region}:\${AWS::AccountId}:log-group:/aws/lambda/checkout-api-${stage}-*:*`,
                },
              ],
            },
            {
              Sid: 'OnlyDash',
              Effect: 'Deny',
              Action: 'cloudwatch:GetDashboard',
              NotResource: {
                'Fn::Sub': [
                  'arn:aws:cloudwatch::${AWS::AccountId}:dashboard/${DashboardName}',
                  { DashboardName: dashboardName },
                ],
              },
            },
            {
              Sid: 'NoBrowse',
              Effect: 'Deny',
              Action: [
                'cloudwatch:ListDashboards',
                'cloudwatch:PutDashboard',
                'cloudwatch:DeleteDashboards',
                'cloudwatch:DescribeAlarms',
                'cloudwatch:DescribeAlarmHistory',
                'cloudwatch:PutMetricAlarm',
                'cloudwatch:DeleteAlarms',
                'cloudwatch:PutMetricData',
              ],
              Resource: '*',
            },
            {
              Sid: 'Boundary',
              Effect: 'Deny',
              NotAction: [
                'cloudwatch:GetDashboard',
                'cloudwatch:GetMetricData',
                'cloudwatch:GetMetricStatistics',
                'cloudwatch:ListMetrics',
                'cloudwatch:GetMetricWidgetImage',
                'logs:StartQuery',
                'logs:StopQuery',
                'logs:GetQueryResults',
                'logs:DescribeQueries',
                'logs:FilterLogEvents',
                'logs:GetLogEvents',
                'logs:DescribeLogStreams',
                'iam:ChangePassword',
                'iam:GetAccountPasswordPolicy',
                'sts:GetCallerIdentity',
              ],
              Resource: '*',
            },
          ],
        },
      },
    },
  };

  const Conditions = {
    HasObservabilityAlertEmail: {
      'Fn::Not': [
        {
          'Fn::Equals': ['${env:OBSERVABILITY_ALERT_EMAIL, ""}', ''],
        },
      ],
    },
  };

  const Outputs = {
    ObservabilityDashboardName: {
      Description: 'CloudWatch ops dashboard name',
      Value: dashboardName,
    },
    ObservabilityAlertsTopicArn: {
      Description: 'SNS topic for 4xx/5xx/latency/Lambda error alarms',
      Value: { Ref: 'CheckoutObservabilityAlertsTopic' },
    },
    CloudWatchViewerUserName: {
      Description:
        'IAM user (read-only dashboards/metrics/logs). Create access keys via CLI — never in git.',
      Value: { Ref: 'CheckoutCwViewerUser' },
    },
  };

  return { Conditions, Resources, Outputs };
}

module.exports = { observabilityResources };
