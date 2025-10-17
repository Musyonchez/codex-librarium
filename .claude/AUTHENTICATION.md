# Authentication

The application uses **Supabase Auth** for user authentication with Google OAuth as the primary sign-in method.

## Overview

- **Provider:** Supabase Auth (built on GoTrue)
- **Strategy:** OAuth 2.0 with Google
- **Session Management:** HTTP-only cookies via Supabase middleware
- **Protected Routes:** Server-side and client-side checks

---

## Authentication Flow

### Sign-In Process

1. User clicks "Sign In" button
2. Redirects to Google OAuth consent screen
3. User authorizes application
4. Google redirects to `/auth/callback` with authorization code
5. Supabase exchanges code for session tokens
6. Session stored in HTTP-only cookie
7. User redirected to `/dashboard`

**Visual Flow:**
```
[Sign In Button] → [Google OAuth] → [/auth/callback] → [Dashboard]
                                          ↓
                                    [Set Cookie]
```

---

## Configuration

### Environment Variables

Required in `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# Google OAuth (configured in Supabase dashboard)
GOOGLE_CLIENT_ID=[client-id].apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
```

### Supabase Dashboard Setup

**1. Enable Google Provider:**
- Go to Authentication → Providers
- Enable Google
- Add Client ID and Client Secret
- Set Redirect URL: `https://[project-id].supabase.co/auth/v1/callback`

**2. Add Authorized Domains:**
- Development: `http://localhost:3000`
- Production: `https://yourdomain.com`

**3. Configure OAuth Redirect:**
- Site URL: `http://localhost:3000` (dev) or production URL
- Redirect URLs: `http://localhost:3000/auth/callback`

### Google Cloud Console Setup

**1. Create OAuth 2.0 Credentials:**
- Go to APIs & Services → Credentials
- Create OAuth client ID
- Application type: Web application
- Authorized redirect URIs: `https://[project-id].supabase.co/auth/v1/callback`

**2. OAuth Consent Screen:**
- User type: External
- Scopes: email, profile, openid
- Test users: (optional for dev)

---

## Implementation

### Client Initialization

**Browser Client:**
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
```

**Server Client:**
```typescript
// lib/supabase/server.ts
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = async () => {
  const cookieStore = await cookies();

  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
};
```

### Middleware

**Cookie Management:**
```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}
```

**Protected Paths:**
```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

---

## Sign-In Implementation

### Button Component

```typescript
// components/Navbar.tsx
const handleLogin = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
};

<button onClick={handleLogin} className={styles.btnPrimary}>
  Sign In
</button>
```

### Callback Handler

```typescript
// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}
```

---

## Sign-Out Implementation

```typescript
// components/Navbar.tsx
const handleLogout = async () => {
  await supabase.auth.signOut();
  router.push('/');
};

<button onClick={handleLogout}>
  Sign Out
</button>
```

---

## Protected Routes

### Client-Side Protection

```typescript
// components/AppLayout.tsx
export default function AppLayout({ requireAuth = false }: AppLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setLoading(false);

    if (requireAuth && !user) {
      router.push('/');
    }
  };

  if (loading && requireAuth) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}
```

### Server-Side Protection

```typescript
// app/api/reading/route.ts
export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Proceed with authenticated request...
}
```

---

## Session Management

### Session Duration

- **Access Token:** 1 hour (default)
- **Refresh Token:** 30 days (default)
- **Auto-refresh:** Handled by Supabase client

### Session State

**Get Current User:**
```typescript
const { data: { user } } = await supabase.auth.getUser();
```

**Get Session:**
```typescript
const { data: { session } } = await supabase.auth.getSession();
```

**Listen to Auth Changes:**
```typescript
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (event, session) => {
    console.log('Auth event:', event);
    console.log('Session:', session);
  }
);
```

**Events:**
- `SIGNED_IN` - User signed in
- `SIGNED_OUT` - User signed out
- `TOKEN_REFRESHED` - Access token refreshed
- `USER_UPDATED` - User metadata updated

---

## User Data

### User Object

```typescript
interface User {
  id: string;                    // UUID
  email: string;                 // user@example.com
  user_metadata: {
    name?: string;               // Full name from Google
    avatar_url?: string;         // Profile picture URL
    email_verified?: boolean;
  };
  app_metadata: {
    provider: 'google';
  };
  created_at: string;
  last_sign_in_at: string;
}
```

### Accessing User Data

```typescript
// In client component
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();

console.log(user?.email);
console.log(user?.user_metadata.name);
```

### Display User Info

```typescript
// Extract username from email
const getUsername = (email?: string) => {
  if (!email) return '';
  const username = email.split('@')[0];
  return username.length > 15
    ? username.substring(0, 15) + '...'
    : username;
};

// Usage
<span>{getUsername(user?.email)}</span>
```

---

## Security Considerations

### Row Level Security (RLS)

All database tables have RLS enabled:

```sql
-- reading_progress table
CREATE POLICY "Users can read own progress"
  ON reading_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON reading_progress FOR UPDATE
  USING (auth.uid() = user_id);
```

### HTTP-Only Cookies

Session tokens stored in HTTP-only cookies:
- Not accessible via JavaScript
- Prevents XSS attacks
- Sent automatically with requests

### HTTPS Only

In production, ensure:
- HTTPS enforced
- Secure cookies enabled
- HSTS headers set

---

## Troubleshooting

### Common Issues

**"User not found" Error:**
- Check if user is signed in: `await supabase.auth.getUser()`
- Verify cookie middleware is working
- Check browser has cookies enabled

**Redirect Loop:**
- Verify redirect URLs in Supabase dashboard
- Check middleware isn't blocking auth routes
- Ensure `/auth/callback` is accessible

**OAuth Error:**
- Verify Google OAuth credentials
- Check redirect URIs match exactly
- Ensure OAuth consent screen is configured

**Session Expired:**
- Sessions expire after inactivity
- Refresh token handles automatic renewal
- Prompt user to sign in again if refresh fails

### Debug Commands

```typescript
// Check current session
const { data } = await supabase.auth.getSession();
console.log('Session:', data.session);

// Check user
const { data: userData } = await supabase.auth.getUser();
console.log('User:', userData.user);

// Test auth state
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event);
  console.log('Session:', session);
});
```

---

## Testing Authentication

### Local Testing

1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Click "Sign In"
4. Authorize with Google account
5. Should redirect to `/dashboard`

### Test User Creation

```sql
-- Check users in Supabase
SELECT id, email, created_at FROM auth.users;

-- Check reading progress for user
SELECT * FROM reading_progress WHERE user_id = '...';
```

---

## Future Enhancements

Potential auth improvements:

1. **Email/Password Auth** - Alternative to Google
2. **Magic Links** - Passwordless email login
3. **Multi-Factor Auth** - Extra security layer
4. **Profile Management** - Edit user profile
5. **Account Deletion** - GDPR compliance
6. **Session Management UI** - View active sessions
7. **Rate Limiting** - Prevent brute force attacks

For now, Google OAuth provides simple, secure authentication with minimal maintenance.
