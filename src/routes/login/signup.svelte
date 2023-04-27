<script lang="ts">
  import { signup } from "$lib/auth";

  let username: string;
  let email: string;
  let password: string;
  
  function isValidEmail(email: string): boolean {
    return email.endsWith("@iu-study.org") || email.endsWith("@iubh-fernstudium.de") || email.endsWith("@iubh.de") || email.endsWith("@iu.org");
  }

  function passwordLength(password: string): boolean {
    return (password.length < 6);
  }
</script>

<form
  on:submit|preventDefault={(event) => {
    if (!isValidEmail(email)) {
      alert("No valid IU Mail-address");
      return;
    }
    if (passwordLength(password)) {
      alert("Password should be at least 6 characters");
      return;
    }
    signup(event, username, email, password);
  }}
>
  <label for="username">Username:</label>
  <input type="username" id="username" bind:value={username} required />
  <br />
  <label for="email">IU Email:</label>
  <input type="email" id="email" bind:value={email} required />
  <br />
  <label for="password">Password:</label>
  <input type="password" id="password" bind:value={password} required />
  <br />
  <button type="submit">sign up</button>
</form>

