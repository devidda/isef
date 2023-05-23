<script lang="ts">
	import { onMount } from 'svelte';
	import { Progress } from 'sveltestrap';
	import { Collection } from 'sveltefire';

	export let lobbyID: string;
	export let user: string;

	let currentQuestion = 0;
	let selectedAnswer: any = null;
	let correctAnswer: boolean | null = null;
	let score = 0;
	let countdown = 20;
	let countdownIntervalID: any = null;

	function startGame() {
		countdown = 20;
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
				checkAnswer();
			}
		}, 1000);
	}

	function checkAnswer() {
		if (selectedAnswer) {
			if (selectedAnswer === 42) {
			  score++;
			  correctAnswer = true;
			} else {
			  correctAnswer = false;
			}
		}

		setTimeout(nextQuestion, 2000);
	}

	function nextQuestion() {
		currentQuestion++;
		countdown = 20;
		selectedAnswer = null;
		correctAnswer = null;
		startCountdown();
	}

	onMount(async () => {
		startGame();
	});
</script>

<Collection ref={'quiz'} let:data={questions} let:count>
	{#if currentQuestion < count && currentQuestion < 6}
		<h2>Question {currentQuestion + 1}</h2>
		<p>{questions[currentQuestion].question}</p>

		{#each questions[currentQuestion].listOfFalseAnswers as answer, index}
			<div class="form-check">
				<input
					class="form-check-input"
					type="radio"
					id={`answer-${index}`}
					name="answer"
					value={index}
					bind:group={selectedAnswer}
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
			/>
			<label class="form-check-label" for={`answer-correct`}>
				{questions[currentQuestion].correctAnswer}
			</label>
		</div>

		<button on:click={() => checkAnswer()}>Submit</button>

		{#if correctAnswer === true}
			<div class="alert alert-success" role="alert">Correct answer!</div>
		{:else if correctAnswer === false}
			<div class="alert alert-danger" role="alert">Incorrect answer!</div>
		{/if}

		<Progress value={countdown} max={20} animated striped />
	{:else}
		<p>Game Over</p>
		<p>Score: {score}</p>
	{/if}
</Collection>
