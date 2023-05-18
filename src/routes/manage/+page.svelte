<script lang="ts">
import CreateYourOwnQuestion from './CreateQuizQuestion.svelte';
import { user} from 'sveltefire/auth';

let userId = 'USER_ID';
</script>

<html lang="en">
  <body>
    <div class="container-background">
      <div class="card text-black ">
        <div class="card-header">
          <h1>Quiz Questions</h1>
        </div>
        <p class="card-text">Create,Edit and Delete you own Quiz Questions.</p>
        {#if $user !== null}
        <CreateYourOwnQuestion  userID={userId}/>
        {:else}
        <p>Please log in to create your own quiz questions.</p>
        {/if}
      </div>
    </div>
  </body>
</html>

