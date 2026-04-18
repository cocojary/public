# AWS Pattern Selection Guidelines

> Decision trees for choosing AWS architectural patterns and managed services.

## Compute Decision Tree

```text
START: What is your workload type?

┌─ Event-driven, intermittent, or unpredictable traffic?
│  ├─ YES (Short execution time < 15 mins)
│  │  → AWS Lambda (Serverless)
│  │  VALIDATE: Are cold starts acceptable for the use case?
│  │     ├─ YES → Pure Lambda
│  │     └─ NO  → Lambda with Provisioned Concurrency or Fargate
│  └─ NO (Long-running process, steady traffic, generic web server)
│     → Go down to container/VM choice
│
├─ Requires modern DevOps, Containerization, Microservices?
│  ├─ YES 
│  │  → VALIDATE: Do you want to manage underlying instances/Kubernetes?
│  │     ├─ YES (Need deep control/service mesh) → Amazon EKS (Kubernetes)
│  │     └─ NO (Just want to run containers) → Amazon ECS with Fargate
│  └─ NO (Legacy apps, strict OS control, heavy lift-and-shift)
│     → Amazon EC2
│     Simpler = Elastic Beanstalk (if just a monolith app)
```

## Database Decision Tree

```text
START: Data structure and access pattern?

┌─ Requires complex JOINs, ACID transactions, structured schema?
│  ├─ YES
│  │  → Relational Database (Amazon RDS / Aurora)
│  │  VALIDATE: Scale requirements?
│  │     ├─ Enterprise/Global scale → Amazon Aurora Multi-AZ / Global
│  │     └─ Standard predictable load → Amazon RDS (PostgreSQL/MySQL)
│  └─ NO
│     → Go to NoSQL
│
├─ Extreme read/write throughput (millisecond latency), flexible schema?
│  ├─ YES
│  │  → Amazon DynamoDB
│  │  VALIDATE: Access patterns must be well-understood upfront! (Single Table Design)
│  └─ NO
│     → DocumentDB (MongoDB compatible) if complex querying on NoSQL is needed
```

## Red Flags (Anti-patterns in AWS)

| Pattern | Anti-pattern | Simpler/Better Alternative |
|---------|-------------|-------------------|
| Serverless | Using Lambda for long-running batch jobs | AWS Batch or ECS Fargate tasks |
| High Availability | Hosting DB on EC2 manually | Amazon RDS / Aurora |
| Cost Optimization | Running EC2 instances 24/7 at 5% CPU | Auto Scaling Groups or Lambda |
| Networking | Putting DBs in Public Subnets | Private Subnet + VPN/SSM for access |
| Security | Long-lived Access Keys everywhere | IAM Roles (AssumeRole) |
