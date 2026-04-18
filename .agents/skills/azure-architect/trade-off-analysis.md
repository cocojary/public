# Azure Trade-off Analysis & ADR

> Document every architectural decision and Azure service choice with trade-offs.

## Azure Specific Constraints to Evaluate
- **Cost**: Managed PaaS services (e.g., Azure SQL, Web Apps) save time but can cost more per compute-hour than raw VMs.
- **Vendor Lock-in**: Using pure native services (e.g., Cosmos DB with Core NoSQL API, Event Grid, Logic Apps) gives max velocity but tightly couples you to Azure compared to open choices (AKS, Kafka, PostgreSQL).
- **Operational Overhead**: Do we have the team to manage a Kubernetes (AKS) cluster? If not, Azure Container Apps or App Service is significantly better.
- **Latency vs Availability**: Synchronous architecture (API Management -> Azure Functions) gives instant feedback but can fail under load spikes. Asynchronous architecture (API Management -> Service Bus -> Azure Functions) handles spikes flawlessly but introduces queue latency.

## Decision Framework

For EACH major Azure architectural component, document using ADR:

```markdown
## Architecture Decision Record

### Context
- **Problem**: Need a highly available compute layer for our new worker queue processing background tasks.
- **Constraints**: Small DevOps team, high variation in traffic loads (peaks heavily at end-of-month).

### Options Considered

| Option | Pros | Cons | Operational Overhead |
|--------|------|------|----------------------|
| VM Scale Sets | Cheapest compute cost | OS patching, VM image management | High |
| Container Apps | No OS management, auto-scales on events (KEDA) | Higher compute cost per hour | Low |
| Azure Functions | True scale-to-zero, pay per execution | Max execution time limits | Lowest |

### Decision
**Chosen**: Azure Container Apps

### Rationale
1. Our worker tasks routinely take 30-45 minutes to process large files, ruling out standard Azure Functions.
2. The team does not have the bandwidth to patch OS images and manage VM Scale Set scaling metrics. Container Apps abstracts this away and integrates automatically with Azure Service Bus lengths via KEDA.

### Trade-offs Accepted
- **What we give up**: We pay a premium per vCPU/RAM compared to Reserved Virtual Machines. 
- **Why this is acceptable**: The time saved for our small DevOps team outweighs the infrastructure cost delta at our current scale, allowing them to focus on product features instead of patching.
```
