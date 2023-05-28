import { db } from '$lib/firebase/firebase'
import { doc, updateDoc } from '@firebase/firestore';


export async function saveLobbySettings(selectedMode: string, selectedStacks: string[], lobbyID: string, timeLimit: number): Promise<boolean> {
  try {
    // get data from request
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

    return true;

  } catch (error) {
    const typedError = error as Error;
    console.error('Error saving settings:', typedError.message);
    return false;
  }
};
