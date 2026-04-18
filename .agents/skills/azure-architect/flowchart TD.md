flowchart TD
    %% Users
    Users(["👥 Users / Readers"])
    
    %% Azure Cloud Boundary
    subgraph Azure ["☁️ Microsoft Azure"]
        
        %% Edge Location (Global Caching & Routing)
        subgraph Edge ["🌍 Edge Locations (Global)"]
            DNS["🧭 Azure DNS"]
            FrontDoor["⚡ Azure Front Door (CDN & WAF)"]
        end
        
        %% Region & VNet
        subgraph Region ["📍 Region (Southeast Asia)"]
            Blob[("🗄️ Azure Blob Storage\n(Static Assets/Images)")]
            EntraID["🔐 Microsoft Entra ID\n(Identity & Auth)"]
            
            subgraph VNet ["🔒 Virtual Network (VNet)"]
                APIM{"🔀 API Management"}
                FuncApp["⚙️ Azure Functions\n(Serverless Logic)"]
                DB[("⚡ Azure Cosmos DB\n(NoSQL Database)")]
            end
        end
    end

    %% User Flow
    Users --> DNS
    DNS --> FrontDoor
    Users -.->|"Login / Auth"| EntraID
    
    %% CDN Routing
    FrontDoor == "Static Content " ==> Blob
    FrontDoor -- "Dynamic API Calls " --> APIM
    
    %% Backend Processing
    APIM --> FuncApp
    FuncApp --> DB
    
    %% Styling
    style Azure fill:#f9f9f9,stroke:#0078D4,stroke-width:2px,color:#000
    style Edge fill:#e6f3ff,stroke:#0066cc,stroke-dasharray: 5 5
    style Region fill:#fff,stroke:#0078D4,stroke-width:1.5px
    style VNet fill:#f0f7f0,stroke:#339933,stroke-dasharray: 5 5
    style Blob fill:#0078D4,color:#fff
    style FuncApp fill:#0078D4,color:#fff
    style DB fill:#5C2D91,color:#fff
