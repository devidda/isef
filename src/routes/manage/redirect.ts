// redirect.ts

// Import the `goto` function from Svelte Router
import { goto } from '$app/navigation';

function redirectQuizList() {
  // Use the `goto` function to navigate to the QuizList route
  goto('/QuizList');
}

export { redirectQuizList };
