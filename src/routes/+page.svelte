    <div class="card text-black ">
      <div class="card-header">
        <h1>Home of the Quiz Application</h1>
      </div>
    </div>

<script lang="ts">	
	import { goto } from "$app/navigation";
  	import { auth, db } from "$lib/firebase/firebase";

	import { userStore, Collection, FirebaseApp, collectionStore } from 'sveltefire';
	import type { user, stack, quiz, lobby, chatMessage } from "$lib/utils/db.d";
	
	const user = userStore(auth);

	function redirectLogin(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement; }): any {
    goto("/login")
	}

	function testQueries(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement; }): any {
    goto("/testQueries")
	}

</script>

{#if $user}
	{#if $user.metadata.creationTime === $user.metadata.lastSignInTime}
		<!-- new user -->
		<p>Hi {$user.displayName}! Let's get those points rolling! 💪</p>
	{:else}
		<!-- existing user -->
		<p>Welcome back {$user.displayName}!</p>
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
	<br /><br /><br />
	<button on:click={testQueries}>Get all data</button>
{:else}
<p>
    Welcome to our prototype of a quiz application!
    <br>You are not logged in.
  </p>
  <button class="btn btn-light" on:click={redirectLogin}>Let me in! 🚀</button>
{/if}