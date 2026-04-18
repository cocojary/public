# Azure Architecture Examples

> Real-world Azure architecture decisions by project type.

---

## Example 1: MVP Web App (Startup / Solo Developer)

```yaml
Requirements:
  - <1000 users initially
  - Limited operational bandwidth
  - Fast to market (4-8 weeks)
  - Strict budget constraints

Architecture Decisions:
  Compute: Azure App Service (Platform as a Service)
  Database: Azure SQL Database (Serverless tier)
  Storage: Azure Blob Storage (static assets, images)
  CDN/Edge: Azure Front Door
  DNS: Azure DNS

Trade-offs Accepted:
  - Serverless SQL -> Cold starts if not accessed frequently, but saves cost for MVP.
  - App Service -> Less infrastructure control compared to VMs, but extremely fast deployment.

Future Migration Path:
  - Users > 10K -> Upgrade App Service Plan, move SQL DB to Provisioned Compute.
  - Custom container needs -> Migrate to Azure Container Apps or App Service for Containers.
```

---

## Example 2: B2B SaaS Product (Mid-size Team)

```yaml
Requirements:
  - 1K-100K users, sustained traffic
  - High Availability (99.9% Uptime SLA)
  - Multi-tenant data segregation
  - CI/CD automation needed

Architecture Decisions:
  Compute: Azure Container Apps (Serverless Containers using KEDA)
  Database: Azure Database for PostgreSQL (Flexible Server - Zone Redundant)
  Caching: Azure Cache for Redis
  Message Broker: Azure Service Bus (Reliable messaging for async tasks)
  Network: VNet Integration, Private Endpoints for PaaS, Azure Application Gateway (WAF)
  IaC: Terraform or Bicep

Trade-offs Accepted:
  - Container Apps vs AKS -> Abstracted Kubernetes simplifies management, but less extensibility and daemonset control.
  - Private Endpoints Cost -> Adds networking cost, but strictly necessary to prevent public internet data access.

Migration Path:
  - Need extreme orchestration / service mesh -> Migrate from Container Apps to Azure Kubernetes Service (AKS).
  - Global distributed users -> Migrate database to Azure Cosmos DB with PostgreSQL API.
```

---

## Example 3: Enterprise Microservices (High Scale)

```yaml
Requirements:
  - Millions of users
  - 24/7 availability (99.99%)
  - Intense data volume and strict compliance
  - Decoupled teams

Architecture Decisions:
  Compute: Azure Kubernetes Service (AKS)
  API Gateway: Azure API Management (APIM)
  Databases: Polyglot: Cosmos DB (NoSQL, high-speed K/V globally distributed), Azure SQL (Relational)
  Event Streaming: Azure Event Hubs (Managed Kafka endpoint available)
  Security: Microsoft Entra ID (Managed Identities), Azure WAF on Front Door, Microsoft Defender for Cloud
  Observability: Azure Monitor, Application Insights, Log Analytics

Operational Requirements:
  - GitOps using Azure Arc with FluxCD or ArgoCD
  - Multi-Region Active-Active Setup with Azure Front Door
  - Full IaC automation with strict Azure Policy enforcement
  - FinOps Dashboards via Azure Cost Management
```
