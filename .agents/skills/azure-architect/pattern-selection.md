# Azure Pattern Selection Guidelines

> Decision trees for choosing Azure architectural patterns and managed services.

## Compute Decision Tree

```text
START: What is your workload type?

┌─ Event-driven, intermittent, or unpredictable traffic?
│  ├─ YES (Short execution time, micro-billing needed)
│  │  → Azure Functions (Serverless Consumption Plan)
│  │  VALIDATE: Are cold starts acceptable for the use case?
│  │     ├─ YES → Pure Azure Functions (Consumption)
│  │     └─ NO  → Azure Functions (Premium Plan) or Azure Container Apps
│  └─ NO (Long-running process, steady traffic, generic web server)
│     → Go down to container/VM choice
│
├─ Requires modern DevOps, Containerization, Microservices?
│  ├─ YES 
│  │  → VALIDATE: Do you want to manage underlying Kubernetes control plane/nodes?
│  │     ├─ YES (Need deep control/service mesh/custom CRDs) → Azure Kubernetes Service (AKS)
│  │     └─ NO (Just want to run containers quickly & scale) → Azure Container Apps
│  └─ NO (Legacy apps, monolithic web app, or strict OS control)
│     → VALIDATE: Is it a standard Web App?
│        ├─ YES → Azure App Service
│        └─ NO (Heavy lift-and-shift, strict OS controls) → Azure Virtual Machines / VM Scale Sets
```

## Database Decision Tree

```text
START: Data structure and access pattern?

┌─ Requires complex JOINs, ACID transactions, structured schema?
│  ├─ YES
│  │  → Relational Database (Azure SQL / Azure Database for PostgreSQL / MySQL)
│  │  VALIDATE: Scale requirements?
│  │     ├─ Enterprise/Global scale or massive growth → Azure SQL DB (Hyperscale or Business Critical)
│  │     └─ Variable/Unpredictable load → Azure SQL DB (Serverless) or Standard tier
│  └─ NO
│     → Go to NoSQL
│
├─ Extreme read/write throughput (millisecond latency), global distribution, flexible schema?
│  ├─ YES
│  │  → Azure Cosmos DB
│  │  VALIDATE: Pick the right API (NoSQL core, MongoDB, PostgreSQL, Gremlin, Cassandra)
│  └─ NO
│     → Azure Table Storage (if simple Key/Value and cost is the primary concern)
```

## Red Flags (Anti-patterns in Azure)

| Pattern | Anti-pattern | Simpler/Better Alternative |
|---------|-------------|-------------------|
| Serverless | Using standard Azure Functions for very long-running workflows | Durable Functions or Azure Batch |
| High Availability | Hosting Database on an Azure VM manually | Azure SQL Database / Flexible Server for Postgres |
| Cost Optimization | Running large Dev/Test VMs 24/7 | Auto-shutdown via Azure DevTest Labs or B-series burstable VMs |
| Networking | Putting Platform Services (SQL, Storage) on public internet | VNet Integration + Azure Private Link / Private Endpoints |
| Security | Hardcoding Connection Strings / Passwords in App Settings | Managed Identities + Azure Key Vault |
