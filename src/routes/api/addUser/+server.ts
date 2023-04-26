import type { RequestHandler } from './$types';
import type { Config } from '@sveltejs/adapter-vercel';
import { json } from '@sveltejs/kit';
import { db } from '$lib/firebase/firebase'
import { setDoc, doc } from '@firebase/firestore';

export const config: Config = {
  runtime: 'edge',
};

export const POST = (async ({ request }) => {
  try {
    // get data from request
    const { uid, displayName }: {uid: string, displayName: string} = await request.json();

    // add new user to firestore
    await setDoc(doc(db, 'user', uid), {
      username: displayName,
      score: 0
    });

    return json(true);

  } catch (error) {
    const typedError = error as Error;
    console.error('Error writing new user to Firestore:', typedError.message);
    return json(false);
  }
}) satisfies RequestHandler;
