import { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { auth, db } from '../src/services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { theme } from '../src/theme';
import { Text } from '../src/components';
import { z } from 'zod';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const createUserIfNotExists = async (firebaseUser: any) => {
    try {
      console.log('Checking if user exists:', firebaseUser.uid);
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        console.log('Creating new user document');
        const userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName ?? '',
          photoURL: firebaseUser.photoURL ?? '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          settings: {
            currency: 'USD',
            theme: 'system' as const,
            notifications: true,
          },
        };
        await setDoc(userRef, userData);
        console.log('User document created');
      }
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error;
    }
  };

  const checkAndCreateInitialAccount = async (userId: string) => {
    try {
      console.log('Checking for initial account');
      const accountsCollectionRef = collection(db, `users/${userId}/accounts`);
      const accountsSnapshot = await getDocs(accountsCollectionRef);

      if (accountsSnapshot.empty) {
        console.log('Creating initial CASH account');
        await addDoc(accountsCollectionRef, {
          name: 'Cash',
          type: 'CASH',
          balance: 0,
          currency: 'USD',
          isArchived: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        console.log('Initial account created');
      }
    } catch (error) {
      console.error('Error creating initial account:', error);
      throw error;
    }
  };

  const handleSignIn = async () => {
    try {
      setError('');
      setLoading(true);

      const validatedInput = signInSchema.parse({ email, password });

      const userCredential = await signInWithEmailAndPassword(
        auth,
        validatedInput.email,
        validatedInput.password
      );

      if (userCredential.user) {
        console.log('User signed in:', userCredential.user.uid);
        await createUserIfNotExists(userCredential.user);
        await checkAndCreateInitialAccount(userCredential.user.uid);
      }
    } catch (err) {
      console.error('Sign-in error:', err);
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
        placeholderTextColor={theme.colors.gray[500]}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        placeholderTextColor={theme.colors.gray[500]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSignIn}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Text>
      </TouchableOpacity>
      <Link href="/sign-up" asChild replace>
        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
  },
  title: {
    fontSize: 28,
    fontFamily: theme.typography.bold,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    color: theme.colors.black,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    fontSize: 16,
    backgroundColor: theme.colors.white,
    fontFamily: theme.typography.regular,
    color: theme.colors.black,
  },
  button: {
    height: 52,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    textAlign: 'center',
    color: theme.colors.white,
    fontSize: 16,
    fontFamily: theme.typography.bold,
  },
  linkButton: {
    padding: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontFamily: theme.typography.medium,
    textAlign: 'center',
  },
  error: {
    color: theme.colors.red,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    fontFamily: theme.typography.regular,
  },
}); 