import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  balance: 0,
  loan: 0,
  loanPurpose: "",
  isLoading: false,
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    deposit(state, action) {
      state.balance += action.payload;
      state.isLoading = false;
    },
    withdraw(state, action) {
      state.balance -= action.payload;
    },
    requestLoan: {
      prepare(amount, purpose) {
        return {
          payload: { amount, purpose },
        };
      },

      reducer(state, action) {
        if (state.loan > 0) return;

        state.loan = action.payload.amount;
        state.loanPurpose = action.payload.purpose;
        state.balance += action.payload.amount;
      },
    },
    payLoan(state) {
      state.balance -= state.loan;
      state.loan = 0;
      state.loanPurpose = "";
    },
    convertingCurrency(state) {
      state.isLoading = true;
    },
  },
});

// will see the reducer function and actions with some other things if log to console
console.log(accountSlice);

// Automatic Action Creators from RTK
export const { withdraw, requestLoan, payLoan } = accountSlice.actions;

/** THUNKS are automatically provided our of the redux toolkit so this works out of the box
 *  - We are going to implement here in a NON RTK way by creating our own Action Creator and this is fine too
 *  - just be sure not to export that above in the automatic Action Creator ^^
 *  - Below is our own Action Creator for Deposit using THUNKS
 *  - Just be sure the function name (deposit) and action type (type: "account/deposit") has the correct shape defined above
 */
export function deposit(amount, currency) {
  /** if currency is USD - dispatch object immediately to store */
  if (currency === "USD") return { type: "account/deposit", payload: amount };

  /** if currency is NOT USD - dispatch a function to middleware THUNK
   *  - returning a function tells redux this is the async function we want to run before dispatch action to store
   *  - in order to later dispatch this function that redux will call internally need to pass in as arg with state
   */
  return async function (dispatch, getState) {
    /** can actually dispatch actions as we please right here in the middleware
     *  - example to indicate loading spinner dispatch the following action
     *  - once dispatch action for deposit after middleware completes will handle setting back to false
     */
    dispatch({ type: "account/convertingCurrency" });
    // API call
    const host = "api.frankfurter.app";
    const res = await fetch(
      `https://${host}/latest?amount=${amount}&from=${currency}&to=USD`
    );
    const data = await res.json();
    const converted = data.rates.USD;
    // dispatch (return not needed here) the action that we have delayed until after the async call to convert
    // hence the reason for needing access to the dispatch function
    dispatch({ type: "account/deposit", payload: converted });
  };
}

// export default reducer
export default accountSlice.reducer;
