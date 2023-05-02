import { goto } from '$app/navigation';
import { auth } from "./firebase/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  getIdToken,
  deleteUser,
} from "firebase/auth";


export async function login(
  event: SubmitEvent,
  email: string,
  password: string
): Promise<void> {
  event.preventDefault(); // Prevent the default form submission behavior

  try {
    await signInWithEmailAndPassword(auth, email, password);

    // Navigate to the protected route or display a success message
    goto("/")

  } catch (error) {
    const typedError = error as Error;
    console.error("Error logging in:", typedError.message);
    alert("Error logging in: " + typedError.message);
  }
}


export async function signup(
  event: SubmitEvent, 
  username: string,
  email: string, 
  password: string 
): Promise<void> {

  event.preventDefault()

  try {

    // create new user in Firebase Auth
    const userRecord = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // update username
    await updateProfile(userRecord.user, { displayName: username });

    // call server function to add user to Firestore
    const response = await fetch('/api/addUser', {
        method: 'POST',
        body: JSON.stringify(userRecord.user),
        headers: {
            'content-type': 'application/json'
        }
    });
    const success = await response.json();

    if (!response.ok || !success) {
      deleteUser(userRecord.user)
      throw new Error('Error creating new user in Firestore. Deleting new user...')
    }

    // if success, redirect to main page
    goto("/")

  } catch (error) {
    const typedError = error as Error
    console.error("Error signing up:", typedError.message);
  }
}

export async function signOut(
  event: MouseEvent
): Promise<void> {
  auth.signOut();
}
