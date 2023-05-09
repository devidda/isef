<script lang="ts">
  import { query, collection, where } from 'firebase/firestore';
  import { Button, ListGroup, ListGroupItem, FormGroup, Label, Input } from 'sveltestrap';
  import type { user, lobby } from '$lib/utils/db.d'
  import { auth, db } from '$lib/firebase/firebase'
  import { Doc, Collection, FirebaseApp, User } from 'sveltefire';
	import { derived, writable } from 'svelte/store';

  const gameModes: string[] = ['Singleplayer', 'Team Coop', 'Team Versus'];
  let selectedMode: string = gameModes[0];
  let selectedStacks = writable<string[]>([]);
  let lobbyID = '';

  const selectedStacksAsString = derived(selectedStacks, $selectedStacks => $selectedStacks.join(', '));

  const joinLobby = (selectedLobbyID: string) => {
    lobbyID = selectedLobbyID;
  };

  async function createOwnLobby(uid: string): Promise<void> {
    try {
      // call server function to add user to Firestore
      const response = await fetch('/api/createLobby', {
          method: 'POST',
          body: JSON.stringify(uid),
          headers: {
              'content-type': 'application/json'
          }
      });
      const success = await response.json();

      if (response.ok && success) {
        joinLobby(uid)
      }
    } catch (error) {
      const typedError = error as Error
      alert("Error setting up lobby: " +  typedError.message);
    }
  }
</script>

<FirebaseApp auth={auth} firestore={db}>
<User let:user={loggedInUser}>
  {#if !lobbyID}
    <div class="pre-lobby-container">
      <Button class="create-lobby-button" color="primary" on:click={() => createOwnLobby(loggedInUser.uid)}>Create own game</Button>
      <Collection ref={'lobby'} let:data={allLobbies} let:count={lobbyCount}>
        <p>There {lobbyCount === 1 ? 'is' : 'are'} {lobbyCount} {lobbyCount === 1 ? 'lobby' : 'lobbies'} available. Click to select:</p>
        <ListGroup>
          {#each allLobbies as lobby}
              <ListGroupItem on:click={() => joinLobby(lobby.id)}>
                {lobby.id}
                Game Mode: {lobby.gameMode}
                Player Count: {lobby.listOfUsers.length}
              </ListGroupItem>
          {/each}
        </ListGroup>
      </Collection>
    </div>
  {:else}
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
            <Input type="select" name="gameModes" id="gameModes" bind:value={selectedMode}>
              {#each gameModes as mode}
                <option value={mode}>{mode}</option>
              {/each}
            </Input>
          </FormGroup>
          <p>Select quiz question stacks:</p>
          <Collection ref={'stack'} let:data>
            <ListGroup>
              {#each data as stack}
                <ListGroupItem>
                  <Label>
                    <Input type="checkbox" value={stack.name} bind:group={$selectedStacks} />
                    {stack.name}
                  </Label>
                </ListGroupItem>
              {/each}
            </ListGroup>
          </Collection>
        </div>
      </Doc>
    </div>
    <Button class="start-game-button" color="primary" on:click={() => console.log("Start game button clicked")}>Start game</Button>
  {/if}
</User>
</FirebaseApp>

