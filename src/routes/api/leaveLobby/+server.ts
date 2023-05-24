import type { RequestHandler } from './$types';
import type { Config } from '@sveltejs/adapter-vercel';
import { json } from '@sveltejs/kit';
import { db } from '$lib/firebase/firebase'
import { doc, updateDoc, deleteDoc, arrayRemove, getDoc } from '@firebase/firestore';

export const config: Config = {
  runtime: 'edge',
};

export const POST = (async ({ request }) => {
  try {
    // get data from request
    const { uid, lobbyToLeaveID } = await request.json();
    if (!uid || !lobbyToLeaveID ) {
      throw new Error('One of the parameters has been failed to delivered!')
    }

    const lobbyReference = doc(db, 'lobby', lobbyToLeaveID ); 

    if (lobbyReference) {
      // remove user from existing lobby
      await updateDoc(lobbyReference, {
        listOfUsers: arrayRemove(uid)
      });

      // get lobby data
      const lobbyData = await getDoc(lobbyReference);

      // delete lobby if it is empty now
      if (lobbyData.exists()) {
        if (lobbyData.data().listOfUsers.length === 0) {
          console.log('Lobby is now empty and will be deleted...')
          deleteDoc(lobbyReference);
        }
      }

      return json(true);
    }
    throw new Error('Failed to leave lobby.')

  } catch (error) {
    const typedError = error as Error;
    console.error('Error leaving lobby:', typedError.message);
    return json(false);
  }
}) satisfies RequestHandler;
