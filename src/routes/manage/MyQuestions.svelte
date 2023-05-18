<script lang="ts">
    import { onMount } from 'svelte';
  
    onMount(() => {
      // Add your Firestore query or logic here to fetch and display the user's questions
      // You can use the "db" variable imported from "$lib/firebase/firebase" to access Firestore
      // Example:
      // const querySnapshot = await getDocs(collection(db, 'QuizQuestions'));
      // const questions = querySnapshot.docs.map((doc) => doc.data());
      // console.log(questions);
    });
  </script>
  
  <h1>My Questions Page</h1>
  <!-- Add your markup and logic to display the user's questions here -->
  