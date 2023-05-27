import type { RequestHandler } from './$types';
import type { Config } from '@sveltejs/adapter-vercel';
import { json } from '@sveltejs/kit';
import { db } from '$lib/firebase/firebase'
import { setDoc, doc, deleteDoc } from '@firebase/firestore';

export const config: Config = {
  runtime: 'edge',
};

export const POST = (async ({ request }) => {
  try {
    // get data from request
    const uid = await request.json();
    if (!uid) {
      throw new Error('Parameter has been failed to delivered!')
    }

    // add new user to firestore
    await setDoc(doc(db, 'lobby', uid), {
      gameMode: 'SOLO',
      listOfUsers: [uid],
      status: 'SETUP'
    });

    return json(true);

  } catch (error) {
    const typedError = error as Error;
    console.error('Error creating new lobby in Firestore:', typedError.message);
    return json(false);
  }
}) satisfies RequestHandler;
