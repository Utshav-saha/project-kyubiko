const mockSignupAPI = (userData,action) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate a check (e.g., username 'admin' is taken)
      if (userData.username === 'admin') {
        reject("Username already taken!");
      } else {
        resolve(`${action} Successful!`);
      }
    }, 2000); 
  });
};

// ADD THIS LINE AT THE BOTTOM
export default mockSignupAPI;