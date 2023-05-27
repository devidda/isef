import type { RequestHandler } from './$types';
import type { Config } from '@sveltejs/adapter-vercel';
import { json } from '@sveltejs/kit';
import { db } from '$lib/firebase/firebase'
import { doc, updateDoc } from '@firebase/firestore';

export const config: Config = {
  runtime: 'edge',
};

export const POST = (async ({ request }) => {
  try {
    // get data from request
    const { selectedMode, selectedStacks, lobbyID, timeLimit } = await request.json();
    if (!selectedMode || !lobbyID || !timeLimit) {
      throw new Error('One of the parameters has been failed to delivered!')
    }

    const lobbyRef = doc(db, 'lobby', lobbyID);

    if (lobbyRef) {
      await updateDoc(lobbyRef, {
        questionStacks: selectedStacks,
        gameMode: selectedMode,
        timeLimit: timeLimit
      });
    } else {
      throw new Error('An error occured when using the reference to the lobby.');
    }

    return json(true);

  } catch (error) {
    const typedError = error as Error;
    console.error('Error saving settings:', typedError.message);
    return json(false);
  }
}) satisfies RequestHandler;
