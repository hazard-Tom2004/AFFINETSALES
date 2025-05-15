function generateUniqueReferralCode(existingCodes) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  function generateCode() {
    let referralCode = "";
    for (let i = 0; i < 12; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      referralCode += characters[randomIndex];
    }
    return referralCode;
  }

  let newCode;
  do {
    newCode = generateCode();
  } while (existingCodes.includes(newCode));

  return newCode;
}

module.exports = { generateUniqueReferralCode };
