# OnaZaidi - Tourism Photography Platform

A full-stack platform for tourism photography, allowing photographers to upload and sell destination photos, and travelers to browse, purchase, and download high-quality images.

## Features

- **Authentication & Authorization**
  - User registration with email verification
  - JWT-based authentication with refresh tokens
  - Role-based access control (Admin, Photographer, Customer)
  - Password reset functionality

- **Album Management**
  - Create and manage photo albums
  - Organize photos by destinations
  - Album visibility controls

- **Destination & Attraction Management**
  - Browse destinations and attractions
  - Categorized photo collections
  - Search and filter functionality

- **Shopping Cart & Orders**
  - Add photos to cart
  - Secure checkout with PayPal/Pesapal integration
  - Order tracking and history

- **Photo Downloads**
  - Secure download URLs with expiration
  - Purchase-based access control
  - Download history tracking

- **Admin Dashboard**
  - Real-time SSE-based event streaming
  - Manage users, albums, destinations
  - Monitor orders and payments

## Tech Stack

### Backend
- **Framework**: Spring Boot 3.3.5 (Java 21)
- **Database**: PostgreSQL 16 with Flyway migrations
- **Security**: Spring Security with JWT (jjwt 0.12.6)
- **Storage**: AWS S3 SDK (compatible with MinIO)
- **Image Processing**: Thumbnailator, Metadata Extractor
- **API Documentation**: SpringDoc OpenAPI (Swagger UI)
- **Email**: Spring Mail with Thymeleaf templates
- **Build Tool**: Maven

### Frontend
- **Framework**: React 19.2.8 with TypeScript
- **Build Tool**: Vite 8.3.0
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Routing**: React Router DOM 6.26.2
- **Form Handling**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS 3.4.13
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Caddy (production)
- **Email Testing**: Mailhog (development)

## Prerequisites

- **Java**: JDK 21 or higher
- **Node.js**: v20 or higher
- **Docker**: Latest version
- **Docker Compose**: v2.0 or higher
- **PostgreSQL**: 16 (or use Docker)
- **Maven**: 3.9 or higher (or use Maven wrapper)

## Project Structure

```
OnaZaidi/
├── backend/                 # Spring Boot backend
│   ├── src/
│   │   └── main/
│   │       ├── java/com/onazaidi/
│   │       │   ├── album/          # Album management
│   │       │   ├── auth/           # Authentication & authorization
│   │       │   ├── cart/           # Shopping cart
│   │       │   ├── category/       # Photo categories
│   │       │   ├── common/         # Shared utilities & exceptions
│   │       │   ├── config/         # Spring configuration
│   │       │   ├── destination/    # Destinations & attractions
│   │       │   ├── download/       # Photo downloads
│   │       │   ├── order/          # Order management
│   │       │   ├── payment/        # Payment processing
│   │       │   ├── photo/          # Photo management
│   │       │   └── user/           # User management
│   │       └── resources/
│   │           ├── db/migration/   # Flyway migrations
│   │           └── templates/      # Email templates
│   ├── pom.xml
│   └── Dockerfile
├── onazaidi-frontend/        # React frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   ├── store/            # Zustand stores
│   │   └── types/            # TypeScript types
│   ├── package.json
│   └── Dockerfile
├── deploy/                   # Deployment configurations
│   ├── caddy/
│   ├── nginx/
│   ├── scripts/
│   └── backups/
├── docker-compose.yml        # Development environment
├── docker-compose.prod.yml   # Production environment
└── .env.example             # Environment variables template
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd OnaZaidi
```

### 2. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# ---------- Domain ----------
DOMAIN=onazaidi.com

# ---------- Postgres ----------
POSTGRES_DB=onazaidi
POSTGRES_USER=onazaidi
POSTGRES_PASSWORD=change-me-to-a-long-random-string

# ---------- JWT ----------
# Must be at least 64 random characters. Generate with:
#   openssl rand -base64 64 | tr -d '\n'
JWT_SECRET=change-me-to-a-very-long-random-secret-at-least-64-chars

# ---------- MinIO / S3 ----------
MINIO_ROOT_USER=onazaidi
MINIO_ROOT_PASSWORD=change-me-to-another-long-random-string
S3_BUCKET=onazaidi-media
S3_REGION=us-east-1

# ---------- Bootstrap admin ----------
ADMIN_EMAIL=admin@onazaidi.com
ADMIN_PASSWORD=change-this-immediately-after-first-login

# ---------- Payments (optional) ----------
PESAPAL_KEY=
PESAPAL_SECRET=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=

# ---------- Email (optional, e.g. Resend / SES SMTP) ----------
MAIL_HOST=
MAIL_PORT=587
MAIL_USER=
MAIL_PASSWORD=
```

### 3. Start Infrastructure Services

Start PostgreSQL, Mailhog, and MinIO using Docker Compose:

```bash
docker-compose up -d
```

Verify services are running:
- PostgreSQL: `localhost:5432`
- Mailhog (SMTP): `localhost:1025`
- Mailhog (Web UI): `http://localhost:8025`
- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`

### 4. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Build the project:

```bash
./mvnw clean install
```

Run the application:

```bash
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

**API Documentation**: Access Swagger UI at `http://localhost:8080/swagger-ui.html`

### 5. Frontend Setup

Navigate to the frontend directory:

```bash
cd onazaidi-frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Development Guidelines

### Backend Development

- **Code Style**: Follow Spring Boot conventions and use Lombok for boilerplate reduction
- **API Design**: RESTful principles with standardized response format (`ApiResponse<T>`)
- **Validation**: Use Jakarta Bean Validation with custom validators where needed
- **Database Changes**: Create new Flyway migrations in `backend/src/main/resources/db/migration/`
- **Testing**: Write unit tests for services and integration tests for controllers
- **Security**: Always validate user permissions before accessing resources

### Frontend Development

- **Code Style**: Follow TypeScript best practices with strict mode enabled
- **Component Structure**: Keep components small and focused
- **State Management**: Use Zustand for global state, React Query for server state
- **Form Handling**: Use React Hook Form with Zod schemas for validation
- **API Calls**: Centralize API calls in the `services/` directory using React Query
- **Styling**: Use Tailwind CSS utility classes with `clsx` and `tailwind-merge` for conditional styles

### Git Workflow

1. Create a feature branch from `main`
2. Make your changes and commit with clear messages
3. Run tests and linting
4. Push and create a pull request
5. Ensure code review and CI/CD checks pass before merging

### Common Commands

**Backend**:
```bash
cd backend
./mvnw clean install          # Build project
./mvnw spring-boot:run        # Run application
./mvnw test                   # Run tests
./mvnw flyway:migrate         # Run database migrations
```

**Frontend**:
```bash
cd onazaidi-frontend
npm install                   # Install dependencies
npm run dev                   # Start dev server
npm run build                 # Build for production
npm run lint                  # Run linter
npm run preview               # Preview production build
```

**Docker**:
```bash
docker-compose up -d          # Start all services
docker-compose down           # Stop all services
docker-compose logs -f        # View logs
docker-compose ps             # Check service status
```

## Production Deployment

### Using Docker Compose (Production)

Use the production compose file:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment

1. **Build Backend**:
   ```bash
   cd backend
   ./mvnw clean package -DskipTests
   docker build -t onazaidi-backend:latest .
   ```

2. **Build Frontend**:
   ```bash
   cd onazaidi-frontend
   npm run build
   docker build -t onazaidi-frontend:latest .
   ```

3. **Deploy**:
   - Use the provided deployment scripts in `deploy/scripts/`
   - Configure Caddy for reverse proxy and SSL
   - Set up PostgreSQL backups using `deploy/backups/`

### Environment Variables for Production

Ensure all secrets are properly set:
- Use strong, randomly generated passwords
- Configure proper email service (SES, Resend, etc.)
- Set up payment gateway credentials
- Enable HTTPS with valid SSL certificates

## Troubleshooting

### Backend Issues

- **Database Connection Error**: Ensure PostgreSQL is running and credentials match `.env`
- **Migration Failures**: Check Flyway migrations and manually rollback if needed
- **JWT Token Issues**: Verify `JWT_SECRET` is set and at least 64 characters

### Frontend Issues

- **API Connection Errors**: Check backend is running and CORS is configured
- **Build Failures**: Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- **TypeScript Errors**: Ensure all types are properly defined in `types/` directory

### Docker Issues

- **Port Conflicts**: Change ports in `docker-compose.yml` if needed
- **Volume Issues**: Remove volumes with `docker-compose down -v` to reset
- **Memory Issues**: Increase Docker memory allocation in settings

## Support

For issues, questions, or contributions, please refer to the project's issue tracker or contact the development team.

## License

[Specify your license here]
