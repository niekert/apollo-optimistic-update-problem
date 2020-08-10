import React from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { Readme } from "./Readme";
import { isEqual } from "react-fast-compare";

const MESSAGE_FRAGMENT = gql`
  fragment MessageFragment on Message {
    id
    content
  }
`;

const CONVERSATION = gql`
  query Conversation {
    conversation {
      id
      messages {
        ...MessageFragment
      }
    }
  }
  ${MESSAGE_FRAGMENT}
`;

const SEND_MESSAGE_MUTATION = gql`
  mutation sendMessage {
    sendMessage {
      ...MessageFragment
    }
  }

  ${MESSAGE_FRAGMENT}
`;

const useSendMessageEdgeMutation = (
  conversationId,
  { useOptimisticResponse = true }
) => {
  return useMutation(SEND_MESSAGE_MUTATION, {
    optimisticResponse: useOptimisticResponse
      ? () => ({
          sendMessage: {
            __typename: "Message",
            id: Date.now(),
            content: "New message optimistic"
          }
        })
      : undefined,
    update: (cache, result) => {
      cache.modify({
        id: cache.identify({
          __typename: "Conversation",
          id: conversationId
        }),
        broadcast: true,
        fields: {
          messages: existingMessages => {
            const newMessageRef = cache.writeFragment({
              fragmentName: "MessageFragment",
              fragment: MESSAGE_FRAGMENT,
              data: result.data.sendMessage
            });

            return [newMessageRef, ...existingMessages];
          }
        }
      });
    }
  });
};

const areEqual = (prev, next) => {
  if (
    prev.message.id === next.message.id &&
    prev.__typename === next.__typename
  ) {
    return true;
  }

  return false;
};

// The message is React.memo'd. Whenever a message has to re-render
// We call the "countRender" fn which counts the number of re-renders
const Message = React.memo(({ message, countRender }) => {
  console.log("update");
  React.useEffect(() => {
    countRender();
  });

  if (message.__typename === "ImageMessage") {
    return <div style={{ border: "1px solid blue " }}>{message.src}</div>;
  }

  return <div style={{ border: "1px solid red " }}>{message.content}</div>;
}, areEqual);

export default function App() {
  const { loading, data } = useQuery(CONVERSATION);
  const [renderCount, setRenderCount] = React.useState(0);

  const conversation = data?.conversation;

  // Using this mutation, will cause each of the items in the list re-render
  const [sendMessageCausingRerender] = useSendMessageEdgeMutation(
    conversation?.id,
    { useOptimisticResponse: true }
  );

  // This mutation updates the cache with a hard-coded result. Not every message has to re-render
  const [sendMessageOnlyUpdatingAddedItem] = useSendMessageEdgeMutation(
    conversation?.id,
    { useOptimisticResponse: false }
  );

  const countRender = React.useCallback(() => {
    setRenderCount(v => v + 1);
  }, []);

  return (
    <main>
      <Readme />
      <h2>Message render count after action: {renderCount}</h2>
      <div style={{ display: "flex" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <button
            onClick={() => {
              setRenderCount(0);
              sendMessageCausingRerender();
            }}
          >
            Add a message (causes re-renders)
          </button>
          <button
            onClick={() => {
              setRenderCount(0);
              sendMessageOnlyUpdatingAddedItem();
            }}
          >
            Add a message (Only added item re-renders)
          </button>
        </div>
      </div>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div style={{ display: "flex" }}>
          <div>
            <h3>message edges</h3>
            {conversation?.messages.map(message => (
              <Message
                key={message.id}
                message={message}
                countRender={countRender}
              />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
