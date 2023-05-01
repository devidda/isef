<script lang="ts">
  import { query, collection, where } from 'firebase/firestore';
  import { Button, ListGroup, ListGroupItem, FormGroup, Label, Input } from 'sveltestrap';
  import type { user, lobby } from '$lib/utils/db.d'
  import { auth, db } from '$lib/firebase/firebase'
  import { Doc, Collection, FirebaseApp } from 'sveltefire';
	import { derived, writable } from 'svelte/store';

  const gameModes: string[] = ['Singleplayer', 'Team Coop', 'Team Versus'];
  let selectedMode: string = gameModes[0];
  let selectedStacks = writable<string[]>([]);
  let lobbyID = '';

  const selectedStacksAsString = derived(selectedStacks, $selectedStacks => $selectedStacks.join(', '));

  const joinLobby = (selectedLobby: any) => {
    lobbyID = selectedLobby.id;
  };
</script>

<FirebaseApp auth={auth} firestore={db}>
  {#if !lobbyID}
    <div class="pre-lobby-container">
      <Button class="create-lobby-button" color="primary" on:click={() => console.log("Create Lobby button clicked")}>Create own game</Button>
      <Collection ref={'lobby'} let:data={allLobbies} let:count={lobbyCount}>
        <p>There {lobbyCount === 1 ? 'is' : 'are'} {lobbyCount} {lobbyCount === 1 ? 'lobby' : 'lobbies'} available. Click to select:</p>
        <ListGroup>
          {#each allLobbies as lobby}
            <Collection ref={`lobby/${lobby}/listOfUsers`} let:count={lobbyPlayerCount}>
              <ListGroupItem on:click={() => joinLobby(lobby)}>
                {lobby.id}
                Game Mode: {lobby.gameMode}
                Player Count: {lobbyPlayerCount}
              </ListGroupItem>
            </Collection>
          {/each}
        </ListGroup>
      </Collection>
    </div>
  {:else}
    <div class="lobby-container">
      <Doc ref={`lobby/${lobbyID}`} let:data={activeLobby} let:ref={lobbyRef}>
        <div class="users-container">
          <Collection ref={lobbyRef?.path + '/listOfUsers'} let:data={users} let:ref={usersRef}>
            {#if lobbyRef}
              <h1>Users in lobby:</h1>
              <ListGroup>
                {#each users as user}
                  <ListGroupItem>{user}</ListGroupItem>
                {/each}
              </ListGroup>
            {:else}
              <p>No lobby selected</p>
            {/if}
          </Collection>
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
</FirebaseApp>

