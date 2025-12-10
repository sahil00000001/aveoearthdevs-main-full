import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { backendApi, UserProfile as BackendUserProfile } from '../services/backendApi'

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  alternate_address?: string
  bio?: string
  avatar_url?: string
  is_active?: boolean
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  session: Session | null
  loading: boolean
  isBackendConnected: boolean
  signUp: (email: string, password: string, name: string, role?: string, phone?: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  signInWithFacebook: () => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: AuthError | null }>
  loadUserProfile: () => Promise<void>
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [isBackendConnected, setIsBackendConnected] = useState(false)

  // Check backend connectivity
  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        await backendApi.healthCheck()
        setIsBackendConnected(true)
        console.log('✅ Backend API connected')
      } catch (error) {
        setIsBackendConnected(false)
        console.log('⚠️ Backend API not available, using Supabase fallback')
      }
    }
    checkBackendConnection()
  }, [])

  useEffect(() => {
    // Handle Google OAuth callback - check for tokens in URL hash
    const handleOAuthCallback = async () => {
      const hash = window.location.hash
      if (hash && hash.includes('access_token')) {
        console.log('🔗 Detected OAuth callback in URL hash')
        try {
          // Extract tokens from hash
          const hashParams = new URLSearchParams(hash.substring(1))
          const accessToken = hashParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token')
          
          if (accessToken) {
            console.log('✅ Found OAuth tokens, setting session...')
            // Set session with the tokens
            const { data: { session }, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            })
            
            if (session) {
              console.log('✅ OAuth session set successfully')
              setSession(session)
              setUser(session.user)
              
              // Set token in backend API client
              if (session.access_token) {
                backendApi.setToken(session.access_token)
                console.log('✅ Token set in backend API client')
              }
              
              // Clear hash from URL
              window.history.replaceState(null, '', window.location.pathname + window.location.search)
              
              // Create/update user profile
              await createOrUpdateUserProfile(session.user)
            } else if (error) {
              console.error('❌ Error setting OAuth session:', error)
            }
          }
        } catch (error) {
          console.error('❌ Error handling OAuth callback:', error)
        }
      }
    }
    
    // Check for OAuth callback on mount
    handleOAuthCallback()
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      // Set token in backend API client if session exists
      if (session?.access_token) {
        backendApi.setToken(session.access_token)
        console.log('✅ Initial token set in backend API client')
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event, session?.user?.email)
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Set token in backend API client
      if (session?.access_token) {
        backendApi.setToken(session.access_token)
        console.log('✅ Token updated in backend API client')
      } else if (event === 'SIGNED_OUT') {
        backendApi.setToken(null)
      }

      // If user signs in, create or update user profile
      if (event === 'SIGNED_IN' && session?.user) {
        await createOrUpdateUserProfile(session.user)
      }
      
      // If user signs out, clear everything
      if (event === 'SIGNED_OUT') {
        setUserProfile(null)
        setProfileLoading(false)
        backendApi.setToken(null)
        setUser(null)
        setSession(null)
        // Clear any cached auth data
        localStorage.removeItem('auth_token')
        localStorage.removeItem('supabase.auth.token')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Load profile when user changes
  useEffect(() => {
    if (user && !userProfile && !profileLoading) {
      console.log('🔄 User changed, loading profile...')
      loadUserProfile()
    }
  }, [user])

  const loadUserProfile = useCallback(async () => {
    try {
      if (!user) {
        console.log('⚠️ No user found, skipping profile load')
        setUserProfile(null)
        setProfileLoading(false)
        return
      }

      if (profileLoading) {
        console.log('⚠️ Profile already loading, skipping duplicate request')
        return
      }

      setProfileLoading(true)
      console.log('🔄 Loading user profile for:', user.email, 'ID:', user.id)
      
      // Try backend API first if connected
      if (isBackendConnected) {
        try {
          const profile = await backendApi.getProfile()
          console.log('✅ User profile loaded from backend:', profile)
          setUserProfile(profile as UserProfile)
          setProfileLoading(false)
          return
        } catch (error) {
          console.log('⚠️ Backend profile load failed, falling back to Supabase:', error)
        }
      }

      // Fallback to Supabase
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('❌ Error loading user profile:', error)
        
        // If profile doesn't exist, try to create it
        if (error.code === 'PGRST116') {
          console.log('📝 Profile not found, creating new profile...')
          await createOrUpdateUserProfile(user)
        } else {
          console.log('📝 Error loading profile, attempting to create...')
          await createOrUpdateUserProfile(user)
        }
        setProfileLoading(false)
        return
      }

      console.log('✅ User profile loaded successfully from Supabase:', profile)
      setUserProfile(profile)
      setProfileLoading(false)
    } catch (error) {
      console.error('❌ Error loading user profile:', error)
      
      // Try to create profile as fallback
      try {
        console.log('📝 Fallback: attempting to create profile...')
        await createOrUpdateUserProfile(user)
      } catch (createError) {
        console.error('❌ Failed to create profile as fallback:', createError)
      }
      setProfileLoading(false)
    }
  }, [user, isBackendConnected])

  const createOrUpdateUserProfile = async (user: User) => {
    try {
      console.log('🔄 Creating/updating user profile for:', user.email, 'ID:', user.id)
      
      // ALWAYS try backend API first (it has proper permissions and handles user creation)
      try {
        // Try to get profile from backend
        try {
          const existingProfile = await backendApi.getProfile()
          console.log('✅ User profile exists in backend:', existingProfile)
          setUserProfile(existingProfile as UserProfile)
          setProfileLoading(false)
          setIsBackendConnected(true)
          return
        } catch (getError: any) {
          // Profile not found - this is OK for new users
          console.log('📝 User profile not found in backend, will be created via backend login endpoint')
        }
        
        // For Google OAuth users or new users, backend will create profile during login
        // Just set a temporary profile from Supabase user metadata
        const tempProfile: UserProfile = {
          id: user.id,
          name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email!,
          role: user.user_metadata?.role || 'buyer',
          phone: user.user_metadata?.phone || user.phone,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          created_at: user.created_at || new Date().toISOString(),
          updated_at: user.updated_at || new Date().toISOString()
        }
        
        setUserProfile(tempProfile)
        setProfileLoading(false)
        setIsBackendConnected(true)
        
        // Backend will create the actual profile when user accesses protected endpoints
        console.log('✅ Temporary profile set, backend will create full profile on first use')
        return
      } catch (error) {
        console.error('❌ Error with backend profile creation:', error)
      }

      // If backend fails completely, we can't create profile (RLS blocks direct Supabase access)
      console.warn('⚠️ Could not create/update user profile - backend API required')
      setProfileLoading(false)
    } catch (error) {
      console.error('❌ Error creating/updating user profile:', error)
      setProfileLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name: string, role: string = 'buyer', phone?: string) => {
    try {
      // Always try backend API first (it will fallback if not available)
      try {
        const response = await backendApi.signup(email, password, name, phone, role)
        console.log('✅ User signed up via backend:', response)
        if (response.tokens?.access_token) {
          backendApi.setToken(response.tokens.access_token)
        } else if (response.access_token) {
          backendApi.setToken(response.access_token)
        }
        setIsBackendConnected(true)
        return { error: null }
      } catch (error: any) {
        console.log('⚠️ Backend signup failed, falling back to Supabase:', error?.message || error)
        setIsBackendConnected(false)
      }

      // Fallback to Supabase
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            phone
          }
        }
      })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      // ALWAYS try backend API first (it handles Supabase auth internally)
      try {
        const response = await backendApi.login(email, password)
        console.log('✅ User signed in via backend:', response)
        
        // Set backend token
        if (response.tokens?.access_token) {
          backendApi.setToken(response.tokens.access_token)
        } else if (response.access_token) {
          backendApi.setToken(response.access_token)
        }
        
        // Also get Supabase session for frontend compatibility
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            setSession(session)
            setUser(session.user)
          }
        } catch (sessionError) {
          console.log('⚠️ Could not get Supabase session, continuing with backend auth')
        }
        
        setUserProfile(response.user as UserProfile)
        setIsBackendConnected(true)
        return { error: null }
      } catch (error: any) {
        console.error('❌ Backend login failed:', error)
        // Don't fallback to Supabase directly - backend should handle all auth
        return { error: { message: error?.message || 'Invalid email or password' } as AuthError }
      }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  const signInWithFacebook = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  const signOut = async () => {
    try {
      console.log('🔄 Signing out...')
      
      // Clear token from backend API
      if (isBackendConnected) {
        try {
          await backendApi.logout()
          console.log('✅ Logged out from backend')
        } catch (error) {
          console.log('⚠️ Backend logout failed:', error)
        }
      }
      
      // Clear Supabase session
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('❌ Supabase signOut error:', error)
        throw error
      }
      
      // Clear local state
      setUser(null)
      setUserProfile(null)
      setSession(null)
      backendApi.setToken(null)
      
      console.log('✅ Successfully signed out')
    } catch (error) {
      console.error('❌ Error during sign out:', error)
      // Force clear local state even if sign out fails
      setUser(null)
      setUserProfile(null)
      setSession(null)
      backendApi.setToken(null)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error('No user logged in')

      console.log('🔄 Updating profile for user:', user.id, 'Updates:', updates)

      // Try backend API first if connected
      if (isBackendConnected) {
        try {
          const updatedProfile = await backendApi.updateProfile(updates)
          console.log('✅ Profile updated via backend:', updatedProfile)
          setUserProfile(updatedProfile as UserProfile)
          return { error: null }
        } catch (error) {
          console.log('⚠️ Backend profile update failed, falling back to Supabase:', error)
        }
      }

      // Fallback to Supabase
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating profile:', error)
        return { error }
      }

      if (data) {
        console.log('✅ Profile updated successfully in Supabase:', data)
        setUserProfile(data)
      }

      return { error: null }
    } catch (error) {
      console.error('❌ Exception updating profile:', error)
      return { error: error as AuthError }
    }
  }

  const refreshToken = async () => {
    try {
      if (isBackendConnected && user) {
        // Backend handles token refresh automatically
        console.log('🔄 Token refresh handled by backend')
      } else {
        // Supabase handles token refresh automatically
        console.log('🔄 Token refresh handled by Supabase')
      }
    } catch (error) {
      console.error('❌ Error refreshing token:', error)
    }
  }

  const value = {
    user,
    userProfile,
    session,
    loading,
    isBackendConnected,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    signOut,
    updateProfile,
    loadUserProfile,
    refreshToken
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
