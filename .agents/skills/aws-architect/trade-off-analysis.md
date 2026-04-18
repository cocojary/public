# AWS Trade-off Analysis & ADR

> Document every architectural decision and AWS service choice with trade-offs.

## AWS Specific Constraints to Evaluate
- **Cost**: Managed services save time but cost more upfront (e.g. Fargate vs EC2).
- **Vendor Lock-in**: Using pure native services (e.g., DynamoDB, Step Functions) gives max velocity but traps you in AWS compared to open choices (MongoDB, Airflow).
- **Operational Overhead**: Do we have the team to manage a Kubernetes (EKS) cluster? If not, ECS Fargate is better.
- **Latency vs Availability**: Synchronous architecture (API Gateway -> Lambda) gives instant feedback but can fail. Asynchronous architecture (API Gateway -> SQS -> Lambda) handles spikes faultlessly but introduces queue latency.

## Decision Framework

For EACH major AWS architectural component, document using ADR:

```markdown
## Architecture Decision Record

### Context
- **Problem**: Need a highly available compute layer for our new worker queue.
- **Constraints**: Small DevOps team, high variation in traffic loads.

### Options Considered

| Option | Pros | Cons | Operational Overhead |
|--------|------|------|----------------------|
| EC2 Auto Scaling | Cheapest compute cost | OS patching, AMI management | High |
| ECS Fargate | No OS management, auto-scales | Higher compute cost per hour | Low |
| Lambda | True scale-to-zero, pay per execution | 15 min limit, cold starts | Lowest |

### Decision
**Chosen**: ECS Fargate

### Rationale
1. Our workers occasionally take longer than 15 minutes, ruling out Lambda.
2. The team does not have bandwidth to patch EC2 AMIs and manage instance scaling. Fargate abstracts this away, fitting our team size constraint.

### Trade-offs Accepted
- **What we give up**: We pay a premium per vCPU/RAM compared to Reserved EC2 instances. 
- **Why this is acceptable**: The time saved for the DevOps team outweighs the infrastructure cost delta at our current scale.
```
