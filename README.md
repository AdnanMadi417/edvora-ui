### Authentication Setup

The application uses JWT (JSON Web Token) for authentication. To set up authentication:

1. Create a `.env.local` file in the project root with the following variables:
```bash
# Required for JWT token verification - must match your backend's AUTH_SECRET_KEY
AUTH_SECRET_KEY=your_secret_here

# Your backend API URL (defaults to staging if not set)
# Examples:
# - Local development: NEXT_PUBLIC_API_URL=http://localhost:3000
# - Staging: NEXT_PUBLIC_API_URL=https://staging-backend-l9en3.ondigitalocean.app
# - Production: NEXT_PUBLIC_API_URL=https://api.yourproduction.com
NEXT_PUBLIC_API_URL=your_api_url
```

Note: The `NEXT_PUBLIC_` prefix in `NEXT_PUBLIC_API_URL` makes this environment variable accessible in the browser. This is necessary because API calls are made from both server and client-side code.
# ui-template
# ui-template
