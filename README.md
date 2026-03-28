# Kubernetes Service Exposure & DNS Resolution (Frontend + Backend)

## 🚀 Overview

This project demonstrates **how services are exposed and discovered inside and outside a Kubernetes cluster**, using a simple frontend-backend application.

The backend API embeds **node-level metadata (node name)** in responses to validate **request routing and load distribution across nodes**.

**Problem Solved:**

* Understanding how traffic flows from **external clients → cluster → pods**
* Verifying **load balancing behavior across nodes**
* Demonstrating **service discovery via DNS (CoreDNS) instead of hardcoded IPs**

**Why this architecture:**

* **ClusterIP (backend):** Keeps internal services private and discoverable via DNS
* **LoadBalancer (frontend):** Exposes only the entry point externally
* **Node-aware responses:** Provides visibility into how Kubernetes distributes traffic

---

## 🏗️ Architecture

```text id="q7n4ts"
        ┌──────────────┐
        │   Client     │
        └──────┬───────┘
               │
        ┌──────▼────────┐
        │ LoadBalancer  │
        │ frontend-svc  │
        └──────┬────────┘
               │
        ┌──────▼────────┐
        │ Frontend Pods │
        └──────┬────────┘
               │ (HTTP via DNS)
        ┌──────▼────────┐
        │ Backend Svc   │ (ClusterIP)
        └──────┬────────┘
               │
        ┌──────▼────────┐
        │ Backend Pods  │
        │ (Node-aware)  │
        └───────────────┘
```

**Component Interaction:**

* External traffic enters via **LoadBalancer**
* Frontend pods communicate with backend via **Kubernetes DNS (FQDN)**
* Backend pods return responses including **node identity**

**Design Trade-offs:**

* **ClusterIP for backend**

  * ✅ Secure, internal-only communication
  * ❌ Not directly accessible externally

* **LoadBalancer for frontend**

  * ✅ Simple external exposure
  * ❌ Cloud/provider dependency in real environments

* **DNS-based service discovery**

  * ✅ Decouples services from IP changes
  * ❌ Requires understanding of CoreDNS and FQDN resolution

---

## ⚙️ Tech Stack

**Backend:**

* Python (API service returning node metadata)

**Frontend:**

* Lightweight web UI (calls backend API)

**Infrastructure:**

* Kubernetes (Deployments, Services)
* CoreDNS (service discovery)

**Containerization:**

* Docker (image build and push)

---

## 📦 Services / Components

* **Backend Service**

  * Returns API responses including:

    * Node name (via environment or Downward API)
  * Exposed internally via ClusterIP

* **Frontend Service**

  * Calls backend API using Kubernetes DNS
  * Exposed externally via LoadBalancer

* **CoreDNS**

  * Resolves service names to ClusterIP
  * Enables communication using:

    ```text
    backend-service.default.svc.cluster.local
    ```

---

## 🔄 Request Flow

1. Client sends request to frontend LoadBalancer
2. LoadBalancer routes traffic to one of the frontend pods
3. Frontend pod calls backend service using DNS:

   ```bash
   http://backend-service
   ```
4. CoreDNS resolves service name to ClusterIP
5. Kubernetes routes request to one of the backend pods
6. Backend responds with node metadata
7. Response flows back to client

**Key Insight:**
Node name in response confirms **which node handled the request**, validating load distribution.

---

## 🛠️ Setup & Installation

```bash id="d9k2mz"
# Build and push images
docker build -t <repo>/backend:v1 .
docker push <repo>/backend:v1

docker build -t <repo>/frontend:v1 .
docker push <repo>/frontend:v1

# Deploy backend
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

# Deploy frontend
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/loadbalancer.yaml

# Verify
kubectl get pods -o wide
kubectl get svc
```

---

## 🧪 Key DevOps Concepts Demonstrated

* **Service Types**

  * ClusterIP (internal communication)
  * LoadBalancer (external exposure)

* **Service Discovery**

  * DNS-based communication via CoreDNS

* **Loose Coupling**

  * Services communicate via names, not IPs

* **Load Distribution Visibility**

  * Node-aware responses validate traffic routing

* **Container Lifecycle**

  * Build → push → deploy workflow

---

## 🔐 Production Considerations

* **Security**

  * Backend should not be publicly exposed
  * Use Ingress + TLS instead of raw LoadBalancer

* **Scalability**

  * Horizontal scaling of frontend and backend pods
  * LoadBalancer distributes traffic across nodes

* **Observability**

  * Add logging/metrics to track request distribution
  * Node metadata useful for debugging uneven load

* **Networking**

  * Use NetworkPolicies to restrict service communication

* **Failure Handling**

  * Readiness/liveness probes to avoid routing to unhealthy pods

---

## 🚧 Challenges & Learnings

* **Understanding DNS vs IP-based communication**

  * Initial attempts used hardcoded IPs → brittle design
  * Resolved using CoreDNS and FQDN

* **Service abstraction confusion**

  * Service is not a pod → it’s a stable virtual endpoint

* **Load balancing visibility**

  * Needed node-level metadata to confirm distribution

* **Mental Model Shift:**

  * **Junior thinking:** “Frontend calls backend using IP”
  * **Production reality:**

    * Services must be **discoverable, not fixed**
    * DNS abstraction is critical for resilience

---

## 📌 Future Improvements

* Replace LoadBalancer with Ingress + domain routing
* Add autoscaling (HPA) for frontend/backend
* Introduce service mesh (Istio) for traffic control
* Add distributed tracing to follow requests across services
* Implement canary deployments for safer releases

---

## 📸 Diagram (Simplified)

```text id="c8t4wv"
Client → LoadBalancer → Frontend → Backend (ClusterIP) → Pods
                              ↓
                        CoreDNS Resolution
```

---

## 💡 Key Takeaway

This project demonstrates **how Kubernetes networking actually works in practice**:

* External vs internal service exposure
* DNS-based service discovery
* Load balancing across pods and nodes
* Designing systems that are **resilient to change (IP, scaling, failures)**

