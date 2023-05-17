<!-- I tried seeing how the delete and edit of a use could be added but yeah because I'm doing sth wrong with the firestore its not working-->
<script lang="ts">
    import { Button, FormGroup, Label, Input } from 'sveltestrap';
    import { collection, addDoc, doc, delete Doc, updateDoc } from 'firebase/firestore';
    import { db } from '$lib/firebase/firebase';
  
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
     
      /*
      try {
        const docRef = await addDoc(collection(db, 'QuizQuestions'), quizQuestionData);
        console.log('Quiz question got created with ID: ', docRef.id);
        
      } catch (error) {
        console.error('Error while creating a quiz question: ', error);
        
      } 
    }*/
</script>
  
<main>
    <h1>Create and Edit your own Quiz Questions</h1>
  
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
        <Label for="correctAnswer">Correct Answer:</Label>
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
  
  <!-- we got a style sheet and bootstrap so this might not be needed -->
<style>
    
</style>
  