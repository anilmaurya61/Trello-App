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


const editCardTitle = async ({ editedCardTitle, cardId, boardId, listId }) => {
  try {
    const docRef = doc(db, "Lists", boardId);

    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {

      let data = { ...docSnapshot.data() };
      const updatedLists = data.allLists.map((list) => {
        if (list.id === listId) {
          const updatedCards = (list.Cards || []).map((card) => {
            if (card.cardId === cardId) {
              return {
                ...card,
                cardTitle: editedCardTitle,
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

      await updateDoc(docRef, { allLists: updatedLists });

      console.log('Card title edited successfully for card with ID: ', cardId);
    } else {
      console.error('List with ID does not exist: ', listId);
      return null;
    }
  } catch (e) {
    console.error('Error editing card title: ', e);
    throw e;
  }
};

const addTodo = async (todoData) => {
  try {
    const id = getId();
    todoData = { ...todoData, 'todoId': id };

    const data = { 'id': todoData.todoId, 'todoTitle': todoData.todo, 'isCompleted': todoData.isCompleted }

    const listsRef = collection(db, 'Lists');

    const listDocRef = doc(listsRef, todoData.boardId);

    const listDoc = await getDoc(listDocRef);
    if (listDoc.exists()) {
      const currentData = listDoc.data();
      const updatedLists = currentData.allLists.map((list) => {
        if (list.id == todoData.listId) {
          const updatedCards = list.Cards.map((card) => {
            if (card.cardId == todoData.cardId) {
              return {
                ...card,
                Todo: [...(card.Todo || []), data],
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

      await updateDoc(listDocRef, { allLists: updatedLists });

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

const getTodo = async ({ boardId, listId, cardId }) => {
  try {
    console.log(boardId, listId, cardId);
    const listsRef = collection(db, 'Lists');

    const listDocRef = doc(listsRef, boardId);

    const listDoc = await getDoc(listDocRef);

    const currentData = listDoc.data();


    const targetList = currentData.allLists.find((list) => list.id == listId);


    const targetCard = targetList.Cards.find((card) => card.cardId == cardId);

    const targetTodo = (targetCard.Todo || [])

    return targetTodo;

  } catch (e) {
    console.error('Error getting todo:', e);
    throw e;
  }
};

const deleteTodo = async ({boardId, listId, cardId, todoId}) => {
  try {
    const listsRef = collection(db, 'Lists');
    const listDocRef = doc(listsRef, boardId);

    const listDoc = await getDoc(listDocRef);

    if (listDoc.exists()) {
      const currentData = listDoc.data();

      const updatedLists = currentData.allLists.map((list) => {
        if (list.id == listId) {
          const updatedCards = list.Cards.map((card) => {
            if (card.cardId == cardId) {
              console.log("card", card)
              const updatedTodo = (card.Todo || []).filter((todo) => todo.id != todoId);
              return {
                ...card,
                Todo: updatedTodo,
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

      await updateDoc(listDocRef, { allLists: updatedLists });

      console.log('Todo deleted with ID: ', todoId);
      return true;
    } else {
      console.error('Board with ID does not exist:', boardId);
      return false;
    }
  } catch (e) {
    console.error('Error deleting todo:', e);
    throw e;
  }
};

const updateTodo = async (boardId, listId, cardId, todoId, updatedTodoData) => {
  try {
    const listsRef = collection(db, 'Lists');
    const listDocRef = doc(listsRef, boardId);

    const listDoc = await getDoc(listDocRef);

    if (listDoc.exists()) {
      const currentData = listDoc.data();

      const updatedLists = currentData.allLists.map((list) => {
        if (list.id === listId) {
          const updatedCards = list.Cards.map((card) => {
            if (card.cardId === cardId) {
              const updatedTodoList = (card.Todo || []).map((todo) => {
                if (todo.id === todoId) {
                  return {
                    ...todo,
                    todoTitle: updatedTodoData.todoTitle || todo.todoTitle,
                    isCompleted: updatedTodoData.isCompleted !== undefined ? updatedTodoData.isCompleted : todo.isCompleted,
                  };
                }
                return todo;
              });

              return {
                ...card,
                Todo: updatedTodoList,
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

      await updateDoc(listDocRef, { allLists: updatedLists });

      console.log('Todo updated with ID: ', todoId);
      return true;
    } else {
      console.error('Board with ID does not exist:', boardId);
      return false; 
    }
  } catch (e) {
    console.error('Error updating todo:', e);
    throw e;
  }
};


const addComments = async ({ boardId, listId, cardId, comment }) => {

  try {

    const listsRef = collection(db, 'Lists');

    const listDocRef = doc(listsRef, boardId);

    const listDoc = await getDoc(listDocRef);

    if (listDoc.exists()) {
      const currentData = listDoc.data();

      const updatedLists = currentData.allLists.map((list) => {
        if (list.id == listId) {
          const updatedCards = list.Cards.map((card) => {
            if (card.cardId == cardId) {
              if (!card.comments) {
                card.comments = [];
              }
              card.comments.push(comment);
            }
            return card;
          });
          list.Cards = updatedCards;
        }
        return list;
      });
      console.log("comment", updatedLists);
      await updateDoc(listDocRef, { allLists: updatedLists });

      console.log('Comment Added', comment);
    }
  } catch (e) {
    console.error('Error Adding Comment: ', e);
    throw e;
  }
};


const getComments = async ({ boardId, listId, cardId }) => {
  try {
    const listsRef = collection(db, 'Lists');
    const listDocRef = doc(listsRef, boardId);
    const listDoc = await getDoc(listDocRef);

    if (listDoc.exists()) {
      const currentData = listDoc.data();

      const targetList = currentData.allLists.find((list) => list.id == listId);

      if (targetList) {
        const targetCard = targetList.Cards.find((card) => card.cardId == cardId);

        if (targetCard && targetCard.comments) {
          console.log('Comments for Card with ID:', cardId, targetCard.comments);
          return targetCard.comments;
        } else {
          console.log('Card not found or no comments available.');
          return [];
        }
      } else {
        console.log('List not found.');
        return [];
      }
    } else {
      console.log('Board not found.');
      return [];
    }
  } catch (e) {
    console.error('Error getting comments: ', e);
    throw e;
  }
};


const deleteCard = async ({ boardId, listId, cardId }) => {
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
          console.log("a", list.Cards)
          const updatedCards = list.Cards.filter((card) => card.cardId != cardId);
          console.log("bb", updatedCards)
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

const shiftRightList = async ({ boardId, listId }) => {
  try {
    const listsRef = collection(db, 'Lists');
    const listDocRef = doc(listsRef, boardId);
    const listDoc = await getDoc(listDocRef);

    const currentData = listDoc.exists() ? listDoc.data() : { allLists: [] };
    const allLists = currentData.allLists;

    const currentIndex = allLists.findIndex((list) => list.id === listId);

    if (currentIndex < allLists.length - 1) {
      const updatedLists = [...allLists];
      const temp = updatedLists[currentIndex];
      updatedLists[currentIndex] = updatedLists[currentIndex + 1];
      updatedLists[currentIndex + 1] = temp;

      console.log(updatedLists);

      if (listDoc.exists()) {
        await updateDoc(listDocRef, { allLists: updatedLists });
      } else {
        await setDoc(listDocRef, { allLists: updatedLists });
      }
      console.log('List Shifted Right: ', listId);
    } else {
      console.log('List is already at the rightmost position');
    }
  } catch (e) {
    console.error('Error shifting list to the right: ', e);
    throw e;
  }
};


const shiftLeftList = async ({ boardId, listId }) => {
  try {
    const listsRef = collection(db, 'Lists');
    const listDocRef = doc(listsRef, boardId);
    const listDoc = await getDoc(listDocRef);

    const currentData = listDoc.exists() ? listDoc.data() : { allLists: [] };
    const allLists = currentData.allLists;

    const currentIndex = allLists.findIndex((list) => list.id === listId);

    if (currentIndex > 0) {
      const updatedLists = [...allLists];
      const temp = updatedLists[currentIndex];
      updatedLists[currentIndex] = updatedLists[currentIndex - 1];
      updatedLists[currentIndex - 1] = temp;

      console.log(updatedLists);

      if (listDoc.exists()) {
        await updateDoc(listDocRef, { allLists: updatedLists });
      } else {
        await setDoc(listDocRef, { allLists: updatedLists });
      }
    } else {
      console.log('List is already at the leftmost position');
    }
  } catch (e) {
    console.error('Error shifting list to the left: ', e);
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
  editCardTitle,
  addTodo,
  getTodo,
  deleteTodo,
  updateTodo,
  addComments,
  getComments,
  getListsById,
  shiftRightList,
  shiftLeftList,
};
