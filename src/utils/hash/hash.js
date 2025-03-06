import bcrypt from "bcrypt";
export const hash = ({ data, saltRound = 8 }) => {
  return bcrypt.hashSync(data, saltRound);
};
