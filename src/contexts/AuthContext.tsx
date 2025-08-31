import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  RecaptchaVerifier,
  ConfirmationResult,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
  setDoc,
  getDoc,
  updateDoc as firestoreUpdateDoc,
  writeBatch,   // <-- Important: For atomic operations
  arrayUnion,   // <-- Important: For adding to an existing team
} from "firebase/firestore";
import { auth, googleProvider, db, setupRecaptcha, sendOTP, verifyOTP } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

// --- INTERFACES ---

interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
  preferences?: {
    notifications: boolean;
    theme: 'light' | 'dark' | 'system';
    language: string;
  };
  teamId?: string | null; // Allow teamId to be null
}

interface TeamRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  receiverId: string;
  receiverEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Timestamp;
}

interface Team {
  id: string;
  memberIds: string[];
  createdAt: Timestamp;
  createdBy: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithPhone: (phoneNumber: string) => Promise<ConfirmationResult>;
  verifyPhoneOTP: (confirmationResult: ConfirmationResult, otp: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setupPhoneAuth: (containerId: string) => RecaptchaVerifier;
  sendTeamRequest: (receiverEmail: string) => Promise<void>;
  fetchReceivedTeamRequests: () => Promise<TeamRequest[]>;
  acceptTeamRequest: (requestId: string, senderId: string) => Promise<void>;
  declineTeamRequest: (requestId: string) => Promise<void>;
  fetchTeamMembers: () => Promise<UserProfile[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchOrCreateUserProfile(currentUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchUserProfile = async (uid: string) => {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      setUserProfile(userDoc.data() as UserProfile);
    }
  };

  const fetchOrCreateUserProfile = async (user: User) => {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const profileData = userDoc.data() as UserProfile;
      setUserProfile(profileData);
      await firestoreUpdateDoc(userDocRef, { lastLoginAt: new Date().toISOString() });
    } else {
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        phoneNumber: user.phoneNumber || '',
        emailVerified: user.emailVerified,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        preferences: { notifications: true, theme: 'system', language: 'en' },
        teamId: null,
      };
      await setDoc(userDocRef, newProfile);
      setUserProfile(newProfile);
    }
  };

  const signIn = async (email: string, password: string) => {
    // ... (This function is likely correct, leaving as is)
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    // ... (This function is likely correct, leaving as is)
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if(result.user && displayName) await updateProfile(result.user, { displayName });
    if(result.user) await sendEmailVerification(result.user);
  };

  const signInWithGoogle = async () => {
    try {
      const { UniversalGoogleAuth } = await import('@/lib/universalAuth');
      await UniversalGoogleAuth.signIn();
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      // Fallback to web popup if universal auth fails
      await signInWithPopup(auth, googleProvider);
    }
  };

  const signOutUser = async () => {
    // ... (This function is likely correct, leaving as is)
    await signOut(auth);
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user || !userProfile) return;
    const userDocRef = doc(db, 'users', user.uid);
    await firestoreUpdateDoc(userDocRef, data);
    setUserProfile({ ...userProfile, ...data });
    toast({ title: "Profile Updated! ✨" });
  };
  
  // --- Other auth functions like resetPassword, etc. ---
  const sendVerificationEmail = async () => { if(user) await sendEmailVerification(user); };
  const resetPassword = async (email: string) => { 
    await sendPasswordResetEmail(auth, email);
    toast({ title: "Password reset email sent!", description: "Check your inbox for reset instructions." });
  };
  const setupPhoneAuth = (containerId: string): RecaptchaVerifier => { return setupRecaptcha(containerId); };
  const signInWithPhone = async (phoneNumber: string): Promise<ConfirmationResult> => { const recaptchaVerifier = setupRecaptcha('recaptcha-container'); return await sendOTP(phoneNumber, recaptchaVerifier); };
  const verifyPhoneOTP = async (confirmationResult: ConfirmationResult, otp: string) => { await verifyOTP(confirmationResult, otp); };


  // --- TEAM MANAGEMENT FUNCTIONS ---

  const sendTeamRequest = async (receiverEmail: string) => {
    if (!user || !userProfile) throw new Error("Authentication required.");
    if (user.email === receiverEmail) throw new Error("You cannot send a request to yourself.");

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', receiverEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) throw new Error("No user found with this email address.");
    
    const receiverDoc = querySnapshot.docs[0];
    // Add more checks here if needed (e.g., for existing requests)

    await addDoc(collection(db, 'teamRequests'), {
      senderId: user.uid,
      senderName: userProfile.displayName || user.email,
      senderEmail: user.email,
      receiverId: receiverDoc.id,
      receiverEmail: receiverDoc.data().email,
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    toast({ title: "Team request sent! 🚀" });
  };

  const fetchReceivedTeamRequests = async (): Promise<TeamRequest[]> => {
    if (!user) return [];
    const requestsRef = collection(db, 'teamRequests');
    const q = query(requestsRef, where('receiverId', '==', user.uid), where('status', '==', 'pending'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamRequest));
  };

  /**
   * THIS IS THE CORRECTED FUNCTION
   * It handles both creating a new team and joining an existing one.
   */
  const acceptTeamRequest = async (requestId: string, senderId: string) => {
    if (!user) throw new Error("You must be logged in to accept a request.");

    setLoading(true);
    const batch = writeBatch(db);

    try {
      // 1. Get the profile of the person who sent the invite
      const senderRef = doc(db, 'users', senderId);
      const senderDoc = await getDoc(senderRef);

      if (!senderDoc.exists()) {
        throw new Error("The user who sent the invite no longer exists.");
      }

      const senderProfile = senderDoc.data() as UserProfile;
      const existingTeamId = senderProfile.teamId;

      const receiverRef = doc(db, 'users', user.uid);
      const requestRef = doc(db, 'teamRequests', requestId);

      // 2. Check if the sender is already in a team
      if (existingTeamId) {
        // --- CASE 1: SENDER HAS A TEAM, SO RECEIVER JOINS IT ---
        const teamRef = doc(db, 'teams', existingTeamId);
        
        // Add the receiver to the team's member list
        batch.update(teamRef, { memberIds: arrayUnion(user.uid) });
        // Update the receiver's profile with the existing team ID
        batch.update(receiverRef, { teamId: existingTeamId });
      } else {
        // --- CASE 2: SENDER HAS NO TEAM, SO CREATE A NEW ONE ---
        const newTeamRef = doc(collection(db, 'teams')); // Get a new unique ID
        
        // Create the new team document
        batch.set(newTeamRef, {
          memberIds: [senderId, user.uid],
          createdAt: serverTimestamp(),
          createdBy: senderId,
        });

        // Update BOTH sender's and receiver's profiles with the NEW team ID
        batch.update(senderRef, { teamId: newTeamRef.id });
        batch.update(receiverRef, { teamId: newTeamRef.id });
      }

      // 3. The request is handled, so delete it
      batch.delete(requestRef);

      // 4. Commit all changes to the database at once
      await batch.commit();

      // 5. Refresh local profile to update the UI
      await fetchUserProfile(user.uid);

      toast({
        title: "Team request accepted! 🎉",
        description: "You are now part of the team.",
      });

    } catch (error: any) {
      console.error("Error accepting team request:", error);
      toast({ title: "Failed to accept request", description: error.message, variant: "destructive" });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const declineTeamRequest = async (requestId: string) => {
    // Deleting the request is cleaner than marking it as 'declined'
    const requestRef = doc(db, 'teamRequests', requestId);
    await deleteDoc(requestRef);
    toast({ title: "Team request declined" });
  };

  const fetchTeamMembers = async (): Promise<UserProfile[]> => {
    if (!userProfile?.teamId) return [];
    
    const teamDocRef = doc(db, 'teams', userProfile.teamId);
    const teamDoc = await getDoc(teamDocRef);
      
    if (!teamDoc.exists()) {
        // This can happen if a team is deleted. Clean up the user's profile.
        await firestoreUpdateDoc(doc(db, 'users', userProfile.uid), { teamId: null });
        setUserProfile(prev => prev ? { ...prev, teamId: null } : null);
        return [];
    }
      
    const teamData = teamDoc.data() as Team;
    const memberProfiles: UserProfile[] = [];
      
    for (const memberId of teamData.memberIds) {
      const memberDocRef = doc(db, 'users', memberId);
      const memberDoc = await getDoc(memberDocRef);
      if (memberDoc.exists()) {
        memberProfiles.push(memberDoc.data() as UserProfile);
      }
    }
    return memberProfiles;
  };
  
  // ... (getErrorMessage function)
  const getErrorMessage = (errorCode: string) => { /* your error messages */ return "An error occurred." };

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithPhone,
    verifyPhoneOTP,
    signOutUser,
    updateUserProfile,
    sendVerificationEmail,
    resetPassword,
    setupPhoneAuth,
    sendTeamRequest,
    fetchReceivedTeamRequests,
    acceptTeamRequest,
    declineTeamRequest,
    fetchTeamMembers,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
}