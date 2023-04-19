<script lang="ts">
  import Signup from "./signup.svelte";
  import Login from "./login.svelte";

  let wantsToSignup: boolean = false;

  function toggleLoginMode(event: MouseEvent) {
    wantsToSignup = !wantsToSignup;
  } 
</script>

<html lang="en">
  <body>
    <h1>Login</h1>

    <div>
      {#if wantsToSignup}
        <Signup/>
      {:else}
        <Login/>
      {/if}
      <div>
        <button on:click={toggleLoginMode}>
          {#if wantsToSignup}
            login instead
          {:else}
            signup instead
          {/if}
        </button>
      </div>
    </div>
  </body>
</html>

<style>
  html,body {
    height:100%;
    width:100%;
    margin:0;
  }
  body {
    display:flex;
  }
  div {
    margin:auto;
  }
</style>
