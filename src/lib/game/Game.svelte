<script lang="ts">
	import { Button, Progress } from 'sveltestrap';
	import { Doc } from 'sveltefire';
	import { db } from '$lib/firebase/firebase';
	import { collection, getDocs, query, where } from 'firebase/firestore';

	export let lobbyID: string;
	export let user: any;
	export let gameInProgress: boolean;
 
	let currentQuestion = 0;
	let selectedAnswer: any = null;
	let correctAnswer: boolean | null = null;
	let score = 0;
	let countdown = 20;
	let countdownIntervalID: any = null;

	async function leaveLobby(): Promise<void> {
    try {
      const lobbyToLeaveID = lobbyID;
			const uid = user.uid;

      // call server function to add user to Firestore
      const response = await fetch('/api/leaveLobby', {
          method: 'POST',
          body: JSON.stringify({ uid, lobbyToLeaveID }),
          headers: {
              'content-type': 'application/json'
          }
      });
      const success = await response.json();

      if (response.ok && success) {
        
        setTimeout(() => {
					gameInProgress = false;
					lobbyID = "";					
				}, 2000)
        console.log('Left the lobby.');
      }
    } catch (error) {
      const typedError = error as Error
      alert("Error leaving lobby: " +  typedError.message);
    }
	}

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

	let quizQuestions: any;

  async function buildQuery(qStacks: any) {
		const stacksQuery = query(collection(db, 'stack'), where('__name__', 'in', qStacks));
		const stacksSnapshot = await getDocs(stacksQuery);
		let stacksNestedData = stacksSnapshot.docs.map(doc => doc.data().quizzes);
		let stacksQuizIDs: any[] = [];
		for (const id of stacksNestedData[0]) {
			console.log(id);
			stacksQuizIDs.push(id);
		}

    const quizzesQuery = query(collection(db, 'quiz'), where('__name__', 'in', stacksQuizIDs));
		let snap2quizzesSnapshot = await getDocs(quizzesQuery);

		quizQuestions = snap2quizzesSnapshot.docs.map(doc => doc.data());
	}

	window.addEventListener('unhandledrejection', function(event) {
		console.error('Unhandled rejection (promise: ', event.promise, ', reason: ', event.reason, ').');
	});

	function initializeGame(questionStacks: string[]) {
		buildQuery(questionStacks);
		startGame();
	}
</script>

<div>
	<Doc ref={`lobby/${lobbyID}`} let:data={lobbyData}>
		{#if !quizQuestions}
			<Button on:click={() => initializeGame(lobbyData.questionStacks)}>Ready!</Button>
		{:else}
			{#if currentQuestion < quizQuestions.length && currentQuestion < 6}
				<h2>Question {currentQuestion + 1}</h2>
				<p>{quizQuestions[currentQuestion].question}</p>

				{#each quizQuestions[currentQuestion].listOfFalseAnswers as answer, index}
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
						{quizQuestions[currentQuestion].correctAnswer}
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
				<p>Game Over!</p>
				<p>You've answered {score} of {quizQuestions.length} questions correctlty.</p>
				<div>
					<Button on:click={() => leaveLobby()}>Leave Game</Button>
				</div>
			{/if}
		{/if}
	</Doc>
</div>
