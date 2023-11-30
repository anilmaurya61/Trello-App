import { getFirestore, collection, getDoc, updateDoc, doc, setDoc, query, where, getDocs, deleteDoc } from "firebase/firestore";

import app from './firebaseConfig'

const getId = () => {
  return new Date().getTime().toString();
}

const db = getFirestore(app);

const createBoard = async (boardData) => {
  try {
    const autoGeneratedId = doc(collection(db, 'boards'));

    await setDoc(autoGeneratedId, { ...boardData, id: autoGeneratedId.id });

    console.log('Board created with ID: ', autoGeneratedId.id);

    return autoGeneratedId.id;
  } catch (e) {
    console.error('Error creating board: ', e);
    throw e;
  }
};

const getBoards = async (userId) => {
  try {
    const q = await query(collection(db, "boards"), where("userId", "==", userId));

    const querySnapshot = await getDocs(q);

    const boards = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
    }));

    return boards;
  }
  catch (e) {
    throw e;
  }
}

const getBoardsById = async (boardId) => {
  try {
    const q = await query(collection(db, "boards"), where("id", "==", boardId));

    const querySnapshot = await getDocs(q);

    const board = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
    }));

    return board;
  }
  catch (e) {
    throw e;
  }
}

const getListsById = async (id) => {

  try {
    const docRef = doc(db, "Lists", id);

    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {

      return { ...docSnapshot.data() };
    } else {
      return null;
    }
  } catch (e) {
    throw e;
  }
};


const deleteBoard = async (id) => {
  try {
    await deleteDoc(doc(db, "boards", id));
    return true;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const deleteList = async ({ boardId, listId }) => {
  try {

    const listsRef = collection(db, 'Lists');

    const listDocRef = doc(listsRef, boardId);

    const listDoc = await getDoc(listDocRef);

    const currentData = listDoc.exists() ? listDoc.data() : { allLists: [] };

    const updatedLists = currentData.allLists.filter(listData => listData.id !== listId);

    console.log(updatedLists);

    if (listDoc.exists()) {
      await updateDoc(listDocRef, { allLists: updatedLists });
    } else {
      await setDoc(listDocRef, { allLists: updatedLists });
    }

    console.log('List Deleted for board with ID: ', listId);

  } catch (e) {
    console.error('Error Deleting list: ', e);
    throw e;
  }
}


const createLists = async (listData) => {
  try {
    const id = getId();

    listData = { ...listData, 'id': id }

    const listsRef = collection(db, 'Lists');

    const listDocRef = doc(listsRef, listData.boardId);

    const listDoc = await getDoc(listDocRef);

    const currentData = listDoc.exists() ? listDoc.data() : { allLists: [] };

    const updatedData = {
      allLists: [...currentData.allLists, listData],
    };

    if (listDoc.exists()) {
      await updateDoc(listDocRef, updatedData);
    } else {
      await setDoc(listDocRef, updatedData);
    }

    console.log('List created for board with ID: ', listData.boardId);

    return listData.boardId;
  } catch (e) {
    console.error('Error creating list: ', e);
    throw e;
  }
};

const createCard = async (cardData) => {
  try {
    const id = getId();
    cardData = { ...cardData, 'cardId': id };

    const docRef = doc(db, "Lists", cardData.boardId);

    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {

      let data = { ...docSnapshot.data() };
      const updatedLists = data.allLists.map((list) => {
        if (list.id === cardData.listId) {
          return {
            ...list,
            Cards: [...(list.Cards || []), cardData],
          };
        }
        return list;
      });

      await updateDoc(docRef, { allLists: updatedLists });

      console.log('Card created for list with ID: ', cardData);
    } else {
      console.error('List with ID does not exist: ', cardData.listId);
      return null;
    }
  } catch (e) {
    console.error('Error creating card: ', e);
    throw e;
  }
};

const addTodo = async (todoData) => {
  try {
    const id = getId();
    todoData = { ...todoData, 'todoId': id };
    console.log(todoData);

    const listsRef = collection(db, 'Lists');
    const listDocRef = doc(listsRef, todoData.listId);

    const listDoc = await getDoc(listDocRef);

    if (listDoc.exists()) {
      const currentData = listDoc.data();
      const updatedLists = currentData.Lists.map((list) => {
        if (list.ListId === todoData.listId) {
          const updatedCards = list.Cards.map((card) => {
            if (card.cardId === todoData.cardId) {
              return {
                ...card,
                Todo: [...(card.Todo || []), todoData],
              };
            }
            return card;
          });

          return {
            ...list,
            Cards: updatedCards,
          };
        }
        return list;
      });

      await updateDoc(listDocRef, { Lists: updatedLists });

      console.log('Todo added to card with ID: ', todoData.cardId);
      return todoData.todoId;
    } else {
      console.error('List with ID does not exist: ', todoData.listId);
      return null;
    }
  } catch (e) {
    console.error('Error adding todo: ', e);
    throw e;
  }
};

const addTodoListName = async (todoListNameData) => {
  try {
    const id = getId();
    todoListNameData = { ...todoListNameData, 'todoListId': id };
    console.log(todoListNameData);

    const listsRef = collection(db, 'Lists');
    const listDocRef = doc(listsRef, todoListNameData.listId);

    const listDoc = await getDoc(listDocRef);

    if (listDoc.exists()) {
      const currentData = listDoc.data();
      const updatedLists = currentData.Lists.map((list) => {
        if (list.ListId === todoListNameData.listId) {
          const updatedCards = list.Cards.map((card) => {
            if (card.cardId === todoListNameData.cardId) {
              return {
                ...card,
                todoListName: todoListNameData.todoListName,
              };
            }
            return card;
          });

          return {
            ...list,
            Cards: updatedCards,
          };
        }
        return list;
      });

      await updateDoc(listDocRef, { Lists: updatedLists });

      console.log('Todo List Name added to card with ID: ', todoListNameData.cardId);
      return todoListNameData.todoListId;
    } else {
      console.error('List with ID does not exist: ', todoListNameData.listId);
      return null;
    }
  } catch (e) {
    console.error('Error adding todo list name: ', e);
    throw e;
  }
};

const addComments = async (commentData) => {
  try {
    const id = getId();
    commentData = { ...commentData, 'commentId': id };
    console.log(commentData);

    const listsRef = collection(db, 'Lists');
    const listDocRef = doc(listsRef, commentData.listId);

    const listDoc = await getDoc(listDocRef);

    if (listDoc.exists()) {
      const currentData = listDoc.data();
      const updatedLists = currentData.Lists.map((list) => {
        if (list.ListId === commentData.listId) {
          const updatedCards = list.Cards.map((card) => {
            if (card.cardId === commentData.cardId) {
              return {
                ...card,
                comments: [...(card.comments || []), commentData],
              };
            }
            return card;
          });
          return {
            ...list,
            Cards: updatedCards,
          };
        }
        return list;
      });

      await updateDoc(listDocRef, { Lists: updatedLists });

      console.log('Comment added to card with ID: ', commentData.cardId);
      return commentData.commentId;
    } else {
      console.error('List with ID does not exist: ', commentData.listId);
      return null;
    }
  } catch (e) {
    console.error('Error adding comment: ', e);
    throw e;
  }
};

const deleteCard = async ({boardId, listId, cardId}) => {
  console.log(boardId, listId, cardId)
  try {
    const listsRef = collection(db, 'Lists');

    const listDocRef = doc(listsRef, boardId);

    const listDoc = await getDoc(listDocRef);

    if (listDoc.exists()) {
      const currentData = listDoc.data();

      console.log(currentData);

      const updatedLists = currentData.allLists.map((list) => {
        console.log(list);
        if (list.id == listId) {
          console.log("a",list.Cards)
          const updatedCards = list.Cards.filter((card) => card.cardId != cardId);
          console.log("bb",updatedCards)
          return {
            ...list,
            Cards: updatedCards,
          };
        }
        return list;
      });

      await updateDoc(listDocRef, { allLists: updatedLists });

      console.log('Card deleted with ID: ', cardId);
     
    }
  } catch (e) {
    console.error('Error deleting card: ', e);
    throw e;
  }
};


const editCard = async (listId, cardId, updatedCardData) => {
  try {
    const listsRef = collection(db, 'Lists');
    const listDocRef = doc(listsRef, listId);

    const listDoc = await getDoc(listDocRef);

    if (listDoc.exists()) {
      const currentData = listDoc.data();
      const updatedLists = currentData.Lists.map((list) => {
        if (list.ListId === listId) {
          const updatedCards = list.Cards.map((card) => {
            if (card.cardId === cardId) {
              return {
                ...card,
                ...updatedCardData,
              };
            }
            return card;
          });

          return {
            ...list,
            Cards: updatedCards,
          };
        }
        return list;
      });

      await updateDoc(listDocRef, { Lists: updatedLists });

      console.log('Card edited with ID: ', cardId);
      return true;
    } else {
      console.error('List with ID does not exist: ', listId);
      return false;
    }
  } catch (e) {
    console.error('Error editing card: ', e);
    throw e;
  }
};


export {
  createBoard,
  getBoards,
  deleteBoard,
  deleteList,
  deleteCard,
  getBoardsById,
  createLists,
  createCard,
  addTodo,
  addTodoListName,
  addComments,
  getListsById
};
