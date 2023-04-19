<script lang="ts">
  import { signOut } from "$lib/auth"
  import { auth } from "$lib/firebase/firebase";
  import { userStore } from "sveltefire";

  const user = userStore(auth);
</script>

<nav>
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="/login">Login</a>
  {#if $user}
    <button on:click={signOut}>Sign Out</button>
  {/if}
</nav>

<slot></slot>
