<script lang="ts">
  import { signOut } from "$lib/auth"
  import { auth } from "$lib/firebase/firebase";
  import { userStore } from "sveltefire";
  import "$lib/main.css"
  //import { Route} from '@sveltejs/kit'; is this needed for the question creation
  // import UserQuestion from '$lib/UserQuestion.svelte';
  const user = userStore(auth);
</script>

<nav class="navbar navbar-expand-lg navbar-light bg-light">
  <a class="navbar-brand" href="/">Home</a>
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>
  <div class="collapse navbar-collapse" id="navbarNav">
    <ul class="navbar-nav">
      <li class="nav-item">
        <a class="nav-link" href="/about">About</a>
      </li>
      <li class="nav-item"> 
        <a class="nav-link" href="/login">Login</a>
      </li> 
      <li class="nav-item">
        <a class="nav-link" href="/create-question">Quiz Questions</a>
      </li>
      {#if $user}
      <li class="nav-item">
        <button class="btn btn-outline-secondary" on:click={signOut}>Sign Out</button>
      </li>
      {/if}
   </ul>
  </div>
</nav>

<Route path="/user-question">
  <CreateQuizQuestion />
</Route> 

<slot></slot>
