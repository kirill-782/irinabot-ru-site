import { useApiAuth } from "./hooks/useApiAuth";

function AfterContextApp(props) {
  useApiAuth();

  return props.children;
}

export default AfterContextApp;
