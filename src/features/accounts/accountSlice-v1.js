const initialStateAccount = {
  balance: 0,
  loan: 0,
  loanPurpose: "",
  isLoading: false,
};

export default function accountReducer(state = initialStateAccount, action) {
  switch (action.type) {
    /** statedomain-actionname */
    case "account/deposit":
      return {
        ...state,
        balance: state.balance + action.payload,
        isLoading: false,
      };
    case "account/withdraw":
      return { ...state, balance: state.balance - action.payload };
    case "account/requestLoan":
      return {
        ...state,
        loan: action.payload.amount,
        loanPurpose: action.payload.purpose,
        balance: state.balance + action.payload.amount,
      };
    case "account/payLoan":
      return {
        ...state,
        loan: 0,
        loanPurpose: "",
        balance: state.balance - state.loan,
      };
    case "account/convertingCurrency":
      return { ...state, isLoading: true };
    default:
      // redux advises not to throw error here but to return the orig state
      return state;
  }
}

/** Action Creators */
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
export function withdraw(amount) {
  return { type: "account/withdraw", payload: amount };
}
export function requestLoan(amount, purpose) {
  return { type: "account/requestLoan", payload: { amount, purpose } };
}
export function payLoan() {
  return { type: "account/payLoan" };
}
