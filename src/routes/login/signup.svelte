<script lang="ts">
  import { signup } from "$lib/auth";

  let username: string;
  let email: string;
  let password: string;
</script>

<form
  on:submit|preventDefault={(event) => signup(event, username, email, password)}
>
  <label for="username">Username:</label>
  <input type="username" id="username" bind:value={username} required />
  <br />
  <label for="email">Email:</label>
  <input type="email" id="email" bind:value={email} required />
  <br />
  <label for="password">Password:</label>
  <input type="password" id="password" bind:value={password} required />
  <br />
  <button type="submit">sign up</button>
</form>

