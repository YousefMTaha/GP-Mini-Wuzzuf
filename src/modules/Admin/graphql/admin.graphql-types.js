import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";

export const UserType = new GraphQLObjectType({
  name: "User",
  fields: {
    _id: { type: GraphQLID },
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    username: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    role: { type: new GraphQLNonNull(GraphQLString) },
  },
});

export const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: {
    _id: { type: GraphQLID },
    companyName: { type: new GraphQLNonNull(GraphQLString) },
    industry: { type: GraphQLString },
    companyEmail: { type: new GraphQLNonNull(GraphQLString) },
    approvedByAdmin: { type: new GraphQLNonNull(GraphQLBoolean) },
  },
});

export const AllDataResponseType = new GraphQLObjectType({
  name: "AllDataResponse",
  fields: {
    users: { type: new GraphQLList(UserType) },
    companies: { type: new GraphQLList(CompanyType) },
  },
});
