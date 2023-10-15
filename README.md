# React Redux BEFORE Modern Redux Toolkit (RTK) with THUNKS

- store-v2-redux-thunk.js

## Rules for the Store

- Reducers need to be pure functions with NO side effects
- No asynchronous operations thus NO API calls in the reducer
- By itself a redux store doesnt know anything about performing asynchronous logic
- the redux store only knows how to dispatch SYNCHRONOUS actions and update the state
- therefor any API calls need to happen outside the reducer

### This is possible to do but not ideal since we want to keep our components clean and free from data fetching:

- (Not ideal) - fetch data inside the component and then dispatch an action to the store with the received data

### But we do want our important data fetching logic encapsulated somewhere

- This is where MIDDLEWARE comes into action
- with redux - Middleware is a function that sits between dispatching the action and the store.
- allows us to run code AFTER dispatching, but BEFORE reaching the reducer in the store.
- Thus, middleware is the perfect place for asynchronous operations

## Middleware - Is where to make Asynchronous Calls and things with side effect

- Perfect for asynchronous code
- API calls, timers, logging, etc
- The place for side effects

#### We can write middleware ourselves but it usually comes in the form of 3rd party packages

- Redux THUNK is the most popular middleware.
- with THUNK - the action will not get immediately dispatched to the store but will first go through the middleware(THUNK).
- we can perform some async operation and as soon as the data arrives - we dispatch the action into the store where the state will immediately get updated.

#### We use THUNK to defer dispatching the action into the future at the point where the data we actually need has arrived.

- in the app we will use this to call an API to convert the currency to US dollars if a diff currency is selected when the user deposits money.

#### 3 Steps

1. Install the middleware package
2. Apply the middleware to the store
3. Use the middleware in our action creator functions

Steps 1 and 2:

```js
import { applyMiddleware, combineReducers, createStore } from "redux";
import thunk from "redux-thunk";

import accountReducer from "./features/accounts/accountSlice";
import customerReducer from "./features/customers/customerSlice";

const rootReducer = combineReducers({
  account: accountReducer,
  customer: customerReducer,
});

/** letting our store know we want to use thunk middlewar in our application */
const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;
```

Step 3:

- when a function is dispatched rather than an event object - redux will know that is the thunk
- it will then execute that function and not immediately dispatch the action to the store

### Install redux dev tools

1. Install Chrome Redux DevTools
2. npm i redux-devtools-extension
3. In store - import { composeWithDevTools }
4. wrap the applyMiddleware method in composeWithDevTools
5. You will now have a new tab in chrome for Redux in dev tools

```js
import { applyMiddleware, combineReducers, createStore } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";

import accountReducer from "./features/accounts/accountSlice";
import customerReducer from "./features/customers/customerSlice";

const rootReducer = combineReducers({
  account: accountReducer,
  customer: customerReducer,
});

/** letting our store know we want to use thunk middlewar in our application */
const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(thunk))
);

export default store;
```

SEE Section 20 - Video 272 for demo of redux dev tools

#### Dispatch some actions to see results in the dev tools

# Redux Toolkit

```
 npm i @reduxjs/toolkit
```

- can upgrade gradually to redux toolkit - meaning you can have redux thunk setup in some parts of the app and redux toolkit in other parts

- convert redux-thunk setup to redux toolkit:
- this conversion of the store will have our store working exactly as before in store v2 setup

```js
import { configureStore } from "@reduxjs/toolkit";

import accountReducer from "./features/accounts/accountSlice";
import customerReducer from "./features/customers/customerSlice";

const store = configureStore({
  reducer: {
    account: accountReducer,
    customer: customerReducer,
  },
});

export default store;
```

### Redux toolkits also makes writing the slices easier

- saving redux thunk version of accountSLice in a v1
- will recreate using redux toolkit in accountSlice.js

- RTK - has createSlice baked right in

1. It will automatically create Action Creators from our reducers
2. It makes writing the reducers a lot easier because we no longer need the switch statement and the default case is already handled
3. We can actually now mutate our state inside reducers

- this uses a library called Immer behind the scenes that will convert our logic back to immutable logic
- so behind the scenes Redux still requires logic where we do not mutate the state (in the switch statements) but we can not convert this kind of logic to a mutating logic
- that is prolly one of the biggest advantages of RTK
- RTK may force into a pattern that is maybe a too opinionated way but it is the recommended way of using redux right now

- converting here: we basically create the reducer with what we want to happen for each action

1. Conversion leaving our the middleware THUNK logic 1st:

```js
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
    },
    withdraw(state, action) {
      state.balance -= action.payload;
    },
    requestLoan(state, action) {
      if (state.loan > 0) return;

      state.loan = action.payload.aount;
      state.loanPurpose = action.payload.purpose;
      state.balance += action.payload.amount;
    },
    payLoan(state, action) {
      state.balance -= state.loan;
      state.loan = 0;
      state.loanPurpose = "";
    },
  },
});

// will see the reducer function and actions with some other things if log to console
console.log(accountSlice);

// export actions
export const { deposit, withdraw, requestLoan, payLoan } = accountSlice.actions;

// export default reducer
export default accountSlice.reducer;
```

NOTES for ^^ above: By default - the action creators that auto created only accept one argument and the first argument will become action.payload

- therefor we need to prepare the object before it reaches the reducer
- need to always setup the prepare to return the object that will become the action.payload if we need more than one argument in the action creator
- you can also pass the object direction in the action call but the prepare setup is the convention
- see the requestLoan in accountSlice with proper setup to handle 2 args:
- Worth noting that Jonas prefers the non RTK setup for simple cases - more clear what is going on than everything happening behind the scenes with RTK but that is the trade-off from a do whatever you want approach vs an opinionated approach that comes with using RTK
- but the store setup is much cleaner and Jonas does like that setup for configuring the store.

```js
    requestLoan: {
      prepare(amount, purpose) {
        return {
          payload: { amount, purpose },
        };
      },

      reducer(state, action) {
        if (state.loan > 0) return;

        state.loan = action.payload.aount;
        state.loanPurpose = action.payload.purpose;
        state.balance += action.payload.amount;
      },
    },
```

2. Conversion with the middleware THUNK logic:

- there is a createAsyncThunk function but Jonas says it is more setup than is necessary when only this setup is needed.
  (we will see the built in function in a future project)

```js
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
```

### Convert the Customer SLice to RTK way as well:

```js
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
```

# Comparing CONTEXT API vs REDUX

- Some See CONEXT API + useReducer as a replacement for REDUX
- but lets compare using the facts.
- see slide for section 20 - Video 278
