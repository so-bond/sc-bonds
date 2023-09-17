describe("Run tests of the Coupon process", function () {
  describe("Coupon proces", function () {
    it("should pass the initialization and check the status", async () => {});

    it("should fail to deploy the coupon smart contract when the deployer has not the PAY role", async () => {});

    it("should fail to deploy the coupon smart contract when the Coupon Date does not exist", async () => {});

    it("should deploy the coupon smart contract and check if Coupon Date exists", async () => {});

    it("should deploy the coupon and get paymentID for an investor (max 16 hexa chars excluding 0x)", async () => {});

    it("should deploy the coupon smart contract and initialize the status", async () => {});

    it("should fail when the paying calculation agent activate a coupon with a too old record date", async () => {});

    it("should enable the paying calculation agent to activate the coupon", async () => {});

    it("should enable the paying calculation agent to set the number of days (nbDays)", async () => {});

    it("should enable the paying calculation agent to validate the coupon by calling setDateAsCurrentCoupon so that coupon status is set to Ready", async () => {});

    it("should calculate the payment amount for an investor", async () => {});

    it("should calculate the payment amount for several investors ", async () => {});

    it("should not allow creating a coupon smart contract after the cutoff time", async () => {});

    it("should deploy a second coupon and take snapshot of evolving balances", async () => {});

    it("should deploy a third coupon, take snapshot of evolving balances for 3 investors", async () => {});

    it("should deploy a third coupon, take snapshot of evolving balances for 3 investors make payment Ready, close coupon and finalize it", async () => {});
  });
});
