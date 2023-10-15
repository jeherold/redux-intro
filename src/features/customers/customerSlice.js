import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  fullName: "",
  nationalId: "",
  createdAt: "",
};

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    createCustomer: {
      // user prepare for side effects like generating random ids or like new Date below
      // in objects modern js - note the below is the same as writing prepare: function(fullName, nationalId) {}
      prepare(fullName, nationalId) {
        return {
          payload: {
            fullName,
            nationalId,
            // do side effects in the prepare and NOT in the reducer
            createdAt: new Date().toISOString(),
          },
        };
      },

      reducer(state, action) {
        state.fullName = action.payload.fullName;
        state.nationalId = action.payload.nationalId;
        state.createdAt = action.payload.createdAt;
      },
    },
    updateName(state, action) {
      state.fullName = action.payload;
    },
  },
});

console.log(customerSlice);

export const { createCustomer, updateName } = customerSlice.actions;

export default customerSlice.reducer;
