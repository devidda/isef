import type { RequestHandler } from './$types';
import type { Config } from '@sveltejs/adapter-vercel';
import { json } from '@sveltejs/kit';
import { db } from '$lib/firebase/firebase'
import { doc, updateDoc, arrayUnion } from '@firebase/firestore';

export const config: Config = {
  runtime: 'edge',
};

export const POST = (async ({ request }) => {
  try {
    // get data from request
    const { uid, selectedLobbyID } = await request.json();
    if (!uid || !selectedLobbyID) {
      throw new Error('One of the parameters has been failed to delivered!')
    }
    const lobby = doc(db, 'lobby', selectedLobbyID);

    if (lobby) {
      // add new user to existing lobby
      await updateDoc(lobby, {
        listOfUsers: arrayUnion(uid)
      });

      return json(uid);
    }
    throw Error('Failed to join lobby. Lobby-reference or uid might be invalid.')

  } catch (error) {
    const typedError = error as Error;
    console.error('Error creating new lobby in Firestore:', typedError.message);
    return json(false);
  }
}) satisfies RequestHandler;
