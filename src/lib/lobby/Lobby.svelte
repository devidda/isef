<script lang="ts">
  import { Button } from 'sveltestrap';
  import { auth, db } from '$lib/firebase/firebase'
  import { Doc, FirebaseApp, User } from 'sveltefire';
	import PreLobby from './PreLobby.svelte';
	import LobbyDashboard from './LobbyDashboard.svelte';
	import Game from '$lib/game/Game.svelte';

  let gameInProgress = false;
  let selectedStacks: string[] = [];

  // the lobbyID variable affects if a lobby-menu or a list of available lobbies is displayed
  let lobbyID = "";
  let currentlyLeavingLobby = false;

	async function leaveLobby(uid: string): Promise<void> {
    try {
      // hacky solution to disable instant rejoining of lobby due to 
      // the delay between the api-call and the acutally deleted lobby.
      // Setting currentlyLeavingLobby = true will stop the svelte stores from fetching data.
      currentlyLeavingLobby = true;
      const lobbyToLeaveID = lobbyID;

      // call server function to add user to Firestore
      const response = await fetch('/api/leaveLobby', {
          method: 'POST',
          body: JSON.stringify({ uid, lobbyToLeaveID }),
          headers: {
              'content-type': 'application/json'
          }
      });
      const success = await response.json();

      if (response.ok && success) {
        lobbyID = "";
        setTimeout(() => {currentlyLeavingLobby = false}, 1000)
        console.log('Left the lobby.');
      }
    } catch (error) {
      const typedError = error as Error
      alert("Error leaving lobby: " +  typedError.message);
    }
	}


	async function startGame(qStacks: string[]): Promise<void> {
    try {
      if (!qStacks) {
        alert('No Question-Stacks found in Lobby Settings. \n' +
          'Make sure to click "Save Settings" after selecting the stacks!');
        return;
      }

      // call server function to add user to Firestore
      const response = await fetch('/api/startGame', {
          method: 'POST',
          body: JSON.stringify(lobbyID),
          headers: {
              'content-type': 'application/json'
          }
      });
      const success = await response.json();

      if (! (response.ok && success)) {
        throw new Error('Error starting game.')
      }

      gameInProgress  = true;

    } catch (error) {
      const typedError = error as Error
      alert("Error setting up lobby: " +  typedError.message);
    }
	}
</script>

<FirebaseApp auth={auth} firestore={db}>
  <User let:user={loggedInUser}>
    {#if currentlyLeavingLobby}
      Leaving lobby...
    {:else}
      {#if lobbyID}
        {#if gameInProgress}
          <Game bind:lobbyID={lobbyID} user={loggedInUser} bind:gameInProgress={gameInProgress} />
        {:else}
          <LobbyDashboard bind:lobbyID={lobbyID} loggedInUser={loggedInUser} bind:selectedStacks={selectedStacks} />
            <Doc ref={`lobby/${lobbyID}`} let:data={lobbyData}>
              <Button class="start-game-button" color="primary" on:click={() => startGame(lobbyData.questionStacks)} disabled={(lobbyData.listOfUsers[0] === loggedInUser.uid) ? false : true}>Start Game</Button>
            </Doc>
          <Button class="leave-game-button" color="primary" on:click={() => leaveLobby(loggedInUser.uid)}>Leave Lobby</Button>
        {/if}
      {:else}
        <PreLobby loggedInUser={loggedInUser} bind:lobbyID={lobbyID} currentlyLeavingLobby={currentlyLeavingLobby} />
      {/if}
    {/if}
  </User>
</FirebaseApp>