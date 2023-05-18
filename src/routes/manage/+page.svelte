<script lang="ts">
  import { user } from 'sveltefire/auth';
  import { collection, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
  import { db } from '$lib/firebase/firebase';
  import { onMount } from 'svelte';

  let userId = 'USER_ID';

  let question = '';
  let options = ['', '', '', ''];
  let correctAnswer = 0;
  let editingQuestion = null;

  async function createQuizQuestion() {
    const quizQuestionData = {
      question,
      options,
      correctAnswer,
    };

    try {
      if (editingQuestion) {
        // Update existing question
        const questionRef = doc(db, 'QuizQuestions', editingQuestion.id);
        await updateDoc(questionRef, quizQuestionData);
        console.log('Quiz question updated with ID:', editingQuestion.id);
        editingQuestion = null;
      } else {
        // Create new question
        const docRef = await addDoc(collection(db, 'QuizQuestions'), quizQuestionData);
        console.log('Quiz question created with ID:', docRef.id);
      }
      resetForm();
    } catch (error) {
      console.error('Error creating/updating quiz question:', error);
    }
  }

  async function deleteQuizQuestion(questionId) {
    try {
      const questionRef = doc(db, 'QuizQuestions', questionId);
      await deleteDoc(questionRef);
      console.log('Quiz question deleted with ID:', questionId);
    } catch (error) {
      console.error('Error deleting quiz question:', error);
    }
  }

  function editQuizQuestion(question) {
    editingQuestion = { ...question };
    question = editingQuestion.question;
    options = editingQuestion.options;
    correctAnswer = editingQuestion.correctAnswer;
  }

  function resetForm() {
    question = '';
    options = ['', '', '', ''];
    correctAnswer = 0;
    editingQuestion = null;
  }

</script>

<html lang="en">
  <body>
    <div class="container-background">
      <div class="card text-black ">
        <div class="card-header">
          <h1>Quiz Questions</h1>
        </div>
        <p class="card-text">Create, Edit, and Delete your own Quiz Questions.</p>
        {#if $user !== null}
          <main>
            <h1>Create and Edit your own Quiz Questions</h1>

            <form on:submit|preventDefault="{createQuizQuestion}">
              <formGroup>
                <label for="question">Question:</label>
                <input type="text" id="question" bind:value="{question}" />
              </formGroup>

              {#each options as option, index}
                <formGroup>
                  <label for="{`option${index}`}">Option {index + 1}:</label>
                  <input type="text" id="{`option${index}`}" bind:value="{options[index]}" />
                </formGroup>
              {/each}

              <formGroup>
                <label for="correctAnswer">Correct Answer:</label>
                <input type="number" id="correctAnswer" bind:value="{correctAnswer}" />
              </formGroup>

              {#if editingQuestion}
                <button type="submit" color="primary">Update Quiz Question</button>
                <button on:click="{() => resetForm()}" color="secondary">Cancel</button>
              {:else}
                <button type="submit" color="primary">Create Quiz Question</button>
              {/if}
            </form>
          </main>
        {:else}
          <p>Please log in to create your own quiz questions.</p>
        {/if}
      </div>
    </div>
  </body>
</html>
