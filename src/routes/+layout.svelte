<script lang="ts">
  import { signOut } from "$lib/auth"
  import { auth } from "$lib/firebase/firebase";
  import { userStore } from "sveltefire";
  import "$lib/main.css"

  const user = userStore(auth);
</script>

<nav class="navbar navbar-expand-lg navbar-light bg-light">
  <a class="navbar-brand" href="/">Home</a>
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>
  <div class="collapse navbar-collapse" id="navbarNav">
    <ul class="navbar-nav ml-auto">
      
      {#if !$user}
      <li class="nav-item ml-auto"> 
        <a class="btn btn-outline-secondary" href="/login">Login</a>
      </li> 
      {:else}
      <li class="nav-item">
        <a class="nav-link" href="/create">Create Quiz Questions</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="/manage">Edit Quiz Questions</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="/about">About</a>
      </li>
      <li class="nav-item ml-auto">
        <button class="btn btn-outline-secondary" on:click={signOut}>Sign Out</button>
      </li>
      {/if}
   </ul>
  </div>
</nav>

<slot></slot>
