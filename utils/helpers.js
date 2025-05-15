function getRank(ref) {
  if (ref >= 0 && ref <= 49) return "Beginner";
  if (ref >= 50 && ref <= 99) return "Senior";
  if (ref >= 100 && ref <= 149) return "Enthusiast";
  if (ref >= 150 && ref <= 199) return "Intermediate";
  if (ref >= 200 && ref <= 299) return "Advanced";
  if (ref >= 300 && ref <= 449) return "Professional";
  if (ref >= 450 && ref <= 549) return "Expert";
  if (ref >= 550 && ref <= 699) return "Leader";
  if (ref >= 700 && ref <= 999) return "Veteran";
  if (ref >= 1000 && ref <= 1999) return "Master";
  if (ref >= 2000 && ref <= 2999) return "Ultimate";
  if (ref >= 3000 && ref <= 3999) return "Sapphire";
  if (ref >= 4000 && ref <= 4999) return "Emerald";
  if (ref >= 5000) return "Ambassador";

  return "Invalid ref"; // Handles negative or out-of-range numbers
}

module.exports = { getRank };
