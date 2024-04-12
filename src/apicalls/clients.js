import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import firestoreDatabase from "../firebaseConfig";

export const AddClient = async (payload) => {
  try {
    await setDoc(doc(firestoreDatabase, "client", payload.userId), payload);

    // update user role
    await updateDoc(doc(firestoreDatabase, "users", payload.userId), {
      role: "client",
    });
    return {
      success: true,
      message: "Client added successfully, please wait for approval",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const CheckIfClientAccountIsApplied = async (id) => {
  try {
    const clients = await getDocs(
      query(collection(firestoreDatabase, "client"), where("userId", "==", id))
    );
    if (clients.size > 0) {
      return {
        success: true,
        message: "Client account already applied",
        data: clients.docs.map((doc) => {
          return {
            ...doc.data(),
            id: doc.id,
          };
        })[0],
      };
    }
    return {
      success: false,
      message: "Client account not applied",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const GetAllClients = async () => {
  try {
    const clients = await getDocs(collection(firestoreDatabase, "client"));
    return {
      success: true,
      data: clients.docs.map((doc) => {
        return {
          ...doc.data(),
          id: doc.id,
        };
      }),
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const UpdateClient = async (payload) => {
  try {
    await setDoc(doc(firestoreDatabase, "client", payload.id), payload);
    return {
      success: true,
      message: "Client updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const GetClientById = async (id) => {
  try {
    const client = await getDoc(doc(firestoreDatabase, "client", id));
    return {
      success: true,
      data: client.data(),
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};
