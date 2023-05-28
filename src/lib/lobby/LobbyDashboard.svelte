<script lang="ts">
  import { Button, ListGroup, ListGroupItem, FormGroup, Label, Input } from 'sveltestrap';
  import { Doc, Collection } from 'sveltefire';
  import { saveLobbySettings } from '../../routes/api/saveLobbySettings/saveLobbySettings';

  export let lobbyID: string;
  export let loggedInUser: any;
  export let selectedStacks: string[];

  const gameModes: string[] = ['SOLO', 'COOP', 'VERSUS'];
  let selectedMode: string = gameModes[0];
  let timeLimit = 15;


  async function saveSettings(): Promise<void> {
    try {
      const success = await saveLobbySettings(selectedMode, selectedStacks, lobbyID, timeLimit);
      if (success) {
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
      {#if activeLobby.listOfUsers[0] === loggedInUser.uid}
        <FormGroup>
          <Label for="gameModes">Select Game Mode (Versus-mode currently not implemented):</Label>
          <Input type="select" name="gameModes" id="gameModes" bind:value={selectedMode} disabled={activeLobby.listOfUsers[0] === loggedInUser.uid ? false: true}>
            {#each gameModes as mode}
              <option value={mode}>{mode}</option>
            {/each}
          </Input>
        </FormGroup>
      {:else}
        <FormGroup>
          <Label for="gameModeSelected">Selected Game Mode by Lobby Owner:</Label>
          <div>
            <Button id="gameModeSelected" disabled={true}>{activeLobby.gameMode}</Button>
          </div>
        </FormGroup>
      {/if}
      {#if activeLobby.listOfUsers[0] === loggedInUser.uid}
        <p>Enter time limit per question between 6 and 30 seconds:</p>
        <Input type="number" bind:value={timeLimit} min=6 max=30/>
        <p>Select quiz question stacks:</p>
        <Collection ref={'stack'} let:data>
          <ListGroup>
            {#each data as stack}
              <ListGroupItem>
                <Label>
                  <input type="checkbox" value={stack.id} bind:group={selectedStacks} disabled={activeLobby.listOfUsers[0] === loggedInUser.uid ? false: true}/>
                  {stack.name}
                </Label>
              </ListGroupItem>
            {/each}
          </ListGroup>
        <Button class="start-game-button" color="primary" on:click={() => saveSettings()} disabled={activeLobby.listOfUsers[0] === loggedInUser.uid ? false: true}>Save Settings</Button>
        </Collection>
      {:else}
        <FormGroup>
          <Label for="timeLimitSelected">Time limit per question selected by Lobby Owner:</Label>
          <div>
            <Button id="timeLimitSelected" disabled={true}>{activeLobby.timeLimit}</Button>
          </div>
        </FormGroup>
        <p>These Question Stacks are currently selected by the lobby owner:</p>
        <ListGroup>
          {#each activeLobby.questionStacks as qStack}
            <Doc ref={`stack/${qStack}`} let:data={stackData}>
            <ListGroupItem>{stackData.name}</ListGroupItem>
            </Doc>
          {/each}
        </ListGroup>
        {#if activeLobby.questionStacks.length === 0}
          <ListGroupItem>Nothing selected yet.</ListGroupItem>
        {/if}
      {/if}
    </div>
  </Doc>
</div>
