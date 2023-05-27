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
	let selectedOld: any;
	selected = '';
	let stackName: string = '';
	const existingQuizQuestions = collectionStore<quiz>(db, 'quiz');
	const existingQuizQuestionsForSize = collection(db, 'quiz');
	const user = userStore(auth);
	let stackSnapshotId: string = '';
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

	function toggleEditField(index: number, closeEverything: boolean) {
		if (closeEverything) {
			for (let i = 0; i < editField.length; i++) {
				if (editField[i] === true) {
					editField[i] = false;
				}
			}
		} else {
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
		}
		toggleStackView(false);
	}
	let stackView: boolean = false;
	function toggleStackView(switchle: Boolean) {
		if (switchle) {
			selectedOld = selected;
			stackView = true;
		} else {
			stackView = false;
		}
	}

	function resetSelectedOld() {
		selectedOld = '';
	}

	async function getCurrentStackName() {
		let valid: number = 0;

		let stackSnapshot: any;
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
			stackSnapshotId = doc.id;
		});
		if (valid < 1) {
			stackName = 'No valid stack!';
		} else if (valid > 1) {
			alert(
				'This should not happen - ' + valid + ' stacks were found. Please contact an administrator'
			);
			stackName = 'No valid stack!';
		} else {
			selected = stackSnapshot;
		}
	}

	async function updateQuizQuestion() {
		if (
			!updatedCorrectAnswer ||
			!updatedFalseAnswer0 ||
			!updatedFalseAnswer1 ||
			!updatedFalseAnswer2 ||
			!updatedQuestion ||
			!updatedQuestionID ||
			!selected
		) {
			alert('Please fill in all required fields');
		} else {
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
			if (selectedOld) {
				//button Change Stack was clicked - maybe we have some changes
				updateStacks(updatedQuestionID);
			}
			toggleEditField(0, true);
		}
	}

	async function updateStacks(updatedQuestionID: string) {
		if (selectedOld.name === selected.name) {
			console.log('The user selected the same stack as before... do nothing');
			return;
		} else if (!selected.name) {
			console.log('No stack is selected... do nothing');
			return;
		}
		console.log('We have a stackchange. From: ' + selectedOld.name + ' to: ' + selected.name);
		let lastModified = Timestamp.now();

		//we delete the questionID from the old stack
		//first, we read the current stack...
		let oldStackInstance: any;
		let oldStackID: string;
		let valid = 0;
		const testQuery = query(collection(db, 'stack'), where('name', '==', selectedOld.name));
		const querySnapshot = await getDocs(testQuery);

		querySnapshot.forEach((doc) => {
			valid++;
			let result = (doc.id, ' => ', doc.data());
			oldStackInstance = result;
			oldStackID = doc.id;
		});
		if (valid !== 1) {
			alert(
				'Something went wrong... no stack containing ' + selectedOld.name + ' was found. Aborting!'
			);
			return;
		}

		//then we search for the QuizzId and delete it...

		for (let i = 0; i < oldStackInstance.quizzes.length; i++) {
			if (oldStackInstance.quizzes[i] === updatedQuestionID) {
				oldStackInstance.quizzes.splice(i, 1);
			}
		}

		//then we update the stack
		try {
			const questionRef = doc(db, 'stack', oldStackID!);
			await updateDoc(questionRef, {
				quizzes: oldStackInstance.quizzes,
				lastModified: quizQuestion.lastModified
			});

			console.log('stack updated with ID:', oldStackID!);
		} catch (error) {
			console.error('Error updating stack:', error);
		}

		//we add the questionID to the new stack
		selected.quizzes.push(updatedQuestionID);
		try {
			const questionRef = doc(db, 'stack', selected.id);
			await updateDoc(questionRef, {
				quizzes: selected.quizzes,
				lastModified: quizQuestion.lastModified
			});

			console.log('stack updated with ID:', selected.id);
		} catch (error) {
			console.error('Error updating stack:', error);
		}
		resetSelectedOld();
	}

	async function deleteQuizQuestion(questionId: string) {
		if (confirm('Are you sure you want to delete this question?')) {
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

			//does the question have a valid stack? If so, delete the questionID. If not, do nothing
			if (selected) {
				for (let i = 0; i < selected.quizzes.length; i++) {
					if (selected.quizzes[i] === questionId) {
						selected.quizzes.splice(i, 1);
					}
				}

				let lastModified = Timestamp.now();
				try {
					const questionRef = doc(db, 'stack', stackSnapshotId);
					await updateDoc(questionRef, {
						quizzes: selected.quizzes,
						lastModified: quizQuestion.lastModified
					});

					console.log('stack updated with ID:', stackSnapshotId);
				} catch (error) {
					console.error('Error updating stack:', error);
				}
			} else {
				console.log('Stack was empty...');
			}
			toggleEditField(0, true);
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
		
				<div class="card-header">
					<h1>Edit and delete Quiz Questions</h1>
				</div>

				{#if $user !== null}
					<main>
						<p>Feel free to edit or delete your own Questions</p>
						<br/>
						{#each $existingQuizQuestions as quizQuestion, index}
							{#if quizQuestion.creatorID === $user.uid}
								<p>
									<Button color="primary" on:click={() => toggleEditField(index, false)}
										>Edit</Button
									>
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
									<Button color="danger" on:click={() => deleteQuizQuestion(quizQuestion.id)}
										>Delete this Question</Button
									>
									<br />
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
											<p style="display: none;">{getCurrentStackName()}</p>
											<p>
												{stackName}
												<Button color="warning" on:click={() => toggleStackView(true)}
													>Change Stack</Button
												>
											</p>
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

									<Button on:click={() => updateQuizQuestion()} color="success"
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
	</body>
</html>
