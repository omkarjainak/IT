import firestoreDatabase from "../firebaseConfig";
import { collection, addDoc, getDocs,updateDoc, query, where, getDoc, doc,setDoc } from "firebase/firestore";
import CryptoJS from "crypto-js";

export const CreateUser = async (payload) => {
  try {
    // check if user already exists using email
    const qry = query(
      collection(firestoreDatabase, "users"),
      where("email", "==", payload.email)
    );
    const querySnapshot = await getDocs(qry);
    if (querySnapshot.size > 0) {
      throw new Error("User already exists");
    }

    // hash password
    const hashedPassword = CryptoJS.AES.encrypt(
      payload.password,
      "sheyjobs-lite"
    ).toString();
    payload.password = hashedPassword;

    const docRef = collection(firestoreDatabase, "users");
    await addDoc(docRef, payload);
    return {
      success: true,
      message: "User created successfully",
    };
  } catch (error) {
    return error;
  }
};

export const LoginUser = async (payload) => {
  try {
    const qry = query(
      collection(firestoreDatabase, "users"),
      where("email", "==", payload.email)
    );
    const userSnapshots = await getDocs(qry);
    if (userSnapshots.size === 0) {
      throw new Error("User does not exist");
    }

    // decrypt password
    const user = userSnapshots.docs[0].data();
    user.id = userSnapshots.docs[0].id;
    const bytes = CryptoJS.AES.decrypt(user.password, "sheyjobs-lite");
    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

    if (originalPassword !== payload.password) {
      throw new Error("Incorrect password");
    }

    return {
      success: true,
      message: "User logged in successfully",
      data: user,
    };
  } catch (error) {
    return error;
  }
};

export const GetAllUsers = async () => {
  try {
    const users = await getDocs(collection(firestoreDatabase, "users"));
    return {
      success: true,
      data: users.docs.map((doc) => {
        return {
          ...doc.data(),
          id: doc.id,
        };
      }),
    };
  } catch (error) {
    return error;
  }
}

export const GetUserById = async (id) => {
  try {
    const user = await getDoc(doc(firestoreDatabase, "users", id));
    return {
      success: true,
      data: {
        ...user.data(),
        id: user.id,
      },
    };
  } catch (error) {
    return error;
  }
}

export const saveUserData = async (id, userData) => {
  try {
    const userRef = doc(firestoreDatabase, "users", id);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
     
      await setDoc(userRef, { ...userData }, { merge: true });
      console.log("User data updated successfully!");
    } else {
      console.error("User document does not exist.");
      
    }
  } catch (error) {
    console.error("Error updating user data:", error.message);
    // Handle the error appropriately
  }
};

export const getprofiledata=async(id)=>{
  try{
    const user =await getDoc(firestoreDatabase,"profile",id );
    return{
      success:true,
      data:{
        ...user.data(),
        id:user.id,
      },
    }
  }catch(error){
    return error;

  }
};
export const UpdateUserPassword = async (userId, newPassword) => {
  try {
    
    const userRef = doc(firestoreDatabase, "users", userId);

    
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

   
    const bytes = CryptoJS.AES.decrypt(userDoc.data().password, "sheyjobs-lite");
    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

    
    if (originalPassword !== newPassword) {
      
      const encryptedNewPassword = CryptoJS.AES.encrypt(newPassword, "sheyjobs-lite").toString();

      
      await updateDoc(userRef, { password: encryptedNewPassword });

      return {
        success: true,
        message: "Password updated successfully",
      };
    } else {
      throw new Error("New password should be different from the current one");
    }
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const UpdateUserRole = async (userId, newRole) => {
  try {
    const userRef = doc(firestoreDatabase, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

    // Check if the new role is different from the current one
    if (userDoc.data().role !== newRole) {
      await updateDoc(userRef, { role: newRole });

      return {
        success: true,
        message: "User role updated successfully",
      };
    } else {
      throw new Error("New role should be different from the current one");
    }
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};