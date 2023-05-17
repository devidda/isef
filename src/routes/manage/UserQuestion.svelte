<!-- UserQuestions.svelte -->
<script>
    import { onMount } from 'svelte';
    import { collection, query, where, getDocs } from 'firebase/firestore';
    import { db } from '$lib/firebase/firebase';
    import { navigate} from 'svelte-routing'; // unsure about the need of ths

    // here we would need to make it so the logged in user can see only his questions 
    let userId = 'USER_ID'; 
    
    let userQuestions = [];
  
    onMount(async () => {
      const q = query(collection(db, 'QuizQuestions'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      userQuestions = querySnapshot.docs.map(doc => doc.data());
    });

    async function deleteQuestion(questionId) {
    try {
      await deleteDoc(doc(db, 'QuizQuestions', questionId));
      userQuestions = userQuestions.filter(question => question.id !== questionId);
    } catch (error) {
      console.error('Error deleting question:', error);
    }
    }

    function editQuestion(questionId) {
      navigate(`/create-your-own-question/${questionId}`);
    }
  </script>
  
  <main>
    <h1>User Questions</h1>
  
    <ul>
      {#each userQuestions as question}
        <li>
          <h3>{question.question}</h3>
          <p>Options:</p>
          <ul>
            {#each question.options as option}
              <li>{option}</li>
            {/each}
          </ul>
          <p>Correct Answer: {question.correctAnswer}</p>
          <button on:click={() => editQuestion(question.id)}>Edit</button>
          <button on:click={() => deleteQuestion(question.id)}>Delete</button>
        </li>
      {/each}
    </ul>
  </main>
  