<script lang="ts">
	import { goto } from '$app/navigation';
	import { auth, db } from '$lib/firebase/firebase';
	import { userStore, collectionStore } from 'sveltefire';
	import {
		collection,
		getCountFromServer,
		doc,
		deleteDoc,
		updateDoc,
		Timestamp,
		query,
		where,
		getDocs
	} from 'firebase/firestore';
	import { Button, FormGroup, Label, Input } from 'sveltestrap';
	import type { quiz, stack } from '$lib/utils/db.d.ts';
	import '$lib/main.css';
	import { element } from 'svelte/internal';

	function redirectLogin(
		event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
	): any {
		goto('/login');
	}

	//#region updated quiz questions
	let updatedQuestion: string;
	let updatedQuestionID: string;
	let updatedCorrectAnswer: string;
	let updatedFalseAnswer0: string;
	let updatedFalseAnswer1: string;
	let updatedFalseAnswer2: string;

	function initializeUpdatedQuestion(actualstring: string) {
		updatedQuestion = actualstring;
	}

	function handleInputChangeUpdatedQuestion(event: any) {
		updatedQuestion = event.target.value;
	}

	function initializeUpdatedQuestionID(actualstring: string) {
		updatedQuestionID = actualstring;
	}

	function initializeUpdatedCorrectAnswer(actualstring: string) {
		updatedCorrectAnswer = actualstring;
	}
	function handleInputChangeUpdatedCorrectAnswer(event: any) {
		updatedCorrectAnswer = event.target.value;
	}

	function initializeUpdatedFalseAnswer0(actualstring: string) {
		updatedFalseAnswer0 = actualstring;
	}
	function handleInputChangeUpdatedFalseAnswer0(event: any) {
		updatedFalseAnswer0 = event.target.value;
	}

	function initializeUpdatedFalseAnswer1(actualstring: string) {
		updatedFalseAnswer1 = actualstring;
	}
	function handleInputChangeUpdatedFalseAnswer1(event: any) {
		updatedFalseAnswer1 = event.target.value;
	}

	function initializeUpdatedFalseAnswer2(actualstring: string) {
		updatedFalseAnswer2 = actualstring;
	}
	function handleInputChangeUpdatedFalseAnswer2(event: any) {
		updatedFalseAnswer2 = event.target.value;
	}
	//#endregion

	const stacks = collectionStore<stack>(db, 'stack');
	let selected: any;
	selected = '';
	let stackName: string = '';
	const existingQuizQuestions = collectionStore<quiz>(db, 'quiz');
	const existingQuizQuestionsForSize = collection(db, 'quiz');
	const user = userStore(auth);
	let value = '';
	let editField: any;
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

	async function initializeEditField() {
		editField = [];
		let countData = await getCountFromServer(existingQuizQuestionsForSize);
		let size = countData.data().count;
		for (let i = 0; i < size; i++) {
			editField.push(false);
		}
	}

	initializeEditField();

	function toggleEditField(index: number) {
		if (editField[index] === true) {
			editField[index] = false;
		} else {
			for (let i = 0; i < editField.length; i++) {
				if (editField[i] === true) {
					editField[i] = false;
				}
			}
			editField[index] = true;
		}
		toggleStackView(false);
	}
	let stackView: boolean = false;
	function toggleStackView(switchle:Boolean)
{
	if (switchle){
		stackView = true;
	}
	else{
		stackView = false;
	}
	
}

	async function getCurrentStackName() {
		let valid: number = 0;

		let stackSnapshot: any;
		console.log('ich frage nach id: ', updatedQuestionID);
		const testQuery = query(
			collection(db, 'stack'),
			where('quizzes', 'array-contains', updatedQuestionID)
		);
		const querySnapshot = await getDocs(testQuery);

		querySnapshot.forEach((doc) => {
			valid++;
			let result = (doc.id, ' => ', doc.data());
			stackName = result.name;
			stackSnapshot = result;
		});
		if (valid < 1) {
			stackName = 'No valid stack!';
		} else if (valid > 1) {
			alert('This should not happen - ' + valid + ' stacks were found. Please contact an administrator');
			stackName = 'No valid stack!';
		} 
	}

	async function updateQuizQuestion() {
		quizQuestion.lastModified = Timestamp.now();
		try {
			const questionRef = doc(db, 'quiz', updatedQuestionID);
			await updateDoc(questionRef, {
				correctAnswer: updatedCorrectAnswer,
				lastModified: quizQuestion.lastModified,
				listOfFalseAnswers: [updatedFalseAnswer0, updatedFalseAnswer1, updatedFalseAnswer2],
				question: updatedQuestion
			});

			console.log('Quiz question updated with ID:', updatedQuestionID);
			resetForm();
		} catch (error) {
			console.error('Error creating/updating quiz question:', error);
		}
	}

	async function deleteQuizQuestion(questionId: string) {
		if (confirm('You are sure you want to delete this question?')) {
			try {
				const questionRef = doc(db, 'quiz', questionId);
				await deleteDoc(questionRef);
				console.log('Quiz question deleted with ID:', questionId);
			} catch (error) {
				console.error('Error deleting quiz question:', error);

				//After delete -> close all open questions
				for (let i = 0; i < editField.length; i++) {
					if (editField[i] === true) {
						editField[i] = false;
					}
				}
			}
		}
	}

	function resetForm() {
		quizQuestion.question = '';
		quizQuestion.listOfFalseAnswers = ['', '', ''];
		quizQuestion.correctAnswer = '';
		toggleStackView(false);
	}
	function resetSelectedStack() {
		selected = '';
	}

	$: console.log('Selected stack:', selected);
</script>

<html lang="en">
	<body>
		<div class="container-background">
			<div class="card text-black">
				<div class="card-header">
					<h1>Edit and delete Quiz Questions</h1>
				</div>

				{#if $user !== null}
					<main>
						<h3>Feel free to edit or delete your own Questions</h3>
						<br />
						{#each $existingQuizQuestions as quizQuestion, index}
							{#if quizQuestion.creatorID === $user.uid}
								<p>
									<Button color="danger" on:click={() => deleteQuizQuestion(quizQuestion.id)}
										>Delete</Button
									>
									<Button color="primary" on:click={() => toggleEditField(index)}>Edit</Button>
									{quizQuestion.question}
								</p>
								{#if editField[index]}
									<p style="display: none;">
										{initializeUpdatedQuestion(quizQuestion.question)}
										{initializeUpdatedQuestionID(quizQuestion.id)}
										{initializeUpdatedCorrectAnswer(quizQuestion.correctAnswer)}
										{initializeUpdatedFalseAnswer0(quizQuestion.listOfFalseAnswers[0])}
										{initializeUpdatedFalseAnswer1(quizQuestion.listOfFalseAnswers[1])}
										{initializeUpdatedFalseAnswer2(quizQuestion.listOfFalseAnswers[2])}
									</p>
									<FormGroup>
										<Label for="question">Question:</Label>
										<Input
											type="text"
											id="question"
											value={quizQuestion.question}
											on:input={handleInputChangeUpdatedQuestion}
										/>
									</FormGroup>

									<FormGroup>
										<Label for="correctAnswer">Correct Answer:</Label>
										<Input
											type="text"
											id="correctAnswer"
											value={quizQuestion.correctAnswer}
											on:input={handleInputChangeUpdatedCorrectAnswer}
										/>
									</FormGroup>

									<FormGroup>
										<Label for="False Answer 1">False Answer 1:</Label>
										<Input
											type="text"
											id="option1"
											value={quizQuestion.listOfFalseAnswers[0]}
											on:input={handleInputChangeUpdatedFalseAnswer0}
										/>
									</FormGroup>

									<FormGroup>
										<Label for="False Answer 2">False Answer 2:</Label>
										<Input
											type="text"
											id="option2"
											value={quizQuestion.listOfFalseAnswers[1]}
											on:input={handleInputChangeUpdatedFalseAnswer1}
										/>
									</FormGroup>

									<FormGroup>
										<Label for="False Answer 3">False Answer 3:</Label>
										<Input
											type="text"
											id="option3"
											value={quizQuestion.listOfFalseAnswers[2]}
											on:input={handleInputChangeUpdatedFalseAnswer2}
										/>
									</FormGroup>
									<FormGroup>
										<Label for="Current Question Stack">Current Question Stack:</Label>
										{#if !stackView}
										<p style="display: none;"> {getCurrentStackName()} </p>
										<p> {stackName}  <Button color="warning" on:click={() => toggleStackView(true)}>Change Stack</Button></p>  
										{:else}
										<br />
										<p style="display: none;">{resetSelectedStack()}</p>
										<select bind:value={selected}>
											{#each $stacks as stack}
												<option value={stack}>
													{stack.name}
												</option>
											{/each}
										</select>
										{/if}
									</FormGroup>
									
									<Button on:click={() => updateQuizQuestion()} color="primary"
										>Update Quiz Question</Button
									>
									<br /><br />
								{/if}
							{/if}
						{/each}
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
