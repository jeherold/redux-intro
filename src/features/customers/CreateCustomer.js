import { useState } from "react";
import { useDispatch } from "react-redux";

import { createCustomer } from "./customerSlice";

function Customer() {
  const [fullName, setFullName] = useState("");
  const [nationalId, setNationalId] = useState("");

  /** useDispatch returns the dispatch function to us
   *  - it then works exactly as it did before
   */
  const dispatch = useDispatch();

  function handleClick() {
    if (!fullName || !nationalId) return;
    /** This is where our Action Creators that are in the slices come into play again */
    dispatch(createCustomer(fullName, nationalId));
  }

  return (
    <div>
      <h2>Create new customer</h2>
      <div className="inputs">
        <div>
          <label>Customer full name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div>
          <label>National ID</label>
          <input
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value)}
          />
        </div>
        <button onClick={handleClick}>Create new customer</button>
      </div>
    </div>
  );
}

export default Customer;
