# Student Attendance Management System Using DevOps Tools

A production-ready, full-stack Student Attendance Management System engineered with **React**, **Spring Boot 3**, **Hibernate / JPA**, and **PostgreSQL**. Featuring a high-contrast **Black & White monochrome theme** (with zero animations for instant responsiveness), 7-period daily attendance matrix, automated monthly calculations, defaulter identification, CSV export, and an automated DevOps delivery pipeline with **Docker**, **Kubernetes**, **Jenkins**, and **Selenium WebDriver**.

---

## 📸 Key Capabilities & Screenshots Reproduction

This system faithfully implements the exact specifications and layout from the academic design specification:

1. **Daily Attendance Matrix (7 Periods)**:
   - Department: `CSE (AI & ML)`
   - Attendance Date: `14/10/26`
   - High-contrast badges: `P — Present` and `A — Absent`
   - Periods: `P1`, `P2`, `P3`, `P4`, `P5`, `P6`, `P7`
   - Bulk Actions: *Mark All Present*, *Mark All Absent*, *Column-wise Toggle*, and *Row-wise Quick Actions*.

2. **Automated Monthly Attendance Report (October 2026)**:
   | Roll No. | Student | Working periods | Present | Absent | Attendance | Status |
   |:---|:---|:---:|:---:|:---:|:---:|:---:|
   | **101** | Student 1 | 154 | 140 | 14 | 90.91% | Normal |
   | **102** | Student 2 | 154 | 130 | 24 | 84.42% | Normal |
   | **103** | Student 3 | 154 | 115 | 39 | 74.68% | **Defaulter (&lt; 75%)** |
   | **104** | Student 4 | 154 | 150 | 4 | 97.40% | Normal |
   | **105** | Student 5 | 154 | 144 | 10 | 93.51% | Normal |

3. **Defaulter Cutoff Identification**:
   - Live configurable cutoff percentage (e.g. `75.0%`).
   - One-click filter to display only defaulter students.
   - Individual student dossier modal showing full date-by-date period breakdown.

---

## 🛠️ Technology Stack

| Layer | Technology | Version | Purpose |
|:---|:---|:---|:---|
| **Frontend** | React + Vite | React 19 / Vite 6 | Monochrome Black & White UI, zero animations |
| **Backend** | Spring Boot | 3.3.4 | REST API, validation, business logic |
| **ORM / Integration**| Hibernate + Spring Data JPA | 6.5 | Object-Relational Mapping & Transactions |
| **Database** | PostgreSQL | 18 / 16 | Relational persistence with unique constraints |
| **Icons** | Lucide React | 0.400+ | Crisp monochrome iconography |
| **Containerization** | Docker & Docker Compose | 29+ | Multi-stage image build & multi-container orchestration |
| **Orchestration** | Kubernetes | v1.28+ | Namespace, Deployments, Services, ConfigMaps, PVC |
| **CI / CD** | Jenkins Pipeline | Declarative | Multi-stage automated build & test pipeline |
| **Automated Testing** | Selenium WebDriver + JUnit 5 | 4.25 / 5.10 | 10 automated end-to-end test cases |

---

## 📁 Repository Structure

```
attendance-marking/
├── backend/                               # Spring Boot Application
│   ├── src/main/java/com/attendance/
│   │   ├── model/                         # JPA Entities (Student, AttendanceRecord)
│   │   ├── repository/                    # Spring Data Repositories
│   │   ├── service/                       # Business logic & Data Seeder
│   │   ├── controller/                    # REST Controllers
│   │   └── config/                        # CORS & Single Page App routing
│   ├── src/main/resources/
│   │   ├── application.properties         # Database & server configuration
│   │   └── static/                        # Bundled React SPA production build
│   ├── src/test/java/com/attendance/
│   │   ├── AttendanceSystemIntegrationTest.java
│   │   └── selenium/SeleniumAttendanceTest.java  # 10/10 Selenium Test Cases
│   ├── Dockerfile                         # Multi-stage Alpine JDK/JRE container
│   └── pom.xml                            # Maven dependencies & plugins
│
├── frontend/                              # React Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx                 # Monochrome navigation header
│   │   │   ├── DailyAttendanceView.jsx    # 7-Period attendance grid
│   │   │   ├── MonthlyReportView.jsx      # Monthly summary & defaulter table
│   │   │   ├── StudentManagementView.jsx  # Student CRUD management
│   │   │   ├── StudentDetailModal.jsx     # Individual student dossier
│   │   │   └── DevOpsView.jsx             # DevOps lifecycle & Selenium UI
│   │   ├── api.js                         # Axios client functions
│   │   ├── App.jsx                        # Master application state
│   │   └── index.css                      # Black & White styling (no animations)
│   ├── Dockerfile                         # Nginx multi-stage container
│   ├── nginx.conf                         # Reverse proxy configuration
│   └── package.json
│
├── devops/
│   ├── k8s/                               # Kubernetes Manifests
│   │   ├── 01-namespace.yaml
│   │   ├── 02-configmap.yaml
│   │   ├── 03-postgres-pvc.yaml
│   │   ├── 04-postgres.yaml
│   │   ├── 05-backend.yaml
│   │   └── 06-frontend.yaml
│   └── jenkins/
│       └── Jenkinsfile                    # 7-stage CI/CD pipeline
│
├── docker-compose.yml                     # Unified 3-tier container deployment
└── README.md                              # Complete documentation
```

---

## 🚀 Quick Start & Running Locally

### Option 1: Run Unified Executable JAR (Frontend + Backend + PostgreSQL)

The React frontend is pre-built into the Spring Boot JAR's static assets:

1. Ensure PostgreSQL is running on port `5432` with user `postgres` and password `root`:
   ```bash
   # Create database if not already created
   psql -U postgres -c "CREATE DATABASE attendance_db;"
   ```

2. Run the application JAR:
   ```bash
   java -jar backend/target/attendance-backend-1.0.0.jar
   ```

3. Open your browser:
   - **Web UI**: `http://localhost:8000/` (or `http://localhost:8080/`)
   - **REST API**: `http://localhost:8000/api/students`

---

### Option 2: Run in Development Mode (Vite Hot-Reload)

1. **Start Backend**:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open `http://localhost:3000/`

---

## 🐳 Docker & Docker Compose Deployment

Run the entire 3-tier production stack (PostgreSQL + Spring Boot Backend + React/Nginx Frontend) with a single command:

```bash
docker compose up --build -d
```

- **Frontend Web UI**: `http://localhost:3000`
- **Backend API**: `http://localhost:8080/api`
- **PostgreSQL**: `localhost:5432` (with volume persistence)

To stop the containers:
```bash
docker compose down
```

---

## ☸️ Kubernetes Cluster Deployment

Deploy to any Kubernetes cluster (Minikube, Kind, EKS, GKE, AKS):

```bash
# 1. Apply all Kubernetes manifests in order
kubectl apply -f devops/k8s/

# 2. Verify all pods and services are healthy
kubectl get all -n attendance-system

# 3. Access the frontend service via NodePort
minikube service frontend-service -n attendance-system
# Or port-forward directly:
kubectl port-forward svc/frontend-service 3000:80 -n attendance-system
```

---

## 🧪 Automated Selenium WebDriver Quality Assurance

The automated test suite (`backend/src/test/java/com/attendance/selenium/SeleniumAttendanceTest.java`) covers all **10 test cases** specified in Section 7:

| Test ID | Test Description | Status |
|:---|:---|:---:|
| **TC01** | Verify attendance page displays all registered students | **PASSED** |
| **TC02** | Verify attendance can be marked for all seven periods (P1 to P7) | **PASSED** |
| **TC03** | Verify attendance is saved successfully for a selected date | **PASSED** |
| **TC04** | Verify missing or invalid student information is handled | **PASSED** |
| **TC05** | Verify duplicate attendance entries are prevented (Unique constraint) | **PASSED** |
| **TC06** | Verify monthly attendance totals are calculated correctly (154 periods) | **PASSED** |
| **TC07** | Verify attendance percentage is displayed correctly (e.g. 90.91%) | **PASSED** |
| **TC08** | Verify students below configured threshold are identified (Defaulters) | **PASSED** |
| **TC09** | Verify monthly report can be generated and exported to CSV | **PASSED** |
| **TC10** | Verify saved records remain available after application restart | **PASSED** |

### Run Automated Tests via Maven:
```bash
cd backend
mvn test -Dtest=SeleniumAttendanceTest
```
*(Result: 10 Tests Run, 0 Failures, 0 Errors, BUILD SUCCESS)*

---

## 🔁 Jenkins CI/CD Pipeline

The declarative pipeline in `devops/jenkins/Jenkinsfile` automates:
1. **Checkout Source**: Pulls latest commit from GitHub repository.
2. **Backend Tests**: Executes JUnit 5 integration tests and parses surefire reports.
3. **Frontend Build**: Lints and compiles production React bundle.
4. **Package JAR**: Packages executable Spring Boot JAR with embedded frontend.
5. **Docker Build**: Creates tagged Docker images for backend and frontend.
6. **Selenium Verification**: Runs headless Selenium WebDriver test suite.
7. **Kubernetes Rollout**: Automatically deploys manifests and verifies rolling update status.

---

## 🎨 Design Philosophy: Pure Monochrome (Black & White)

Per project design guidelines:
- **Strict Black & White Aesthetic**: High contrast typography, pure black `#000000` accents, crisp white `#FFFFFF` canvases, and neutral slate borders.
- **Zero Animations**: System-wide `transition: none !important; animation: none !important;` disables distractions and delivers instantaneous, tactile UI feedback.
- **Print Optimization**: Native print stylesheet formats clean monthly attendance reports directly for PDF export and institutional record-keeping.
