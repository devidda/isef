<script lang="ts">
  import { auth, db } from "$lib/firebase/firebase";
  import { userStore } from 'sveltefire';
  import { collection, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
  //import MyQuestions from '.MyQuestions.svelte';
  // Import Sveltestrap components
  import { Button, FormGroup, Label, Input } from 'sveltestrap';

  let showMyQuestions = false;

  function toggleShowMyQuestions() {
    showMyQuestions = !showMyQuestions;
  }
  
    // Define the Question type
    type Question = {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    };

  const user = userStore(auth);
   
  let question = '';
  let options = ['', '', '', ''];
  let correctAnswer = 0;
  let editingQuestion: Question | null = null; 


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
            <p>Logged in as: {$user.usid}</p>
            <p>With: {$user.email}</p>
        {:else}
            <p>Not logged in</p>
        {/if}

        {#if $user !== null}
          <main>
            <h3>Create and Edit your own Quiz Questions</h3>

            <form on:submit|preventDefault="{createQuizQuestion}">
              <FormGroup>
                <Label for="question">Question:</Label>
                <Input type="text" id="question" bind:value="{question}" />
              </FormGroup>

              {#each options as option, index}
                <FormGroup>
                  <Label for="{`option${index}`}">Option {index + 1}:</Label>
                  <Input type="text" id="{`option${index}`}" bind:value="{options[index]}" />
                </FormGroup>
              {/each}

              <FormGroup>
                <Label for="correctAnswer">Declare the Correct Answer:</Label>
                <Input type="number" id="correctAnswer" bind:value="{correctAnswer}" />
              </FormGroup>

              {#if editingQuestion}
                <Button type="submit" color="primary">Update Quiz Question</Button>
                <Button on:click="{() => resetForm()}" color="secondary">Cancel</Button>
              {:else} 
                <Button type="submit" color="primary">Create Quiz Question</Button>
              {/if} 
            </form>
          </main>
        {:else}
          <p>Please log in to create your own quiz questions.</p>
        {/if}

        <!-- Toggle the display of the "My Questions" page -->
        <button on:click={toggleShowMyQuestions}>My Questions</button>

        <!-- Conditional rendering of "My Questions" page or default content -->
        {#if showMyQuestions}
          <MyQuestions />
        {:else}
          <!-- Add the default page content here -->
          <p>This is the default page content.</p>
        {/if}
      </div>
    </div>
  </body>
</html>
