flowchart TD
    %% Người dùng
    Users(["👥 Users / Readers"])
    
    %% AWS Cloud Boundary
    subgraph AWS ["☁️ AWS Cloud"]
        
        %% Edge Location (Bộ đệm toàn cầu)
        subgraph Edge ["🌍 Edge Locations (Global)"]
            DNS["🧭 Amazon Route 53 (DNS)"]
            CDN["⚡ Amazon CloudFront (CDN Caching)"]
        end
        
        %% Region & VPC
        subgraph Region ["📍 Region (ap-southeast-1)"]
            S3[("🗄️ Amazon S3\n(Lưu Ảnh Manga)")]
            Cognito["🔐 Amazon Cognito\n(Đăng nhập / Auth)"]
            
            subgraph VPC ["🔒 VPC (Serverless Compute)"]
                APIGW{"🔀 API Gateway"}
                Lambda["⚙️ AWS Lambda\n(Xử lý Logic)"]
                DB[("⚡ Amazon DynamoDB\n(Database On-Demand)")]
            end
        end
    end

    %% Luồng đi của người dùng
    Users --> DNS
    DNS --> CDN
    Users -.->|"Đăng nhập vô app"| Cognito
    
    %% Tách luồng trên CDN
    CDN == "Đọc truyện (Static) " ==> S3
    CDN -- "Lấy comment/Like (Dynamic) " --> APIGW
    
    %% Lớp xử lý hệ thống
    APIGW --> Lambda
    Lambda --> DB
    
    %% Highlight màu nhấn mạnh
    style AWS fill:#f9f9f9,stroke:#ff9900,stroke-width:2px,color:#000
    style Edge fill:#e6f3ff,stroke:#0066cc,stroke-dasharray: 5 5
    style Region fill:#fff,stroke:#339933,stroke-width:1.5px
    style VPC fill:#f0f7f0,stroke:#339933,stroke-dasharray: 5 5
    style S3 fill:#ff9900,color:#fff
    style Lambda fill:#ff9900,color:#fff
    style DB fill:#336699,color:#fff
