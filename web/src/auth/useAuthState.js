import { useEffect, useState } from 'react'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, firebaseReady } from '../lib/firebase'

export function useAuthState() {
  const [user, setUser] = useState(null)
  const [claims, setClaims] = useState({ role: 'viewer' })
  const [loading, setLoading] = useState(firebaseReady)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!firebaseReady || !auth) {
      return undefined
    }

    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      try {
        setUser(nextUser)

        if (!nextUser) {
          setClaims({ role: 'viewer' })
          setLoading(false)
          return
        }

        const token = await nextUser.getIdTokenResult(true)
        setClaims({ role: token.claims.role || 'viewer' })

        await setDoc(
          doc(db, 'profiles', nextUser.uid),
          {
            uid: nextUser.uid,
            email: nextUser.email || null,
            displayName: nextUser.displayName || null,
            photoURL: nextUser.photoURL || null,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        )
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    })

    return () => unsub()
  }, [])

  async function login() {
    setError('')
    try {
      if (!auth) {
        throw new Error('Firebase Auth is not configured. Add web/.env.local values.')
      }

      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (err) {
      setError(err.message)
    }
  }

  async function logout() {
    setError('')
    try {
      if (!auth) {
        return
      }

      await signOut(auth)
    } catch (err) {
      setError(err.message)
    }
  }

  return { user, claims, loading, error, login, logout }
}
