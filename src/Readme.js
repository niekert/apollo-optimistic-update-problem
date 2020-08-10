import React from "react";

export function Readme() {
  return (
    <>
      <h1>Apollo Client Issue Reproduction</h1>
      <p>
        This app demonstrates that when an item is added to a list in
        `cache.modify`, each of the items in that list Lose theire referential
        equality, leading to too many re-renders of each item in the list.
        <br />
        <br />
        To reproduce the issue:
      </p>
      <ul>
        <li>
          Click on "Add Message (causes re-renders) - notice how each item in
          the list has to be re-rendered
        </li>
        <li>
          Click on "Add Message (only added item re-renders) - the items dont
          lose their referential equality
        </li>
        <li>Observe the cache updater fn</li>
      </ul>
    </>
  );
}
