import { GraphQLSchema, GraphQLObjectType } from "graphql";
import { AllDataResponseType } from "./admin.graphql-types.js";
import userModel, { roles } from "../../../DB/models/user.model.js";
import { authenticate } from "../../../graphql/auth.js";
import companyModel from "../../../DB/models/company.model.js";

export const adminGraphqlSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      allData: {
        type: AllDataResponseType,
        description: "Get all users and companies data",
        resolve: async (parent, args, context) => {
          await authenticate(roles.ADMIN)(context.req);

          const users = await userModel
            .find()
            .select("firstName lastName username email role");

          const companies = await companyModel
            .find()
            .select("companyName industry companyEmail approvedByAdmin");

          return { users, companies };
        },
      },
    },
  }),
});
