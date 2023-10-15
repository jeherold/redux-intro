import { connect } from "react-redux";

function formatCurrency(value) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function BalanceDisplay({ balance }) {
  return <div className="balance">{formatCurrency(balance)}</div>;
}

/** MAY SEE THIS IN OLD CODE BASES FROM BEFORE REACT HOOKS EXISTED
 *  - EXAMPLE ONLY SO YOU UNDERSTAND WHEN YOU MIGHT SEE IT
 *  = There was no other way of getting the state into the component
 */
/** need to pass mapStateToProps through the connect */
function mapStateToProps(state) {
  return {
    // this will be the name of the prop for the BalanceDisplay comp (map state from our store to this comp prop)
    balance: state.account.balance,
  };
}
/** May see connect (react redux) used in NON MODERN code bases
 *  - the connect function will return a new function
 *  - BalanceDisplay will become the argument of the new function
 */
export default connect(mapStateToProps)(BalanceDisplay);
