// redirect.ts

// Import the `goto` function from Svelte Router
import { goto } from '$app/navigation';
import QuizList from './QuizList.svelte';
import { router } from '$app/navigation';

// Define the `/QuizList` route
router.add('/QuizList', QuizList);

// Define the `redirectQuizList` function
function redirectQuizList() {
  // Use the `goto` function to navigate to the `/QuizList` route
  goto('/QuizList');
}

export { redirectQuizList };

