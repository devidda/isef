<script lang="ts">
  import { Collection, Doc } from 'sveltefire';
	import type { User } from 'sveltefire';
  import { Button, ListGroup, ListGroupItem, FormGroup, Label, Input } from 'sveltestrap';
  export let loggedInUser: any;
  export let currentlyLeavingLobby: boolean;
  export let lobbyID: string;
  export let selectedStacks: string[] = [];

  async function joinLobby(uid: string, selectedLobbyID: string): Promise<void> {
    try {
      // call server function to add user to Firestore
      const response = await fetch('/api/joinOthersLobby', {
          method: 'POST',
          body: JSON.stringify({ uid, selectedLobbyID }),
          headers: {
              'content-type': 'application/json'
          }
      });
      const success = await response.json();

      if (response.ok && success) {
        lobbyID = selectedLobbyID;
        selectedStacks = [];
      };

    } catch (error) {
      const typedError = error as Error
      alert("Error joining lobby: " +  typedError.message);
    }
  };

  function rejoinLobby(lobbyToRejoinID: string):void {
    lobbyID = lobbyToRejoinID;
  }

  async function createOwnLobby(uid: string): Promise<void> {
    try {
      // call server function to add user to Firestore
      const response = await fetch('/api/createLobby', {
          method: 'POST',
          body: JSON.stringify(uid),
          headers: {
              'content-type': 'application/json'
          }
      }); const success = await response.json(); 
      if (response.ok && success) {
        lobbyID = uid;
        selectedStacks = [];
      }
    } catch (error) {
      const typedError = error as Error
      alert("Error setting up lobby: " +  typedError.message);
    }
  }

</script>

<div class="pre-lobby-container">
  <Button class="create-lobby-button" color="primary" on:click={() => createOwnLobby(loggedInUser.uid)}>Create own game</Button>
  <Collection ref={'lobby'} let:data={allLobbies} let:count={lobbyCount}>
    <p>There {lobbyCount === 1 ? 'is' : 'are'} {lobbyCount} {lobbyCount === 1 ? 'lobby' : 'lobbies'} available. Click to select:</p>
    <ListGroup>
      {#if !currentlyLeavingLobby}
        {#each allLobbies as lobby}
          {#if (lobby.listOfUsers.indexOf(loggedInUser.uid) > -1)}
            {void rejoinLobby(lobby.id) ?? ""}
          {/if}
          <ListGroupItem on:click={() => joinLobby(loggedInUser.uid, lobby.id)}>
            <Doc ref={`user/${lobby.id}`} let:data={lobbyCreator}>
              {lobbyCreator.username}'s lobby: 
            </Doc>
            Mode: {lobby.gameMode}, 
            Player Count: {lobby.listOfUsers.length}
          </ListGroupItem>
        {/each}
      {/if}
    </ListGroup>
  </Collection>
</div>
