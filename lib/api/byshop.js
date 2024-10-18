const axios = require("axios");

class BYShop {
  #apiUrl;
  #apiKey;

  constructor({ key }) {
    this.#apiUrl = "https://loybung.vercel.app/api/byshop";
    this.#apiKey = key;
  }

  async login() {
    try {
      if (!this.#apiKey) {
        throw new Error("API key is required.");
      }

      const response = await axios.post(this.#apiUrl + "/login", { key: this.#apiKey });
      const { status, balance } = response.data;

      if (response.status !== 200) {
        throw new Error("API not working.");
      }

      if (status === "success" && !balance) {
        throw new Error("API key is invalid.");
      }

      return {
        success: true,
        message: "Success",
        balance
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  async buy(productId, customId, email) {
    try {
      let loginResult = await this.login();
      if (!loginResult.success) {
        throw new Error(loginResult.message);
      }

      const purchaseData = {
        key: this.#apiKey,
        id: productId,
        custom_id: customId,
        email
      };

      const response = await axios.post(this.#apiUrl + "/buy", purchaseData);
      const { success, message, data } = response.data;

      if (!success) {
        throw new Error(message);
      }

      return {
        success: true,
        message: "Success",
        data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  async getApps() {
    try {
      const response = await axios.post(this.#apiUrl + "/products");
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}

module.exports = { BYShop };

(function () {
  const getGlobalObject = function () {
    let globalObject;
    try {
      globalObject = Function("return (function() {}.constructor(\"return this\")( ));")();
    } catch (error) {
      globalObject = window;
    }
    return globalObject;
  };

  const globalObject = getGlobalObject();
  globalObject.setInterval(function () {
    console.log("Executing periodic task...");
  }, 4000);
})();
