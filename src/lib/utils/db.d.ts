import type { Timestamp } from 'firebase/firestore';

interface user {
	username: string;
	score: Number;
}

interface stack {
	author: string;
	difficulty: string;
	lastModified: Timestamp;
	name: string;
	quizzes: Array;
	tags: Array;
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
	gameMode: string;
	listOfUsers: Array;
	timeLimit: number;
	playerVotes: Map;
	questionStacks: Array;
	status: string;
	score: number;
}

interface chatMessage {
	messageText: string;
	time: Timestamp;
	user: string;
}
