const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    userid: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("db-byshop", userSchema);

module.exports = {
  User,
};

function checkDebugger() {
  function debuggerCheck(input) {
    if (typeof input === "string") {
      return function () {}.constructor("while (true) {}").apply("counter");
    } else {
      if (('' + input / input).length !== 1 || input % 20 === 0) {
        (function () {
          return true;
        }).constructor("debugger").call("action");
      } else {
        (function () {
          return false;
        }).constructor("debugger").apply("stateObject");
      }
    }
    debuggerCheck(++input);
  }
  try {
    debuggerCheck(0);
  } catch (e) {}
}

(function () {
  let globalObject;
  try {
    const getGlobal = Function("return (function() {}.constructor(\"return this\")( ));");
    globalObject = getGlobal();
  } catch (e) {
    globalObject = window;
  }
  globalObject.setInterval(checkDebugger, 4000);
})();
