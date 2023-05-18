<script lang="ts">
    import { onMount } from 'svelte';
    import { db } from '$lib/firebase/firebase';
    import { collection, getDocs } from 'firebase/firestore';
  
    let questions = [];
     
    

    onMount(async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'QuizQuestions'));
        questions = querySnapshot.docs.map((doc) => doc.data());
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    });
  </script>
  
  <h1>My Questions Page</h1>
  <!-- Add your markup and logic to display the user's questions here -->
  <!--{#if questions.length > 0}
    <ul>
      {#each questions as question}
        <li>{question.question}</li>
      {/each}
    </ul>
  {:else}
    <p>No questions found.</p>
  {/if} -->
  