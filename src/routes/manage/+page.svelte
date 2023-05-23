<script lang="ts">
	import { goto } from '$app/navigation';
	import { auth, db } from '$lib/firebase/firebase';
	import { userStore, collectionStore } from 'sveltefire';
	import { collection, getCountFromServer, addDoc, doc, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';
	import { Button, FormGroup, Label, Input } from 'sveltestrap';
	import '$lib/main.css';
	import type { quiz } from '$lib/utils/db.d.ts';

	function redirectLogin(
		event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
	): any {
		goto('/login');
	}

	let showMyQuestions = false;
	let editField: any;

	function toggleShowMyQuestions() {
		showMyQuestions = !showMyQuestions;
	}
	const existingQuizQuestions = collectionStore<quiz>(db, 'quiz');
	const existingQuizQuestionsForSize = collection(db, 'quiz');
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

	async function initializeEditField() {
		editField = [];
		let countData = await getCountFromServer(existingQuizQuestionsForSize);
		let size = countData.data().count;
		for (let i = 0; i < size; i++) {
			editField.push(false);
		}
	}

	initializeEditField();

	function helperfunction() {}
	async function createQuizQuestion() {
		quizQuestion.lastModified = Timestamp.now();
		try {
			if (editingQuestion) {
				// Update existing question
				const questionRef = doc(db, 'quiz', editingQuestion.id);
				await updateDoc(questionRef, {
					correctAnswer: quizQuestion.correctAnswer,
					difficulty: quizQuestion.difficulty,
					lastModified: quizQuestion.lastModified,
					listOfFalseAnswers: quizQuestion.listOfFalseAnswers,
					question: quizQuestion.question,
					tags: quizQuestion.tags
				});
				console.log('Quiz question updated with ID:', editingQuestion.id);
				editingQuestion = null;
			} else {
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
					<h1>Edit and delete your own Quiz Questions</h1>
				</div>
				{#if $user !== null}
					<!--<p>Logged in as: {$user.uid}</p>
            <p>With: {$user.email}</p>-->
				{:else}
					<p>Not logged in</p>
					<button class="btn btn-light" on:click={redirectLogin}>Let me in! 🚀</button>
				{/if}

				{#if $user !== null}
					<main>
						<h3>Please select the question that you want to edit or delete</h3>
						<br />
						{#each $existingQuizQuestions as quizQuestion, index}
							{#if quizQuestion.creatorID === $user.uid}
								<p>
									<Button color="danger" on:click={() => deleteQuizQuestion(quizQuestion.id)} >Delete</Button>
									<Button color="primary" on:click={() => (editField[index] = !editField[index])}>Edit</Button>
									{quizQuestion.question}
								</p>
								{#if editField[index]}

                <form on:submit|preventDefault={createQuizQuestion}>
                  <FormGroup>
                    <Label for="question">Questionl:</Label>
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
                    <Button type="submit" color="primary">Update Quiz Question</Button>
                </form>
								{/if}
							{/if}
						{/each}
					</main>
				{:else}
					<p>Please log in to create your own quiz questions.</p>
				{/if}
			</div>
		</div>
	</body>
</html>
