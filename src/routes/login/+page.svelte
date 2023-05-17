<script lang="ts">
  import Signup from "./signup.svelte";
  import Login from "./login.svelte";

  let wantsToSignup: boolean = false;

  function toggleLoginMode() {
    wantsToSignup = !wantsToSignup;
  } 
</script>

<html lang="en">
  <body>
    <div class="container-background">
    <div class="card text-black ">
      <div class="card-header">
        <h1>Login</h1>
      </div>
    </div>
    </div>

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
