<h1>Home</h1>

<script lang="ts">
	import { goto } from "$app/navigation";
  import { auth, db } from "$lib/firebase/firebase";
	import { getAdditionalUserInfo, type UserProfile } from "firebase/auth";
	import { collection, getDocs } from "firebase/firestore";
  import { userStore, Collection, FirebaseApp } from 'sveltefire';


  const user = userStore(auth);

	function redirectLogin(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement; }): any {
    goto("/login")
	}
  const getQuerySnapshot = async () => {
  return await getDocs(collection(db, "quiz"));
}
let promise = getQuerySnapshot ();

</script>

{#if $user}
  {#if $user.metadata.creationTime === $user.metadata.lastSignInTime}
    <!-- new user -->
    <p>Hi {$user.displayName}! Let's get those points rolling! 💪</p>
  {:else}
    <!-- existing user -->
    <p>Welcome back {$user.displayName}!</p>

    {#await promise then querySnapshot}
    {#each querySnapshot.docs as doc}
      <li>{doc.id} => {doc.data().question}</li>
    {/each}
  {/await}

  {/if}
  <p>Your UserID is {$user.uid}</p>

  <FirebaseApp {auth} firestore={db}>
    <Collection ref="quiz" let:data let:count>
      <p> Here are {count} quiz questions:</p>
      {#each data  as quiz}
        {quiz.question}
      {/each}
    </Collection>
  </FirebaseApp>
{:else}
  <p>
    Welcome to our prototype of a quiz application!
    You are not logged in.
  </p>
  <button on:click={redirectLogin}>Let me in! 🚀</button>
{/if}
