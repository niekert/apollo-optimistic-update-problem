import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLBoolean
} from "graphql";

const MessageType = new GraphQLObjectType({
  name: "Message",
  fields: {
    id: { type: GraphQLID },
    content: { type: GraphQLString }
  }
});

class Message {
  constructor(id, content) {
    this.id = id;
    this.content = content;
  }
}

const conversationType = new GraphQLObjectType({
  name: "Conversation",
  fields: {
    id: { type: GraphQLID },
    messages: {
      type: GraphQLList(MessageType)
    }
  }
});

const makeMessages = count =>
  Array.from({ length: count }, (_, i) => {
    return new Message(`${i}-text-message`, `This is the ${i}th text message`);
  });

const conversation = {
  id: 5,
  messages: makeMessages(100)
};

const QueryType = new GraphQLObjectType({
  name: "Query",
  fields: {
    conversation: {
      type: conversationType,
      resolve: () => {
        return conversation;
      }
    }
  }
});

let mutationMessagesCount = 1000;
const MutationType = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    removeMessage: {
      type: GraphQLBoolean,
      resolve() {
        return true;
      }
    },
    sendMessage: {
      type: MessageType,
      resolve() {
        return new Message(
          mutationMessagesCount++,
          "This was a mutated message"
        );
      }
    }
  }
});

export const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType
});
