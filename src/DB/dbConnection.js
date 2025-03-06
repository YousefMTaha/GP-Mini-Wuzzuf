import mongoose from "mongoose";

export const dbConnection = async () => {
  await mongoose
    .connect(process.env.DB_URL)
    .then(() => {
      console.log(`db connected `);
    })
    .catch((err) => {
      console.log({ msg: "fail connect to db", err });
    });
};
