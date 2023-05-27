<script lang="ts">
	import { Button, Progress } from 'sveltestrap';
	import { Doc, Collection } from 'sveltefire';
	import { db } from '$lib/firebase/firebase';
	import { collection, getDocs, query, where, updateDoc, doc, getDoc, arrayUnion } from 'firebase/firestore';
	import { onMount } from 'svelte';

	export let lobbyID: string;
	export let user: any;
	export let gameInProgress: boolean;
	export let gameMode: string;
	export let questionStacks: string[];

	const COUNTDOWN_LIMIT = 20;
	let currentQuestion = 0;
	let selectedAnswer: any = null;
	let correctAnswer: boolean | null = null;
	let score = 0;
	let countdown = COUNTDOWN_LIMIT;
	let countdownIntervalID: any = null;

	async function leaveLobby(): Promise<void> {
		try {
			const lobbyToLeaveID = lobbyID;
			const uid = user.uid;

			// call server function to remove user from Firestore lobby
			const response = await fetch('/api/leaveLobby', {
				method: 'POST',
				body: JSON.stringify({ uid, lobbyToLeaveID }),
				headers: {
					'content-type': 'application/json'
				}
			});
			const success = await response.json();

			if (response.ok && success) {
				lobbyID = "";

				setTimeout(() => {
					gameInProgress = false;
				}, 2000);
				console.log('Left the lobby.');
			}
		} catch (error) {
			const typedError = error as Error;
			alert("Error leaving lobby: " + typedError.message);
		}
	}

	function startGame() {
		countdown = COUNTDOWN_LIMIT;
		score = 0;
		currentQuestion = 0;
		selectedAnswer = null;
		correctAnswer = null;
		startCountdown();
	}

	function startCountdown() {
		if (countdownIntervalID !== null) {
			clearInterval(countdownIntervalID);
		}
		countdownIntervalID = setInterval(() => {
			countdown--;
			if (countdown === 0) {
				clearInterval(countdownIntervalID);
				if (gameMode === 'SOLO') {
					checkAnswer();
				} else if (gameMode === 'COOP') {
					voteForAnswer();
					checkAnswer();
				}
			}
		}, 1000);
	}

	function voteForAnswer() {
		if (! Number.isInteger(selectedAnswer)) {
			selectedAnswer = 99;
		}
		updatePlayerVotesInFirestore();
	}

	async function updatePlayerVotesInFirestore() {
		try {
			const lobbyDocRef = doc(db, 'lobby', lobbyID);
			await updateDoc(lobbyDocRef, { 
				[`playerVotes.${user.uid}`]: selectedAnswer,
			});
		} catch (error) {
			console.error('Error updating player votes in Firestore:', error);
		}
	}

	async function resetPlayerVotesInFirestore() {
		try {
			const lobbyDocRef = doc(db, 'lobby', lobbyID);
			await updateDoc(lobbyDocRef, { 
				playerVotes: {},
			});
		} catch (error) {
			console.error('Error resetting player votes in Firestore:', error);
		}
	}

	async function checkAnswer() {
		// stop countdown
		clearInterval(countdownIntervalID);

		if (selectedAnswer) {
			if (selectedAnswer === 42) {
				score++;
				correctAnswer = true;
			} else {
				correctAnswer = false;
			}
		}

		if (gameMode === 'SOLO') {
			setTimeout(nextQuestion, 2000);
		} else if (gameMode === 'COOP') {
			await waitForVotes();
		}
	}

	async function waitForVotes() {
		const lobbyDocRef = doc(db, 'lobby', lobbyID);
		const lobbySnapshot = await getDoc(lobbyDocRef);
		const lobbyData = lobbySnapshot.data();

		const playerCount = Object.keys(lobbyData.listOfUsers).length;
		const voteCount = Object.values(lobbyData.playerVotes).filter((vote: any) => vote !== null).length;

		console.log('p', playerCount, 'v', voteCount);
		if (playerCount === voteCount) {
			let correctTeamVotes = 0;
			for (const [player, vote] of Object.entries(Object.values(lobbyData.playerVotes))) {
				if (vote === 42) {
					correctTeamVotes += 1;
				}
			if (correctTeamVotes > playerCount / 2) {
				const lobbyDocRef = doc(db, 'lobby', lobbyID);
				const currentTeamScore = lobbyData.score;
				await updateDoc(lobbyDocRef, { 
					score: currentTeamScore + 1,
				});
			}
			}
			if (currentQuestion < quizQuestions.length && currentQuestion < 6) {
				setTimeout(nextQuestion, 2000);
			}
		} else {
			setTimeout(waitForVotes, 500);
		}
	}

	function nextQuestion() {
		currentQuestion++;
		countdown = COUNTDOWN_LIMIT;
		selectedAnswer = null;
		correctAnswer = null;
		// playerVotes = {};

		if (gameMode === 'COOP') {
			resetPlayerVotesInFirestore();
		}

		startCountdown();
	}

	let quizQuestions: any;

	async function fetchQuizData(qStacks: any) {
		const stacksQuery = query(collection(db, 'stack'), where('__name__', 'in', qStacks));
		const stacksSnapshot = await getDocs(stacksQuery);
		let stacksNestedData = stacksSnapshot.docs.map(doc => doc.data().quizzes);
		let stacksQuizIDs: any[] = [];
		for (const id of stacksNestedData[0]) {
			stacksQuizIDs.push(id);
		}

		const quizzesQuery = query(collection(db, 'quiz'), where('__name__', 'in', stacksQuizIDs));
		let snap2quizzesSnapshot = await getDocs(quizzesQuery);

		quizQuestions = snap2quizzesSnapshot.docs.map(doc => doc.data());
	}

	window.addEventListener('unhandledrejection', function(event) {
		console.error('Unhandled rejection (promise: ', event.promise, ', reason: ', event.reason, ').');
	});

	onMount(async () => {
		fetchQuizData(questionStacks);
		startGame();
	})
</script>

<div>
	<Doc ref={`lobby/${lobbyID}`} let:data={lobbyData}>
		{#if !quizQuestions}
			<p>starting...</p>
		{:else}
			{#if currentQuestion < quizQuestions.length && currentQuestion < 6}
				<h2>Question {currentQuestion + 1}</h2>
				<p>{quizQuestions[currentQuestion].question}</p>

				{#if quizQuestions[currentQuestion].listOfFalseAnswers !== undefined}
					{#each quizQuestions[currentQuestion].listOfFalseAnswers as answer, index}
						<div class="form-check">
							<input
								class="form-check-input"
								type="radio"
								id={`answer-${index}`}
								name="answer"
								value={index}
								bind:group={selectedAnswer}
								disabled={gameMode === 'COOP' && lobbyData.playerVotes[user.uid] !== undefined}
							/>
							<label class="form-check-label" for={`answer-${index}`}>
								{answer}
							</label>
						</div>
					{/each}
					<div class="form-check">
						<input
							class="form-check-input"
							type="radio"
							id={`answer-correct`}
							name="answer"
							value={42}
							bind:group={selectedAnswer}
							disabled={gameMode === 'COOP' && lobbyData.playerVotes[user.uid] !== undefined}
						/>
						<label class="form-check-label" for={`answer-correct`}>
							{quizQuestions[currentQuestion].correctAnswer}
						</label>
					</div>
				{/if}

				{#if gameMode === 'SOLO'}
					<button on:click={() => checkAnswer()}>Submit</button>
				{:else if gameMode === 'COOP'}
					<p> You have voted: {lobbyData.playerVotes[user.uid]}</p>
					<button on:click={() => voteForAnswer()} disabled={lobbyData.playerVotes[user.uid] !== undefined}>Vote</button>
				{/if}

				{#if correctAnswer === true}
					<div class="alert alert-success" role="alert">Correct answer!</div>
				{:else if correctAnswer === false}
					<div class="alert alert-danger" role="alert">Incorrect answer!</div>
				{/if}

				<Progress value={countdown} max={20} animated striped />
			{:else}
				<p>Game Over!</p>
				<p>You've answered {score} of {quizQuestions.length} questions correctly.</p>
				<p>Your team answered {lobbyData.score} of {quizQuestions.length} questions correctly together.</p>
				<div>
					<Button on:click={() => leaveLobby()}>Leave Game</Button>
				</div>
			{/if}
		{/if}
	</Doc>
</div>
