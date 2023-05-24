<script lang="ts">
	import { goto } from '$app/navigation';
	import { auth, db } from '$lib/firebase/firebase';
	import { userStore } from 'sveltefire';
	import { collection, addDoc, doc, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';
	import { Button, FormGroup, Label, Input } from 'sveltestrap';
	import '$lib/main.css';
	import type { quiz } from '$lib/utils/db.d.ts';

	function redirectLogin(
		event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
	): any {
		goto('/login');
	}

	const user = userStore(auth);
	let quizQuestion: quiz = {
		correctAnswer: '',
		difficulty: '',
		lastModified: Timestamp.now(),
		listOfFalseAnswers: ['', '', ''],
		question: '',
		tags: [''],
		id: '',
		creatorID: ''
	};
	let editingQuestion: quiz | null = null;

	async function createQuizQuestion() {
		quizQuestion.lastModified = Timestamp.now();
		try {
			// Create new question
			if ($user !== null) {
				console.log('Question:', quizQuestion.question);
				console.log('listOfFalseAnswers:', quizQuestion.listOfFalseAnswers);
				const docRef = await addDoc(collection(db, 'quiz'), {
					correctAnswer: quizQuestion.correctAnswer,
					difficulty: quizQuestion.difficulty,
					lastModified: quizQuestion.lastModified,
					listOfFalseAnswers: quizQuestion.listOfFalseAnswers,
					question: quizQuestion.question,
					tags: quizQuestion.tags,
					creatorID: $user.uid
				});
				console.log('Quiz question created with ID:', docRef.id);
			}
			resetForm();
		} catch (error) {
			console.error('Error creating/updating quiz question:', error);
		}
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
			<div class="card text-black">
				<div class="card-header">
					<h1>Quiz Questions</h1>
				</div>
				{#if $user !== null}
					<main>
						<h3>Create your own Quiz Questions</h3>

						<form on:submit|preventDefault={createQuizQuestion}>
							<FormGroup>
								<Label for="question">Question:</Label>
								<Input type="text" id="question" bind:value={quizQuestion.question} />
							</FormGroup>

							<FormGroup>
								<Label for="correctAnswer">Correct Answer:</Label>
								<Input type="text" id="correctAnswer" bind:value={quizQuestion.correctAnswer} />
							</FormGroup>

							{#each quizQuestion.listOfFalseAnswers as option, index}
								<FormGroup>
									<Label for={`option${index}`}>False Answer {index + 1}:</Label>
									<Input
										type="text"
										id={`option${index}`}
										bind:value={quizQuestion.listOfFalseAnswers[index]}
									/>
								</FormGroup>
							{/each}
							<Button type="submit" color="primary">Create Quiz Question</Button>
						</form>
					</main>
				{:else}
					<p>Not logged in</p>
					<p>Please log in to create your own quiz questions.</p>
					<button class="btn btn-light" on:click={redirectLogin}>Let me in! 🚀</button>
				{/if}
			</div>
		</div>
	</body>
</html>
