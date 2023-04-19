import { goto } from '$app/navigation';
import { auth } from "./firebase/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  getIdToken,
} from "firebase/auth";


// called when logging in
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
  }
}


// called signing up
export async function signup(
  event: SubmitEvent, 
  username: string,
  email: string, 
  password: string 
): Promise<void> {
  event.preventDefault()
  if (email == null)
    console.log("Email is null!");
  console.log(email);
  try {
    const userRecord = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await updateProfile(userRecord.user, { displayName: username });
    const idToken = await getIdToken(userRecord.user, true);
    goto("/")
  } catch (error) {
    // handle error
    const typedError = error as Error
    console.error("Error logging in:", typedError.message);
  }
}
