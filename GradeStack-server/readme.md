# GradeStack Server

Backend service for GradeStack application built with Node.js, Express, TypeScript and PostgreSQL.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## Environment Setup

1. Clone the repository:

```bash
git clone https://github.com/your-username/GradeStack-server.git
cd GradeStack-server
```

2. Create a `.env` file in the root directory with the following content:

```
    PORT=3000
    DATABASE_URL="postgresql://postgres:phudk123@localhost:5432/gradestack?schema=public"
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USER=haylamditmemay1996@gmail.com
    SMTP_PASS=bwwr jrwg znwc ahiz
    SMTP_FROM=GradeStack <noreply@gradestack.com>
    FRONTEND_URL=http://localhost:3000
```

3. Push Prisma schema to database:

```
    npx prisma db push

```

4. Generate Prisma client:

```
    npx prisma generate

```


5. Run the development server:

```
    npm run dev
    
```


