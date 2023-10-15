import { useSelector } from "react-redux";

function Customer() {
  /** Get as much data from the store as you can from this function
   *  - useSelector basically creates a subscription to the store
   *  - thus whenever the store changes - this component (that is
   *    subscribed to the store) will re-render
   *  - redux also does performance optimization behind the scenes similar to
   *    what we talked about in the Context API
   */
  const customer = useSelector((store) => store.customer.fullName);

  return <h2>👋 Welcome, {customer}</h2>;
}

export default Customer;
