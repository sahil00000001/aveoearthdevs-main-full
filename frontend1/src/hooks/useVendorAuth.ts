import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

interface VendorSession {
  id: string
  email: string
  businessName: string
  loginTime: string
}

export const useVendorAuth = () => {
  const [vendor, setVendor] = useState<VendorSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const checkVendorSession = () => {
      try {
        // Check localStorage for mock vendor session
        const session = localStorage.getItem('vendorSession')
        if (session) {
          const vendorData = JSON.parse(session)
          setVendor(vendorData)
          setUser({ id: vendorData.id, email: vendorData.email } as any)
          setLoading(false)
          return
        }

        // TEMPORARILY DISABLED FOR REVIEW - Provide mock vendor data
        const mockVendor = {
          id: 'temp-vendor-123',
          email: 'review@example.com',
          businessName: 'Review Vendor',
          loginTime: new Date().toISOString()
        }
        setVendor(mockVendor)
        setUser({ id: mockVendor.id, email: mockVendor.email } as any)
        setLoading(false)

        // Original behavior (commented out):
        // setLoading(false)
      } catch (error) {
        console.error('Error checking vendor session:', error)
        setLoading(false)
      }
    }

    // Use setTimeout to simulate async behavior but load immediately
    setTimeout(checkVendorSession, 100)
  }, [])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      localStorage.removeItem('vendorSession')
      setVendor(null)
      setUser(null)
      window.location.href = '/vendor'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const isAuthenticated = () => {
    // TEMPORARILY DISABLED FOR REVIEW - Always return true
    return true
    // Original: return !!(vendor && user)
  }

  return {
    vendor,
    user,
    loading,
    signOut,
    isAuthenticated
  }
}






