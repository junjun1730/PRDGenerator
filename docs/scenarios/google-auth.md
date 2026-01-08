# Google OAuth Authentication - Test Scenarios

## Context
- **Feature**: Google OAuth 2.0 Authentication with Supabase Auth
- **Affected Files**:
  - `src/lib/store/useAuthStore.ts` (Zustand auth state management)
  - `src/components/auth/AuthProvider.tsx` (Auth context provider)
  - `src/components/auth/LoginButton.tsx` (Google login button)
  - `src/components/auth/UserMenu.tsx` (User menu with logout)
  - `src/app/api/auth/callback/route.ts` (OAuth callback handler)
  - `src/components/layout/Header.tsx` (Header integration)
  - `src/app/layout.tsx` (AuthProvider wrapper)
- **Dependencies**:
  - `@supabase/supabase-js` (v2.x)
  - `@supabase/ssr` (SSR helpers)
  - `zustand` (v4.x)
  - Supabase Auth (Google Provider)
  - Next.js 15 App Router
- **Related Types**:
  - `User` (from @supabase/supabase-js)
  - `Session` (from @supabase/supabase-js)
  - `AuthStore` (Zustand store interface)
- **Testing Framework**: Vitest + React Testing Library + Supabase mocking

---

## OAuth Flow Reference

### Standard OAuth 2.0 Flow (PKCE)

```
┌─────────┐                                  ┌──────────────┐
│ Browser │                                  │ Google OAuth │
│ Client  │                                  │   Server     │
└────┬────┘                                  └──────┬───────┘
     │                                              │
     │ 1. Click "Google로 로그인"                   │
     │────────────────────────────────────────────>│
     │                                              │
     │ 2. Redirect to Google OAuth page            │
     │<────────────────────────────────────────────│
     │    (with PKCE code_challenge)                │
     │                                              │
     │ 3. User approves Google account              │
     │────────────────────────────────────────────>│
     │                                              │
     │ 4. Redirect to callback with code            │
     │<────────────────────────────────────────────│
     │    /api/auth/callback?code=xxx               │
     │                                              │
┌────▼────────────┐                         ┌──────▼───────┐
│ Next.js API     │  5. Exchange code       │  Supabase    │
│ /api/auth/      │    for session          │  Auth        │
│ callback        │────────────────────────>│              │
└────┬────────────┘                         └──────┬───────┘
     │                                              │
     │ 6. Set session cookie                        │
     │<─────────────────────────────────────────────│
     │                                              │
     │ 7. Redirect to home                          │
     │────────────────────────────────────────────> │
     │                                              │
┌────▼────────────┐                                │
│ AuthProvider    │  8. Load session              │
│ (Client)        │───────────────────────────────>│
└────┬────────────┘                         ┌──────▼───────┐
     │                                       │  useAuthStore│
     │ 9. Update Zustand store               │  (Zustand)   │
     │──────────────────────────────────────>│              │
     │                                       └──────────────┘
     │
┌────▼────────────┐
│ UserMenu        │  10. Display user info
│ Component       │
└─────────────────┘
```

---

## Scenario Categories

### 1. Happy Path Scenarios

#### Scenario 1.1: User Clicks Login Button → OAuth Redirect
- **Given**:
  - User is not logged in (`user = null`, `session = null`)
  - LoginButton is rendered in Header
  - Google Provider is enabled in Supabase
- **When**: User clicks "Google로 로그인" button
- **Then**:
  - `signInWithOAuth()` is called with provider: 'google'
  - Button shows loading state (spinner, disabled)
  - Browser redirects to Google OAuth consent page
  - URL includes PKCE code_challenge parameter
  - redirectTo parameter set to `/api/auth/callback`

**Test Implementation**:
```typescript
it('should call signInWithOAuth on button click', async () => {
  const user = userEvent.setup();
  render(<LoginButton />);

  const button = screen.getByRole('button', { name: /google로 로그인/i });
  await user.click(button);

  expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
    provider: 'google',
    options: {
      redirectTo: expect.stringContaining('/api/auth/callback'),
    },
  });
});
```

---

#### Scenario 1.2: OAuth Callback Success → Session Creation
- **Given**:
  - User approved Google OAuth consent
  - Browser redirected to `/api/auth/callback?code=AUTH_CODE_123`
  - Valid authorization code received
- **When**: Callback API route processes the request
- **Then**:
  - `exchangeCodeForSession(code)` is called
  - Session is created in Supabase Auth
  - Session cookie is set (httpOnly, secure)
  - User is redirected to home page (`/`)
  - No error parameters in URL

**Test Implementation**:
```typescript
it('should exchange code for session and redirect', async () => {
  const request = new NextRequest(
    'http://localhost:3000/api/auth/callback?code=AUTH_CODE_123'
  );

  const response = await GET(request);

  expect(mockSupabaseClient.auth.exchangeCodeForSession).toHaveBeenCalledWith(
    'AUTH_CODE_123'
  );
  expect(response.status).toBe(302);
  expect(response.headers.get('Location')).toBe('http://localhost:3000/');
});
```

---

#### Scenario 1.3: AuthProvider Loads Initial Session
- **Given**:
  - User has valid session cookie from previous login
  - AuthProvider component mounts
  - Supabase client initialized
- **When**: AuthProvider's useEffect runs
- **Then**:
  - `getSession()` is called
  - Session data is retrieved from cookie
  - `setSession()` updates Zustand store
  - `setUser()` updates Zustand store
  - `setLoading(false)` indicates loading complete

**Test Implementation**:
```typescript
it('should load initial session on mount', async () => {
  const mockSession = {
    access_token: 'mock-token',
    user: mockUser,
  };

  mockSupabaseClient.auth.getSession.mockResolvedValue({
    data: { session: mockSession },
    error: null,
  });

  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

  await waitFor(() => {
    expect(useAuthStore.getState().session).toEqual(mockSession);
    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});
```

---

#### Scenario 1.4: AuthProvider Subscribes to Auth State Changes
- **Given**:
  - AuthProvider component mounted
  - User session is active
- **When**: `onAuthStateChange()` callback is registered
- **Then**:
  - Subscription is created
  - Callback function receives SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED events
  - Store is updated on each event
  - Subscription is cleaned up on unmount

**Test Implementation**:
```typescript
it('should subscribe to auth state changes', () => {
  const unsubscribe = vi.fn();
  mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe } },
  });

  const { unmount } = render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

  expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalled();

  unmount();
  expect(unsubscribe).toHaveBeenCalled();
});
```

---

#### Scenario 1.5: User Info Displayed in Header
- **Given**:
  - User is logged in (`user = mockUser`)
  - UserMenu component rendered in Header
  - User has email and avatar URL
- **When**: Component renders
- **Then**:
  - User email is displayed: `test@example.com`
  - Avatar image is displayed (32x32px, rounded)
  - Dropdown toggle button is visible
  - LoginButton is NOT rendered

**Test Implementation**:
```typescript
it('should display user email and avatar', () => {
  useAuthStore.setState({
    user: {
      email: 'test@example.com',
      user_metadata: { avatar_url: 'https://example.com/avatar.jpg' },
    },
  });

  render(<UserMenu />);

  expect(screen.getByText('test@example.com')).toBeInTheDocument();
  expect(screen.getByAltText('test@example.com')).toHaveAttribute(
    'src',
    'https://example.com/avatar.jpg'
  );
});
```

---

#### Scenario 1.6: User Clicks Logout → Session Cleared
- **Given**:
  - User is logged in
  - UserMenu dropdown is open
  - "로그아웃" button is visible
- **When**: User clicks "로그아웃" button
- **Then**:
  - `signOut()` is called on Supabase client
  - Session cookie is cleared
  - Zustand store is reset (`user = null`, `session = null`)
  - UserMenu unmounts (user is null)
  - LoginButton is rendered again

**Test Implementation**:
```typescript
it('should call signOut on logout button click', async () => {
  const user = userEvent.setup();
  useAuthStore.setState({ user: mockUser, session: mockSession });

  render(<UserMenu />);

  const menuButton = screen.getByRole('button');
  await user.click(menuButton); // Open dropdown

  const logoutButton = screen.getByText('로그아웃');
  await user.click(logoutButton);

  expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();

  await waitFor(() => {
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().session).toBeNull();
  });
});
```

---

#### Scenario 1.7: Session Persists After Page Refresh
- **Given**:
  - User is logged in
  - Session cookie is valid
- **When**: User refreshes the page (F5)
- **Then**:
  - AuthProvider loads session from cookie
  - User remains logged in
  - UserMenu displays user info
  - No re-authentication required

**Test Implementation**:
```typescript
it('should restore session after page refresh', async () => {
  mockSupabaseClient.auth.getSession.mockResolvedValue({
    data: { session: mockSession },
    error: null,
  });

  // Simulate page refresh
  const { rerender } = render(
    <AuthProvider>
      <Header />
    </AuthProvider>
  );

  await waitFor(() => {
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
  });

  rerender(
    <AuthProvider>
      <Header />
    </AuthProvider>
  );

  expect(screen.getByText(mockUser.email)).toBeInTheDocument();
});
```

---

### 2. Edge Cases

#### Scenario 2.1: User Cancels Google OAuth Consent
- **Given**:
  - User clicked login button
  - Google OAuth consent page is displayed
- **When**: User clicks "Cancel" or closes the OAuth window
- **Then**:
  - Browser redirects to `/api/auth/callback?error=access_denied`
  - Callback API returns redirect to home page
  - No error message displayed (user intentionally cancelled)
  - User remains logged out

**Test Implementation**:
```typescript
it('should handle OAuth cancellation gracefully', async () => {
  const request = new NextRequest(
    'http://localhost:3000/api/auth/callback?error=access_denied'
  );

  const response = await GET(request);

  expect(response.status).toBe(302);
  expect(response.headers.get('Location')).toBe('http://localhost:3000/');
  expect(mockSupabaseClient.auth.exchangeCodeForSession).not.toHaveBeenCalled();
});
```

---

#### Scenario 2.2: User Already Logged In Clicks Login Button
- **Given**:
  - User is already logged in (`user !== null`)
  - LoginButton is NOT rendered (UserMenu is shown instead)
- **When**: User navigates to home page
- **Then**:
  - UserMenu is displayed
  - LoginButton is not in DOM
  - No duplicate login attempt

**Test Implementation**:
```typescript
it('should not render LoginButton when user is logged in', () => {
  useAuthStore.setState({ user: mockUser, session: mockSession });

  render(<Header />);

  expect(screen.queryByText('Google로 로그인')).not.toBeInTheDocument();
  expect(screen.getByText(mockUser.email)).toBeInTheDocument();
});
```

---

#### Scenario 2.3: User Has No Avatar URL
- **Given**:
  - User is logged in
  - `user.user_metadata.avatar_url` is undefined
- **When**: UserMenu renders
- **Then**:
  - Email is displayed
  - Avatar image is NOT rendered
  - No broken image icon
  - Dropdown still functional

**Test Implementation**:
```typescript
it('should handle missing avatar URL', () => {
  useAuthStore.setState({
    user: {
      email: 'test@example.com',
      user_metadata: {}, // No avatar_url
    },
  });

  render(<UserMenu />);

  expect(screen.getByText('test@example.com')).toBeInTheDocument();
  expect(screen.queryByAltText('test@example.com')).not.toBeInTheDocument();
});
```

---

#### Scenario 2.4: Session Expires → Auto Refresh
- **Given**:
  - User is logged in
  - Access token expires after 1 hour
  - Refresh token is valid
- **When**: Token expiration time is reached
- **Then**:
  - Supabase SDK automatically refreshes token
  - `onAuthStateChange` receives TOKEN_REFRESHED event
  - New session is stored in Zustand
  - User remains logged in seamlessly

**Test Implementation**:
```typescript
it('should handle token refresh automatically', async () => {
  const onAuthStateChange = mockSupabaseClient.auth.onAuthStateChange;
  let callback: (event: string, session: any) => void;

  onAuthStateChange.mockImplementation((cb) => {
    callback = cb;
    return { data: { subscription: { unsubscribe: vi.fn() } } };
  });

  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

  const newSession = { ...mockSession, access_token: 'new-token' };
  callback!('TOKEN_REFRESHED', newSession);

  await waitFor(() => {
    expect(useAuthStore.getState().session).toEqual(newSession);
  });
});
```

---

#### Scenario 2.5: Multiple Tabs → Auth State Synced
- **Given**:
  - User has multiple browser tabs open
  - User logs out in Tab 1
- **When**: Logout occurs
- **Then**:
  - All tabs receive SIGNED_OUT event
  - All tabs update to logged out state
  - LoginButton appears in all tabs

**Test Implementation**:
```typescript
it('should sync auth state across components', async () => {
  const { rerender } = render(
    <>
      <AuthProvider>
        <Header />
      </AuthProvider>
      <AuthProvider>
        <Header />
      </AuthProvider>
    </>
  );

  useAuthStore.getState().signOut();

  await waitFor(() => {
    const loginButtons = screen.getAllByText('Google로 로그인');
    expect(loginButtons).toHaveLength(2);
  });
});
```

---

### 3. Error States

#### Scenario 3.1: OAuth Callback Missing Code Parameter
- **Given**:
  - Browser redirected to `/api/auth/callback` (no code parameter)
- **When**: Callback API route processes request
- **Then**:
  - Returns 400 Bad Request
  - Error message: "Missing code parameter"
  - User is NOT logged in
  - No session created

**Test Implementation**:
```typescript
it('should return 400 when code is missing', async () => {
  const request = new NextRequest(
    'http://localhost:3000/api/auth/callback' // No code parameter
  );

  const response = await GET(request);

  expect(response.status).toBe(400);
  const body = await response.json();
  expect(body.error).toBe('Missing code parameter');
});
```

---

#### Scenario 3.2: exchangeCodeForSession Fails
- **Given**:
  - Valid authorization code received
  - Supabase Auth service is down or code is invalid
- **When**: `exchangeCodeForSession()` is called
- **Then**:
  - Error is returned from Supabase
  - User redirected to `/?error=oauth_failed`
  - Toast notification: "로그인에 실패했습니다. 다시 시도해주세요."
  - User remains logged out

**Test Implementation**:
```typescript
it('should handle exchangeCodeForSession error', async () => {
  mockSupabaseClient.auth.exchangeCodeForSession.mockResolvedValue({
    data: { session: null, user: null },
    error: { message: 'Invalid code', status: 400 },
  });

  const request = new NextRequest(
    'http://localhost:3000/api/auth/callback?code=INVALID_CODE'
  );

  const response = await GET(request);

  expect(response.status).toBe(302);
  expect(response.headers.get('Location')).toContain('error=oauth_failed');
});
```

---

#### Scenario 3.3: signInWithOAuth Network Failure
- **Given**:
  - User clicks login button
  - Network connection is lost
- **When**: `signInWithOAuth()` is called
- **Then**:
  - Promise rejects with network error
  - Button loading state stops
  - Button becomes clickable again
  - Console error logged
  - User can retry

**Test Implementation**:
```typescript
it('should handle network error on login', async () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation();
  mockSupabaseClient.auth.signInWithOAuth.mockRejectedValue(
    new Error('Network error')
  );

  const user = userEvent.setup();
  render(<LoginButton />);

  const button = screen.getByRole('button', { name: /google로 로그인/i });
  await user.click(button);

  await waitFor(() => {
    expect(consoleError).toHaveBeenCalledWith(
      'Login failed:',
      expect.any(Error)
    );
    expect(button).not.toBeDisabled();
  });

  consoleError.mockRestore();
});
```

---

#### Scenario 3.4: getSession Fails on Mount
- **Given**:
  - AuthProvider component mounts
  - Supabase client throws error (cookie corrupted)
- **When**: `getSession()` is called
- **Then**:
  - Error is caught
  - User state remains null (logged out)
  - isLoading set to false
  - No infinite loading state
  - LoginButton is displayed

**Test Implementation**:
```typescript
it('should handle getSession error gracefully', async () => {
  mockSupabaseClient.auth.getSession.mockResolvedValue({
    data: { session: null },
    error: { message: 'Invalid session', status: 401 },
  });

  render(
    <AuthProvider>
      <Header />
    </AuthProvider>
  );

  await waitFor(() => {
    expect(useAuthStore.getState().isLoading).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(screen.getByText('Google로 로그인')).toBeInTheDocument();
  });
});
```

---

#### Scenario 3.5: signOut Fails
- **Given**:
  - User is logged in
  - Network error occurs during logout
- **When**: User clicks "로그아웃"
- **Then**:
  - `signOut()` throws error
  - Local state is still cleared (user = null)
  - User appears logged out in UI
  - Cookie may remain (will be cleared on next page load)

**Test Implementation**:
```typescript
it('should clear local state even if signOut fails', async () => {
  mockSupabaseClient.auth.signOut.mockRejectedValue(
    new Error('Network error')
  );

  useAuthStore.setState({ user: mockUser, session: mockSession });

  await useAuthStore.getState().signOut();

  expect(useAuthStore.getState().user).toBeNull();
  expect(useAuthStore.getState().session).toBeNull();
});
```

---

### 4. UI State Tests

#### Scenario 4.1: LoginButton Loading State
- **Given**:
  - User clicks login button
  - OAuth redirect is in progress
- **When**: Button is in loading state
- **Then**:
  - Button shows spinner icon
  - Button text changes to "로그인 중..."
  - Button is disabled (cannot click again)
  - Cursor changes to not-allowed

**Test Implementation**:
```typescript
it('should show loading state during login', async () => {
  const user = userEvent.setup();
  render(<LoginButton />);

  const button = screen.getByRole('button', { name: /google로 로그인/i });
  await user.click(button);

  expect(button).toBeDisabled();
  expect(screen.getByText(/로그인 중/i)).toBeInTheDocument();
  expect(button.querySelector('svg')).toBeInTheDocument(); // Spinner
});
```

---

#### Scenario 4.2: UserMenu Dropdown Toggle
- **Given**:
  - User is logged in
  - UserMenu is rendered
  - Dropdown is initially closed
- **When**: User clicks user info button
- **Then**:
  - Dropdown opens
  - "로그아웃" button becomes visible
  - Dropdown positioned below button (absolute, top-full, right-0)
  - z-index: 10 (dropdown layer)

**Test Implementation**:
```typescript
it('should toggle dropdown on click', async () => {
  const user = userEvent.setup();
  useAuthStore.setState({ user: mockUser, session: mockSession });

  render(<UserMenu />);

  expect(screen.queryByText('로그아웃')).not.toBeInTheDocument();

  const menuButton = screen.getByRole('button');
  await user.click(menuButton);

  expect(screen.getByText('로그아웃')).toBeInTheDocument();

  await user.click(menuButton);

  expect(screen.queryByText('로그아웃')).not.toBeInTheDocument();
});
```

---

#### Scenario 4.3: UserMenu Closes on Outside Click
- **Given**:
  - UserMenu dropdown is open
  - User clicks outside dropdown area
- **When**: Click event fires
- **Then**:
  - Dropdown closes
  - Only user info button remains visible

**Test Implementation**:
```typescript
it('should close dropdown on outside click', async () => {
  const user = userEvent.setup();
  useAuthStore.setState({ user: mockUser, session: mockSession });

  render(
    <div>
      <UserMenu />
      <div data-testid="outside">Outside</div>
    </div>
  );

  const menuButton = screen.getByRole('button');
  await user.click(menuButton);

  expect(screen.getByText('로그아웃')).toBeInTheDocument();

  await user.click(screen.getByTestId('outside'));

  expect(screen.queryByText('로그아웃')).not.toBeInTheDocument();
});
```

---

#### Scenario 4.4: Responsive Header Layout
- **Given**:
  - User is logged in
  - Viewport is mobile (320px)
- **When**: Header renders
- **Then**:
  - UserMenu adapts to small screen
  - Email truncates if too long (max-w-[150px], truncate)
  - Avatar size remains 32x32px
  - Dropdown width adjusts (min-w-[200px])

**Test Implementation**:
```typescript
it('should adapt to mobile viewport', () => {
  useAuthStore.setState({ user: mockUser, session: mockSession });

  global.innerWidth = 320;
  global.dispatchEvent(new Event('resize'));

  render(<Header />);

  const email = screen.getByText(mockUser.email);
  expect(email).toHaveClass('text-sm');
});
```

---

#### Scenario 4.5: Keyboard Navigation
- **Given**:
  - User is using keyboard (no mouse)
- **When**: User presses Tab key
- **Then**:
  - LoginButton receives focus (focus ring visible)
  - Pressing Enter triggers login
  - UserMenu button receives focus
  - Pressing Enter opens dropdown
  - Pressing Escape closes dropdown

**Test Implementation**:
```typescript
it('should support keyboard navigation', async () => {
  const user = userEvent.setup();
  render(<LoginButton />);

  const button = screen.getByRole('button', { name: /google로 로그인/i });

  await user.tab();
  expect(button).toHaveFocus();

  await user.keyboard('{Enter}');
  expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalled();
});
```

---

### 5. Integration Tests

#### Scenario 5.1: Full Login Flow (E2E)
- **Given**:
  - User starts on home page (logged out)
- **When**: User completes full login flow
- **Then**:
  1. Clicks "Google로 로그인"
  2. Redirected to Google OAuth (mocked)
  3. Approves consent (mocked)
  4. Redirected to `/api/auth/callback?code=xxx`
  5. Session created
  6. Redirected to home page
  7. UserMenu appears with email
  8. PRD creation includes user_id

**Test Implementation**:
```typescript
it('should complete full login flow', async () => {
  const user = userEvent.setup();

  render(
    <AuthProvider>
      <Header />
    </AuthProvider>
  );

  // Step 1: Click login
  const loginButton = screen.getByText('Google로 로그인');
  await user.click(loginButton);

  // Step 2-5: Simulate OAuth callback (mocked)
  const callback = mockSupabaseClient.auth.onAuthStateChange.mock.calls[0][0];
  callback('SIGNED_IN', mockSession);

  // Step 6-7: Verify UserMenu appears
  await waitFor(() => {
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    expect(screen.queryByText('Google로 로그인')).not.toBeInTheDocument();
  });
});
```

---

#### Scenario 5.2: Full Logout Flow (E2E)
- **Given**:
  - User is logged in
- **When**: User completes logout flow
- **Then**:
  1. Opens UserMenu dropdown
  2. Clicks "로그아웃"
  3. `signOut()` called
  4. Session cleared
  5. UserMenu unmounts
  6. LoginButton appears

**Test Implementation**:
```typescript
it('should complete full logout flow', async () => {
  const user = userEvent.setup();
  useAuthStore.setState({ user: mockUser, session: mockSession });

  render(
    <AuthProvider>
      <Header />
    </AuthProvider>
  );

  // Step 1: Open dropdown
  const menuButton = screen.getByRole('button');
  await user.click(menuButton);

  // Step 2: Click logout
  const logoutButton = screen.getByText('로그아웃');
  await user.click(logoutButton);

  // Step 3-6: Verify state cleared
  await waitFor(() => {
    expect(useAuthStore.getState().user).toBeNull();
    expect(screen.getByText('Google로 로그인')).toBeInTheDocument();
  });
});
```

---

#### Scenario 5.3: Auth State Persists with PRD Creation
- **Given**:
  - User is logged in
  - User fills out questionnaire (Stage 1-3)
- **When**: User clicks "PRD 생성하기"
- **Then**:
  - `createPrdDocument()` is called with `user.id`
  - Document inserted with `user_id = [logged-in user UUID]`
  - User can view document in "내 PRD" page later

**Test Implementation**:
```typescript
it('should include user_id when creating PRD', async () => {
  useAuthStore.setState({ user: mockUser });

  const questionnaireData = { /* valid data */ };
  await createPrdDocument(questionnaireData, mockUser.id);

  expect(mockSupabaseClient.from('prd_documents').insert).toHaveBeenCalledWith(
    expect.objectContaining({
      user_id: mockUser.id,
      questionnaire_data: questionnaireData,
    })
  );
});
```

---

#### Scenario 5.4: Anonymous User Can Still Create PRD
- **Given**:
  - User is NOT logged in (`user = null`)
  - User fills out questionnaire
- **When**: User clicks "PRD 생성하기"
- **Then**:
  - `createPrdDocument()` is called with `userId = null`
  - Document inserted with `user_id = NULL`
  - Anonymous document created (RLS allows)
  - Document is public (anyone can view)

**Test Implementation**:
```typescript
it('should allow anonymous PRD creation', async () => {
  useAuthStore.setState({ user: null });

  const questionnaireData = { /* valid data */ };
  await createPrdDocument(questionnaireData, null);

  expect(mockSupabaseClient.from('prd_documents').insert).toHaveBeenCalledWith(
    expect.objectContaining({
      user_id: null,
      questionnaire_data: questionnaireData,
    })
  );
});
```

---

## Mock Requirements

### Supabase Auth Mock (Already Implemented in `src/lib/__tests__/mocks/supabase.ts`)

```typescript
const mockSupabaseClient = {
  auth: {
    // OAuth login
    signInWithOAuth: vi.fn().mockResolvedValue({
      data: {
        provider: 'google',
        url: 'https://accounts.google.com/o/oauth2/v2/auth?...',
      },
      error: null,
    }),

    // OAuth callback
    exchangeCodeForSession: vi.fn().mockResolvedValue({
      data: {
        session: mockSession,
        user: mockUser,
      },
      error: null,
    }),

    // Session management
    getSession: vi.fn().mockResolvedValue({
      data: { session: mockSession },
      error: null,
    }),

    getUser: vi.fn().mockResolvedValue({
      data: { user: mockUser },
      error: null,
    }),

    // Logout
    signOut: vi.fn().mockResolvedValue({
      error: null,
    }),

    // Auth state listener
    onAuthStateChange: vi.fn((callback) => ({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    })),
  },
};

// Mock user data
const mockUser = {
  id: 'google-oauth-user-123',
  email: 'test@example.com',
  user_metadata: {
    avatar_url: 'https://lh3.googleusercontent.com/a/default-user',
    full_name: '테스트 사용자',
    provider: 'google',
  },
  app_metadata: {
    provider: 'google',
  },
  aud: 'authenticated',
  created_at: '2026-01-08T00:00:00Z',
};

// Mock session data
const mockSession = {
  access_token: 'mock-access-token-xyz',
  refresh_token: 'mock-refresh-token-xyz',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: mockUser,
};
```

---

## Test Coverage Goals

### Zustand Store (`useAuthStore`)
- ✅ Initial state (user, session, isLoading)
- ✅ setUser action
- ✅ setSession action
- ✅ setLoading action
- ✅ signOut action (calls Supabase + clears state)

### LoginButton Component
- ✅ Renders "Google로 로그인" text
- ✅ Calls signInWithOAuth on click
- ✅ Shows loading state (spinner, disabled)
- ✅ Handles OAuth error gracefully
- ✅ Keyboard accessible (Tab, Enter)

### UserMenu Component
- ✅ Displays user email
- ✅ Displays avatar (if available)
- ✅ Opens/closes dropdown on click
- ✅ Calls signOut on logout button
- ✅ Closes on outside click
- ✅ Returns null when user is null

### AuthProvider Component
- ✅ Loads initial session on mount
- ✅ Subscribes to auth state changes
- ✅ Updates store on SIGNED_IN event
- ✅ Updates store on SIGNED_OUT event
- ✅ Updates store on TOKEN_REFRESHED event
- ✅ Unsubscribes on unmount

### OAuth Callback API
- ✅ Exchanges code for session
- ✅ Sets session cookie
- ✅ Redirects to home on success
- ✅ Returns 400 when code missing
- ✅ Redirects to error page on failure

### Integration
- ✅ Full login flow (button → OAuth → callback → UserMenu)
- ✅ Full logout flow (dropdown → signOut → LoginButton)
- ✅ Auth state syncs across components
- ✅ PRD creation includes user_id (or null)

---

## Success Criteria

### All Tests Must Pass
```bash
npm test google-auth
# Expected: 15/15 tests passing (RED → GREEN)
```

### Type Safety
```bash
npx tsc --noEmit
# Expected: 0 errors
```

### Accessibility
- ✅ ARIA labels on buttons
- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Focus visible (ring-2 ring-brand-500)
- ✅ Screen reader compatible

### Korean UI
- ✅ "Google로 로그인"
- ✅ "로그인 중..."
- ✅ "로그아웃"
- ✅ Error messages in Korean

### Performance
- ✅ No unnecessary re-renders
- ✅ Session loads < 200ms
- ✅ OAuth redirect < 500ms

---

**Total Test Scenarios**: 30+
**Estimated Test Lines**: ~1000 lines
**Coverage Goal**: 100% for auth components
