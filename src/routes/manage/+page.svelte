<script lang="ts">
  import { goto } from "$app/navigation";
  import { auth, db } from "$lib/firebase/firebase";
  import { userStore } from 'sveltefire';
  import { collection, addDoc, doc, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';
  //import MyQuestions from '.QuizList.svelte';
  //import { redirectQuizList } from './redirect.ts';
  // Import Sveltestrap components
  import { Button, FormGroup, Label, Input } from 'sveltestrap';
  import "$lib/main.css";
  import type { quiz } from "$lib/utils/db.d.ts";

  function redirectLogin(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement; }): any {
    goto("/login")
	}

  /*function redirectQuizList(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement; }): any {
    goto("/QuizList")
	} */

  let showMyQuestions = false;

  function toggleShowMyQuestions() {
    showMyQuestions = !showMyQuestions;
  }
  
  const user = userStore(auth);
  // Use the defined question type
  let quizQuestion : quiz = { correctAnswer:'', difficulty:'', lastModified:Timestamp.now(), listOfFalseAnswers:['','',''], question:'', tags:[''], id:''};
  let editingQuestion: quiz | null = null;
  
  async function createQuizQuestion() {
    quizQuestion.lastModified = Timestamp.now();
    try {
      if (editingQuestion) {
        // Update existing question
        const questionRef = doc(db, 'quiz', editingQuestion.id);
        await updateDoc(questionRef, {
          'correctAnwser': quizQuestion.correctAnswer,
          'difficulty': quizQuestion.difficulty,
          'lastModified': quizQuestion.lastModified,
          'listOfFalseAnswers': quizQuestion.listOfFalseAnswers,
          'question': quizQuestion.question,
          'tags': quizQuestion.tags
        });
        console.log('Quiz question updated with ID:', editingQuestion.id);
        editingQuestion = null;
      } else {
        // Create new question
        console.log('Question:', quizQuestion.question);
        console.log('listOfFalseAnswers:', quizQuestion.listOfFalseAnswers);
        const docRef = await addDoc(collection(db, 'quiz'), {
          'correctAnwser': quizQuestion.correctAnswer,
          'difficulty': quizQuestion.difficulty,
          'lastModified': quizQuestion.lastModified,
          'listOfFalseAnswers': quizQuestion.listOfFalseAnswers,
          'question': quizQuestion.question,
          'tags': quizQuestion.tags
        });
        console.log('Quiz question created with ID:', docRef.id);
      }
      resetForm();
    } catch (error) {
      console.error('Error creating/updating quiz question:', error);
    }
  }

  async function deleteQuizQuestion(questionId: string) {
    try {
      const questionRef = doc(db, 'quiz', questionId);
      await deleteDoc(questionRef);
      console.log('Quiz question deleted with ID:', questionId);
    } catch (error) {
      console.error('Error deleting quiz question:', error);
    }
  }

  function editQuizQuestion(question: string) {
    editingQuestion = { ...question };
    quizQuestion.question = editingQuestion.question;
    quizQuestion.listOfFalseAnswers = editingQuestion.options;
    quizQuestion.correctAnswer = editingQuestion.correctAnswer;
  } 

  function resetForm() {
    quizQuestion.question = '';
    quizQuestion.listOfFalseAnswers = ['', '', ''];
    quizQuestion.correctAnswer = '';
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
            <p>Logged in as: {$user.uid}</p>
            <p>With: {$user.email}</p>
        {:else}
            <p>Not logged in</p>
            <button class="btn btn-light" on:click={redirectLogin}>Let me in! 🚀</button>
        {/if}

        {#if $user !== null}
          <main>
            <h3>Create and Edit your own Quiz Questions</h3>

            <form on:submit|preventDefault="{createQuizQuestion}">
              <FormGroup>
                <Label for="question">Question:</Label>
                <Input type="text" id="question" bind:value="{quizQuestion.question}" />
              </FormGroup>

              <FormGroup>
                <Label for="correctAnswer">Correct Answer:</Label>
                <Input type="text" id="correctAnswer" bind:value="{quizQuestion.correctAnswer}" />
              </FormGroup>

              {#each quizQuestion.listOfFalseAnswers as option, index}
                <FormGroup>
                  <Label for="{`option${index}`}">False Answer {index + 1}:</Label>
                  <Input type="text" id="{`option${index}`}" bind:value="{quizQuestion.listOfFalseAnswers[index]}" />
                </FormGroup>
              {/each}


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

        <!-- <button class="btn btn-light" on:click={redirectQuizList}>My Quiz Questions</button> -->
        <!--
          
        <button on:click={toggleShowMyQuestions}>My Questions</button>

        
        {#if showMyQuestions}
          <MyQuestions />
        {:else}
          
          <p>This is the default page content.</p>
        {/if}-->
      </div>
    </div>
  </body>
</html>
