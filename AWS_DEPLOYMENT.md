# AWS Deployment Guide - OnaZaidi

This guide provides step-by-step instructions for deploying the OnaZaidi platform to AWS. Choose the deployment approach that best fits your needs:

- **Option 1**: EC2 + Manual Deployment (Simpler, suitable for small to medium scale)
- **Option 2**: ECS + Fargate (Scalable, production-ready, recommended for growth)

## Prerequisites

Before starting, ensure you have:
- AWS Account with appropriate permissions
- AWS CLI installed and configured: `aws configure`
- Domain name registered (e.g., via Route 53 or external registrar)
- Payment API keys (Pesapal, PayPal) ready
- Email service configured (SES, Resend, or similar)
- SSL certificate (can use AWS Certificate Manager)

## AWS Services Overview

| Service | Purpose | Cost Consideration |
|---------|---------|-------------------|
| EC2 | Application hosting | ~$20-100/month depending on instance |
| RDS PostgreSQL | Managed database | ~$15-200/month based on instance |
| S3 | Photo storage | ~$0.023/GB storage + transfer |
| CloudFront | CDN & SSL termination | Pay-as-you-go |
| Route 53 | DNS | ~$0.50/month per hosted zone |
| Certificate Manager | Free SSL certificates | Free |
| IAM | Security & access control | Free |
| ECS/Fargate | Container orchestration | Pay per vCPU/memory |

---

## Option 1: EC2 Deployment (Simpler Approach)

### Step 1: Create VPC and Networking

```bash
# Create VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=onazaidi-vpc}]'

# Note the VpcId from output, then:
export VPC_ID="vpc-xxxxxxxxxxxxxxxxx"

# Create subnets (at least 2 for different AZs)
aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.1.0/24 --availability-zone us-east-1a --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=onazaidi-public-1a}]'
aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.2.0/24 --availability-zone us-east-1b --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=onazaidi-public-1b}]'

# Create Internet Gateway
aws ec2 create-internet-gateway --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=onazaidi-igw}]'
export IGW_ID="igw-xxxxxxxxxxxxxxxxx"

# Attach IGW to VPC
aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID

# Create Route Table
aws ec2 create-route-table --vpc-id $VPC_ID --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=onazaidi-rt}]'
export RT_ID="rtb-xxxxxxxxxxxxxxxxx"

# Add route to IGW
aws ec2 create-route --route-table-id $RT_ID --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW_ID

# Associate subnets with route table
aws ec2 associate-route-table --route-table-id $RT_ID --subnet-id subnet-xxxxxxxxxxxxxxxxx
aws ec2 associate-route-table --route-table-id $RT_ID --subnet-id subnet-xxxxxxxxxxxxxxxxx
```

### Step 2: Create Security Groups

```bash
# Security Group for EC2
aws ec2 create-security-group --group-name onazaidi-ec2-sg --description "Security group for OnaZaidi EC2" --vpc-id $VPC_ID
export SG_ID="sg-xxxxxxxxxxxxxxxxx"

# Allow SSH (restrict to your IP)
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 22 --cidr YOUR_IP/32

# Allow HTTP
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 80 --cidr 0.0.0.0/0

# Allow HTTPS
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 443 --cidr 0.0.0.0/0

# Allow application port (8080 for backend, 5173 for frontend dev)
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 8080 --cidr 0.0.0.0/0
```

### Step 3: Create RDS PostgreSQL Instance

```bash
# Create subnet group for RDS
aws rds create-db-subnet-group \
  --db-subnet-group-name onazaidi-db-subnet-group \
  --db-subnet-group-description "Subnet group for OnaZaidi RDS" \
  --subnet-ids subnet-xxxxxxxxxxxxxxxxx subnet-xxxxxxxxxxxxxxxxx

# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier onazaidi-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 16.4 \
  --master-username onazaidi \
  --master-user-password CHANGE_THIS_PASSWORD \
  --allocated-storage 20 \
  --storage-type gp2 \
  --db-subnet-group-name onazaidi-db-subnet-group \
  --vpc-security-group-ids $SG_ID \
  --backup-retention-period 7 \
  --multi-az false \
  --publicly-accessible false \
  --no-deletion-protection

# Wait for instance to be available
aws rds wait db-instance-available --db-instance-identifier onazaidi-db

# Get endpoint
aws rds describe-db-instances --db-instance-identifier onazaidi-db --query 'DBInstances[0].Endpoint.Address'
```

### Step 4: Create S3 Bucket for Photos

```bash
# Create bucket (bucket name must be globally unique)
aws s3 mb s3://onazaidi-media-$(date +%s) --region us-east-1

# Note the bucket name and export
export S3_BUCKET="onazaidi-media-xxxxxxxx"

# Enable versioning
aws s3api put-bucket-versioning --bucket $S3_BUCKET --versioning-configuration Status=Enabled

# Block public access (recommended)
aws s3api put-public-access-block \
  --bucket $S3_BUCKET \
  --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Create bucket policy for CloudFront access (if using CDN)
# You'll need to add this after setting up CloudFront
```

### Step 5: Create EC2 Instance

```bash
# Create key pair
aws ec2 create-key-pair --key-name onazaidi-key --query 'KeyMaterial' --output text > onazaidi-key.pem
chmod 400 onazaidi-key.pem

# Get latest AMI ID for Amazon Linux 2023
export AMI_ID=$(aws ec2 describe-images \
  --owners amazon \
  --filters "Name=name,Values=al2023-ami-2023.*-x86_64" "Name=state,Values=available" \
  --query 'sort_by(Images, &CreationDate)[-1].ImageId' \
  --output text)

# Create EC2 instance
aws ec2 run-instances \
  --image-id $AMI_ID \
  --count 1 \
  --instance-type t3.medium \
  --key-name onazaidi-key \
  --security-group-ids $SG_ID \
  --subnet-id subnet-xxxxxxxxxxxxxxxxx \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=onazaidi-app}]' \
  --user-data file://deploy/scripts/ec2-user-data.sh

# Wait for instance to be running
aws ec2 wait instance-running --instance-ids i-xxxxxxxxxxxxxxxxx

# Get public IP
aws ec2 describe-instances --instance-ids i-xxxxxxxxxxxxxxxxx --query 'Reservations[0].Instances[0].PublicIpAddress'
```

Create the user data script `deploy/scripts/ec2-user-data.sh`:

```bash
#!/bin/bash
# Update system
yum update -y

# Install Docker
yum install -y docker
systemctl start docker
systemctl enable docker

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Java 21
yum install -y java-21-amazon-corretto

# Install Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs

# Create app directory
mkdir -p /home/ec2-user/onazaidi
cd /home/ec2-user/onazaidi

# Clone repository (or use other deployment method)
# git clone <repo-url> .

# Set environment variables (these should be passed securely)
# cat > .env << EOF
# POSTGRES_DB=onazaidi
# POSTGRES_USER=onazaidi
# POSTGRES_PASSWORD=<from-secure-source>
# JWT_SECRET=<from-secure-source>
# ... other env vars
# EOF

# Start services
# docker-compose -f docker-compose.prod.yml up -d
```

### Step 6: Configure DNS with Route 53

```bash
# Create hosted zone (if using Route 53)
aws route53 create-hosted-zone \
  --name onazaidi.com \
  --caller-reference $(date +%s)

# Get nameservers and update your domain registrar

# Create A record pointing to EC2 public IP
aws route53 change-resource-record-sets \
  --hosted-zone-id ZXXXXXXXXXXXXX \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "onazaidi.com",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [{"Value": "EC2_PUBLIC_IP"}]
      }
    }]
  }'
```

### Step 7: Set Up SSL with Certificate Manager

```bash
# Request certificate
aws acm request-certificate \
  --domain-name onazaidi.com \
  --subject-alternative-names www.onazaidi.com \
  --validation-method DNS

# Follow the instructions to validate via DNS

# Wait for certificate to be issued
aws acm wait certificate-validated --certificate-arn arn:aws:acm:region:account:certificate/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Step 8: Deploy Application

SSH into the EC2 instance:

```bash
ssh -i onazaidi-key.pem ec2-user@EC2_PUBLIC_IP
```

On the instance:

```bash
# Clone repository
cd /home/ec2-user
git clone <your-repo-url> onazaidi
cd onazaidi

# Set up environment variables
cp .env.example .env
nano .env  # Edit with your production values

# Build and deploy backend
cd backend
./mvnw clean package -DskipTests
docker build -t onazaidi-backend:latest .

# Build and deploy frontend
cd ../onazaidi-frontend
npm install
npm run build
docker build -t onazaidi-frontend:latest .

# Start services with docker-compose
cd ..
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose logs -f
```

### Step 9: Set Up CloudFront (Optional but Recommended)

```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --distribution-config '{
    "CallerReference": "onazaidi-$(date +%s)",
    "Origins": {
      "Items": [{
        "Id": "ec2-origin",
        "DomainName": "onazaidi.com",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "https-only",
          "OriginSslProtocols": {"Items": ["TLSv1.2"]}
        }
      }],
      "Quantity": 1
    },
    "DefaultCacheBehavior": {
      "TargetOriginId": "ec2-origin",
      "ViewerProtocolPolicy": "redirect-to-https",
      "AllowedMethods": {
        "Quantity": 7,
        "Items": ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
      },
      "ForwardedValues": {
        "QueryString": true,
        "Cookies": {"Forward": "all"}
      }
    },
    "ViewerCertificate": {
      "ACMCertificateArn": "arn:aws:acm:region:account:certificate/xxxxxxxx",
      "SSLSupportMethod": "sni-only"
    },
    "Aliases": {"Quantity": 2, "Items": ["onazaidi.com", "www.onazaidi.com"]},
    "Enabled": true
  }'

# Update Route 53 to point to CloudFront distribution
```

---

## Option 2: ECS + Fargate Deployment (Production-Ready)

### Step 1: Create ECR Repositories

```bash
# Create repository for backend
aws ecr create-repository --repository-name onazaidi-backend

# Create repository for frontend
aws ecr create-repository --repository-name onazaidi-frontend

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
```

### Step 2: Build and Push Docker Images

```bash
# Backend
cd backend
docker build -t onazaidi-backend:latest .
docker tag onazaidi-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/onazaidi-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/onazaidi-backend:latest

# Frontend
cd onazaidi-frontend
docker build -t onazaidi-frontend:latest .
docker tag onazaidi-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/onazaidi-frontend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/onazaidi-frontend:latest
```

### Step 3: Create ECS Task Definitions

Create `deploy/ecs/backend-task-definition.json`:

```json
{
  "family": "onazaidi-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/onazaidi-backend:latest",
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "SPRING_PROFILES_ACTIVE",
          "value": "prod"
        }
      ],
      "secrets": [
        {
          "name": "POSTGRES_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:onazaidi/postgres-password"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:onazaidi/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/onazaidi-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

Create `deploy/ecs/frontend-task-definition.json`:

```json
{
  "family": "onazaidi-frontend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "frontend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/onazaidi-frontend:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/onazaidi-frontend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

Register task definitions:

```bash
aws ecs register-task-definition --cli-input-json file://deploy/ecs/backend-task-definition.json
aws ecs register-task-definition --cli-input-json file://deploy/ecs/frontend-task-definition.json
```

### Step 4: Create ECS Cluster

```bash
aws ecs create-cluster --cluster-name onazaidi-cluster
```

### Step 5: Create Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name onazaidi-alb \
  --subnets subnet-xxxxxxxxxxxxxxxxx subnet-xxxxxxxxxxxxxxxxx \
  --security-groups $SG_ID

# Note the ARN and DNS name
export ALB_ARN="arn:aws:elasticloadbalancing:us-east-1:<account-id>:loadbalancer/app/onazaidi-alb/xxxxxxxx"
export ALB_DNS="onazaidi-alb-xxxxxxxx.us-east-1.elb.amazonaws.com"

# Create target groups
aws elbv2 create-target-group \
  --name onazaidi-backend-tg \
  --protocol HTTP \
  --port 8080 \
  --vpc-id $VPC_ID \
  --target-type ip

aws elbv2 create-target-group \
  --name onazaidi-frontend-tg \
  --protocol HTTP \
  --port 80 \
  --vpc-id $VPC_ID \
  --target-type ip

# Note the target group ARNs
export BACKEND_TG_ARN="arn:aws:elasticloadbalancing:us-east-1:<account-id>:targetgroup/onazaidi-backend-tg/xxxxxxxx"
export FRONTEND_TG_ARN="arn:aws:elasticloadbalancing:us-east-1:<account-id>:targetgroup/onazaidi-frontend-tg/xxxxxxxx"

# Create listeners
aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTP \
  --port 80 \
  --default-actions '[{"Type":"redirect","RedirectConfig":{"Protocol":"HTTPS","Port":"443","StatusCode":"HTTP_301"}}]'

aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTPS \
  --port 443 \
  --certificates '[{"CertificateArn":"arn:aws:acm:us-east-1:<account-id>:certificate/xxxxxxxx"}]' \
  --default-actions '[{"Type":"forward","TargetGroupArn":"'$FRONTEND_TG_ARN'"}]'
```

### Step 6: Create ECS Services

```bash
# Backend service
aws ecs create-service \
  --cluster onazaidi-cluster \
  --service-name onazaidi-backend \
  --task-definition onazaidi-backend \
  --desired-count 2 \
  --launch-type FARGATE \
  --platform-version LATEST \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxxxxxxxxxxxxxx,subnet-xxxxxxxxxxxxxxxxx],securityGroups=[$SG_ID],assignPublicIp=ENABLED}" \
  --load-balancers targetGroupArn=$BACKEND_TG_ARN,containerName=backend,containerPort=8080

# Frontend service
aws ecs create-service \
  --cluster onazaidi-cluster \
  --service-name onazaidi-frontend \
  --task-definition onazaidi-frontend \
  --desired-count 2 \
  --launch-type FARGATE \
  --platform-version LATEST \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxxxxxxxxxxxxxx,subnet-xxxxxxxxxxxxxxxxx],securityGroups=[$SG_ID],assignPublicIp=ENABLED}" \
  --load-balancers targetGroupArn=$FRONTEND_TG_ARN,containerName=frontend,containerPort=80
```

### Step 7: Set Up Auto Scaling

```bash
# Register scalable target for backend
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/onazaidi-cluster/onazaidi-backend \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

# Create scaling policy
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/onazaidi-cluster/onazaidi-backend \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name onazaidi-backend-scale-policy \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 70.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
    }
  }'
```

---

## Security Best Practices

### 1. Use AWS Secrets Manager

Store sensitive data securely:

```bash
# Store secrets
aws secretsmanager create-secret \
  --name onazaidi/postgres-password \
  --secret-string "your-secure-password"

aws secretsmanager create-secret \
  --name onazaidi/jwt-secret \
  --secret-string "your-64-char-secret"

aws secretsmanager create-secret \
  --name onazaidi/pesapal-credentials \
  --secret-string '{"key":"your-key","secret":"your-secret"}'

aws secretsmanager create-secret \
  --name onazaidi/paypal-credentials \
  --secret-string '{"client_id":"your-id","client_secret":"your-secret"}'
```

### 2. IAM Roles

Create IAM roles for ECS tasks:

```bash
# Create trust policy
cat > ecs-trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create role
aws iam create-role \
  --role-name onazaidi-ecs-task-role \
  --assume-role-policy-document file://ecs-trust-policy.json

# Attach policies
aws iam attach-role-policy \
  --role-name onazaidi-ecs-task-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly

aws iam attach-role-policy \
  --role-name onazaidi-ecs-task-role \
  --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess

# Custom policy for S3 access
cat > s3-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::onazaidi-media-*/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::onazaidi-media-*"
    }
  ]
}
EOF

aws iam put-role-policy \
  --role-name onazaidi-ecs-task-role \
  --policy-name onazaidi-s3-access \
  --policy-document file://s3-policy.json

# Custom policy for Secrets Manager access
cat > secrets-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:onazaidi/*"
    }
  ]
}
EOF

aws iam put-role-policy \
  --role-name onazaidi-ecs-task-role \
  --policy-name onazaidi-secrets-access \
  --policy-document file://secrets-policy.json
```

### 3. Enable VPC Flow Logs

```bash
aws ec2 create-flow-logs \
  --resource-type VPC \
  --resource-id $VPC_ID \
  --destination-type cloud-watch-logs \
  --log-group-name /aws/vpc/flow-logs/onazaidi \
  --traffic-type ALL
```

### 4. Enable GuardDuty

```bash
aws guardduty create-detector --enable
```

---

## Monitoring and Logging

### CloudWatch Dashboard

```bash
# Create log groups
aws logs create-log-group --log-group-name /ecs/onazaidi-backend
aws logs create-log-group --log-group-name /ecs/onazaidi-frontend

# Set retention
aws logs put-retention-policy --log-group-name /ecs/onazaidi-backend --retention-in-days 30
aws logs put-retention-policy --log-group-name /ecs/onazaidi-frontend --retention-in-days 30
```

### Application Metrics

Enable Spring Boot Actuator endpoints in `application-prod.yml`:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,metrics,info
  metrics:
    export:
      cloudwatch:
        enabled: true
        namespace: OnaZaidi
```

---

## Backup and Disaster Recovery

### RDS Automated Backups

RDS automatically creates backups. Configure retention:

```bash
aws rds modify-db-instance \
  --db-instance-identifier onazaidi-db \
  --backup-retention-period 30 \
  --apply-immediately
```

### S3 Versioning

Already enabled in Step 4 of Option 1.

### Cross-Region Replication (Optional)

```bash
aws s3api put-bucket-replication \
  --bucket $S3_BUCKET \
  --replication-configuration '{
    "Role": "arn:aws:iam::<account-id>:role/s3-replication-role",
    "Rules": [{
      "Status": "Enabled",
      "Prefix": "",
      "Destination": {
        "Bucket": "arn:aws:s3:::onazaidi-media-backup",
        "StorageClass": "STANDARD_IA"
      }
    }]
  }'
```

---

## Cost Optimization

### 1. Use Reserved Instances or Savings Plans

For predictable workloads, consider:
- RDS Reserved Instances (saves up to 40%)
- EC2 Reserved Instances or Compute Savings Plans

### 2. Enable S3 Lifecycle Policies

```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket $S3_BUCKET \
  --lifecycle-configuration '{
    "Rules": [{
      "ID": "MoveToStandardIA",
      "Status": "Enabled",
      "Transitions": [{
        "Days": 30,
        "StorageClass": "STANDARD_IA"
      }]
    }]
  }'
```

### 3. Use CloudFront for Static Assets

Reduces S3 transfer costs and improves performance.

### 4. Set Up Budgets

```bash
aws budgets create-budget \
  --account-id <account-id> \
  --budget '{
    "BudgetName": "OnaZaidi-Monthly",
    "BudgetLimit": {"Amount": "100", "Unit": "USD"},
    "TimeUnit": "MONTHLY",
    "BudgetType": "COST"
  }'
```

---

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build and push backend
        run: |
          cd backend
          docker build -t onazaidi-backend .
          docker tag onazaidi-backend ${{ steps.login-ecr.outputs.registry }}/onazaidi-backend:latest
          docker push ${{ steps.login-ecr.outputs.registry }}/onazaidi-backend:latest

      - name: Build and push frontend
        run: |
          cd onazaidi-frontend
          docker build -t onazaidi-frontend .
          docker tag onazaidi-frontend ${{ steps.login-ecr.outputs.registry }}/onazaidi-frontend:latest
          docker push ${{ steps.login-ecr.outputs.registry }}/onazaidi-frontend:latest

      - name: Update ECS service
        run: |
          aws ecs update-service --cluster onazaidi-cluster --service onazaidi-backend --force-new-deployment
          aws ecs update-service --cluster onazaidi-cluster --service onazaidi-frontend --force-new-deployment
```

---

## Post-Deployment Checklist

- [ ] Verify database connection
- [ ] Test S3 file uploads
- [ ] Configure email service and test email verification
- [ ] Set up payment gateways with real API keys
- [ ] Test payment flow (use sandbox mode first)
- [ ] Enable SSL/TLS certificate
- [ ] Configure CloudFront CDN
- [ ] Set up monitoring and alerts
- [ ] Configure backups
- [ ] Test disaster recovery procedures
- [ ] Review security group rules
- [ ] Enable AWS Config compliance rules
- [ ] Set up budget alerts
- [ ] Document runbooks for common issues

---

## Troubleshooting

### EC2 Instance Issues

```bash
# Check instance status
aws ec2 describe-instance-status --instance-ids i-xxxxxxxxxxxxxxxxx

# Get console output
aws ec2 get-console-output --instance-ids i-xxxxxxxxxxxxxxxxx

# SSH into instance
ssh -i onazaidi-key.pem ec2-user@PUBLIC_IP
```

### ECS Service Issues

```bash
# Check service events
aws ecs describe-services --cluster onazaidi-cluster --services onazaidi-backend

# Check task logs
aws logs tail /ecs/onazaidi-backend --follow

# Describe task
aws ecs describe-tasks --cluster onazaidi-cluster --tasks task-xxxxxxxxxxxxxxxxx
```

### RDS Connection Issues

```bash
# Check DB instance status
aws rds describe-db-instances --db-instance-identifier onazaidi-db

# View events
aws rds describe-events --source-type db-instance --source-identifier onazaidi-db
```

---

## Support and Resources

- AWS Documentation: https://docs.aws.amazon.com/
- ECS Best Practices: https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/
- RDS Best Practices: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.html
- AWS Calculator: https://calculator.aws/

---

## Notes

- Replace all placeholder values (like `<account-id>`, `xxxxxxxx`, etc.) with your actual values
- Adjust instance types and resource allocations based on your expected traffic
- Always test in a development environment before deploying to production
- Keep your AWS credentials secure and never commit them to version control
- Regularly review and update security configurations
