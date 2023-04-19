<script lang="ts">
  import { login } from "$lib/auth";

  let email: string;
  let password: string;
</script>

<form
  on:submit|preventDefault={(event) => login(event, email, password)}
>
  <label for="email">Email:</label>
  <input type="email" id="email" bind:value={email} required />
  <br />
  <label for="password">Password:</label>
  <input type="password" id="password" bind:value={password} required />
  <br />
  <button type="submit">login</button>
</form>

