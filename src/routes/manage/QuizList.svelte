<script>
    import { onMount } from 'svelte';
    import CreateQuizQuestion from './CreateQuizQuestion.svelte'; 
    import { collection, addDoc } from 'firebase/firestore';
    import { db } from '$lib/firebase/firebase';
    
    let quizQuestions = [];
    
    // I dont fully get how I need to do this. I know this is so you can fetch the question from Firestore but yeah...
    onMount(async () => {
     
      // code doesnt work I#m doing sth wrong there
      const querySnapshot = await getDocs(collection(db, 'QuizQuestions'));
      quizQuestions = querySnapshot.docs.map(doc => doc.data());
    
    });
    
    /* I dont know if we need this but it should show the quiz question when it got succesfully transfered to the firestore (after clicking the button)*/
    async function fetchQuizQuestions() {
    const querySnapshot = await getDocs(collection(db, 'QuizQuestions'));
    quizQuestions = querySnapshot.docs.map(doc => doc.data());
     };

    async function addQuizQuestion(question, options, correctAnswer) {
      const quizQuestionData = {
        question,
        options,
        correctAnswer,
      };
  

      // this can be used to add the new questions to the firestore but yeah same problem
      try {
      const docRef = await addDoc(collection(db, 'QuizQuestions'), quizQuestionData);
      console.log('Quiz question created with ID: ', docRef.id);
      quizQuestions = [...quizQuestions, quizQuestionData];
      } catch (error) {
      console.error('Error creating quiz question: ', error);
      }
    }
  </script>
  
  <main>
    <h1>Quiz Questions</h1>
  
    <ul>
      {#each quizQuestions as question}
        <li>
          <h3>{question.question}</h3>
          <p>Options:</p>
          <ul>
            {#each question.options as option}
              <li>{option}</li>
            {/each}
          </ul>
          <p>Correct Answer: {question.correctAnswer}</p>
        </li>
      {/each}
    </ul>
  
    <h2>Add New Quiz Question</h2>
  
    <CreateQuizQuestion on:createQuizQuestion="{addQuizQuestion}" />
    <!-- Button that should transfer the questions to firestore-->
    <button on:click="{() => createQuizQuestion()}">Add to Firestore</button>
  </main>
   
  <!--included but not used -->
  <style>
  </style>
  