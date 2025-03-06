import bcrypt from "bcrypt";
export const compare = ({ data, hashData }) => {
  return bcrypt.compareSync(data, hashData);
};
