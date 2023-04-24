<script lang="ts">

  	import { db } from "$lib/firebase/firebase";
	import { collectionStore } from "sveltefire";
	import type { user, stack, quiz, lobby, chatMessage } from "$lib/utils/db.d";

const users = collectionStore<user>(db, 'user');
	const stack = collectionStore<stack>(db, 'stack');
	const quiz = collectionStore<quiz>(db, 'quiz');
	const lobby = collectionStore<lobby>(db, 'lobby');
	const chatMessage = collectionStore<chatMessage>(db, 'chatMessage');
</script>

<p>USERS</p>
	{#each $users as u}
		<p>uID = {u.userID}</p>
		<p>firstName = {u.firstName}</p>
		<p>score = {u.score}</p>
	{/each}

	<p>STACKS</p>
	{#each $stack as s}
		<p>author = {s.author}</p>
		<p>difficulty = {s.difficulty}</p>
		<p>name = {s.name}</p>
		<p>quizzes = {s.quizzes}</p>
		<p>tags = {s.tags}</p>
	{/each}

	<p>QUIZ</p>
	{#each $quiz as q}
		<p>correctAnswer = {q.correctAnswer}</p>
		<p>difficulty = {q.difficulty}</p>
		<p>lastModified = {q.lastModified}</p>
		<p>listOfFalseAnswers = {q.listOfFalseAnswers}</p>
		<p>question = {q.question}</p>
		<p>tags = {q.tags}</p>
	{/each}

	<p>LOBBY</p>
	{#each $lobby as l}
		<p>chatMessages = {l.chatMessages}</p>
		<p>gameMode = {l.gameMode}</p>
		<p>listOfUsers = {l.listOfUsers}</p>
		<p>team1 = {l.team1}</p>
		<p>team2 = {l.team2}</p>
	{/each}

	<p>CHATMESSAGE</p>
	{#each $chatMessage as c}
		<p>messageText = {c.messageText}</p>
		<p>time = {c.time}</p>
		<p>user = {c.user}</p>
	{/each}