import type { Timestamp } from 'firebase/firestore';

interface user {
	username: string;
	score: Number;
}

interface stack {
	author: string;
	lastModified: Timestamp;
	name: string;
	quizzes: Array;
	id: string;
}

interface quiz {
	correctAnswer: string;
	difficulty: string;
	lastModified: Timestamp;
	listOfFalseAnswers: Array;
	question: string;
	tags: Array;
	id: string;
	creatorID: string;
}

interface lobby {
	chatMessages: string;
	gameMode: string;
	listOfUsers: Array;
	team1: Array;
	team2: Array;
}

interface chatMessage {
	messageText: string;
	time: Timestamp;
	user: string;
}
