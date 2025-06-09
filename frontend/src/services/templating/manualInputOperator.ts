import { Operator } from "./operatorType";

const manualInputOperator: Operator = {
  id: "manual-input",
  type: "manual-input",
  title: "Manual Input",
  description: "Manually input data",
  category: "input",
  inputs: [],
  outputs: [],
  config: {
    variables: [],
    steps: [],
  },
};

export default manualInputOperator;
