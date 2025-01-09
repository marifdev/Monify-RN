import { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Link, router } from 'expo-router';
import { auth, db } from '../src/services/firebase';
import { useAuthStore } from '../src/store';
import { z } from 'zod';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { theme } from '../src/theme';
import { Text } from '../src/components';

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
});

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);

  const createInitialAccount = async (userId: string) => {
    const accountsCollectionRef = collection(db, `users/${userId}/accounts`);
    await addDoc(accountsCollectionRef, {
      name: 'Cash',
      type: 'CASH',
      balance: 0,
      currency: 'USD',
      isArchived: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const handleSignUp = async () => {
    try {
      setError('');
      setLoading(true);

      const validatedInput = signUpSchema.parse({ email, password, displayName });

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        validatedInput.email,
        validatedInput.password
      );

      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: validatedInput.displayName,
        });

        const userRef = doc(db, 'users', userCredential.user.uid);
        const userData = {
          id: userCredential.user.uid,
          email: userCredential.user.email!,
          displayName: validatedInput.displayName ?? '',
          photoURL: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          settings: {
            currency: 'USD',
            theme: 'system' as const,
            notifications: true,
          },
        };
        await setDoc(userRef, userData);
        await createInitialAccount(userCredential.user.uid);

        setUser({
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        router.replace('/(tabs)/accounts');
      }
    } catch (err) {
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
      <Text style={styles.title}>Create Account</Text>
      <TextInput
        placeholder="Display Name"
        value={displayName}
        onChangeText={setDisplayName}
        style={styles.input}
        placeholderTextColor={theme.colors.gray[500]}
      />
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
        onPress={handleSignUp}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating account...' : 'Create Account'}
        </Text>
      </TouchableOpacity>
      <Link href="/sign-in" asChild replace>
        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText}>Already have an account? Sign In</Text>
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
  },
  error: {
    color: theme.colors.red,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    fontFamily: theme.typography.regular,
  },
}); 