<script lang="ts">
  import { Button, ListGroup, ListGroupItem, FormGroup, Label, Input } from 'sveltestrap';
  import { Doc, Collection } from 'sveltefire';

  export let lobbyID: string;
  export let loggedInUser: any;
  export let selectedStacks: string[];

  const gameModes: string[] = ['Singleplayer', 'Team Coop', 'Team Versus'];
  let selectedMode: string = gameModes[0];


  async function saveSettings(): Promise<void> {
    try {
      // call server function to update lobby settings in Firestore
      const response = await fetch('/api/saveLobbySettings', {
          method: 'POST',
          body: JSON.stringify({ selectedMode, selectedStacks, lobbyID }),
          headers: {
              'content-type': 'application/json'
          }
      });
      const success = await response.json();

      if (response.ok && success) {
        alert('Settings saved!');
      };


    } catch (error) {
      const typedError = error as Error
      alert("Error joining lobby: " +  typedError.message);
    }
  }
</script>

<div class="lobby-container">
  <Doc ref={`lobby/${lobbyID}`} let:data={activeLobby} let:ref={lobbyRef}>
    <div class="users-container">
        {#if lobbyRef}
          <h1>Users in lobby:</h1>
          <ListGroup>
            {#each activeLobby.listOfUsers as joinedUser}
              <Doc ref={`user/${joinedUser}`} let:data={listedUser}>
                <ListGroupItem>{listedUser.username}</ListGroupItem>
              </Doc>
            {/each}
          </ListGroup>
        {:else}
          <p>No lobby selected</p>
        {/if}
    </div>
    <div class="settings-container">
      <h1>Settings:</h1>
      <FormGroup>
        <Label for="gameModes">Game modes:</Label>
        <Input type="select" name="gameModes" id="gameModes" bind:value={selectedMode} disabled={activeLobby.listOfUsers[0] === loggedInUser.uid ? false: true}>
          {#each gameModes as mode}
            <option value={mode}>{mode}</option>
          {/each}
        </Input>
      </FormGroup>
      {#if activeLobby.listOfUsers[0] === loggedInUser.uid}
        <p>Select quiz question stacks:</p>
        <Collection ref={'stack'} let:data>
          <ListGroup>
            {#each data as stack}
              <ListGroupItem>
                <Label>
                  <input type="checkbox" value={stack.name} bind:group={selectedStacks} disabled={activeLobby.listOfUsers[0] === loggedInUser.uid ? false: true}/>
                  {stack.name}
                </Label>
              </ListGroupItem>
            {/each}
          </ListGroup>
        <Button class="start-game-button" color="primary" on:click={() => saveSettings()} disabled={activeLobby.listOfUsers[0] === loggedInUser.uid ? false: true}>Save Settings</Button>
        </Collection>
      {:else}
        <p>These Question Stacks are currently selected by the lobby owner:</p>
        <ListGroup>
          {#each activeLobby.questionStacks as qStack}
            <ListGroupItem>{qStack}</ListGroupItem>
          {/each}
        </ListGroup>
      {/if}
    </div>
  </Doc>
</div>
